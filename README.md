# HiddenSpot — Offbeat Travel Discovery Platform

This is the codebase for **HiddenSpot** (`hiddenspots.in`), a premium travel discovery platform focused on hidden and remote gems in India.

## Setup & Environment Variables

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   # Optional. MapLibre basemap style for the discovery map.
   # Defaults to CARTO dark-matter. Swap for OpenFreeMap or a self-hosted style.
   NEXT_PUBLIC_MAP_STYLE_URL=
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

> [!WARNING]
> **Production Google Maps API Key Protection**:
> Before deploying to production, make sure to restrict your `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to **Websites** in the Google Cloud Console. Enable restrictions only for:
> - `http://localhost:*`
> - `https://hiddenspots.in/*`
> - `https://*.hiddenspots.in/*`

## SMS OTP via httpSMS (free)

Login uses phone OTP. Instead of a paid provider (Twilio etc.), a Supabase
**Send SMS Auth Hook** (a Postgres function) delivers OTPs through
[httpSMS](https://httpsms.com) — an open-source gateway that sends SMS from
your own Android phone's SIM, so OTPs cost ~₹0 on a plan with free SMS.
The app code is provider-agnostic; only this hook knows about httpSMS.

### One-time setup (all in the Supabase Dashboard)

1. **httpSMS**: install the httpSMS app on an Android phone, sign in at
   [httpsms.com](https://httpsms.com), and copy the **API key** from Settings
   (it starts with `uk_` — the `pk_` value is a different credential and will
   be rejected with a 401).
2. **Create the hook function** — SQL Editor → run the statement below after
   filling in the two placeholders. The function lives only in the database;
   never commit the real API key to git.
3. **Enable the hook**: Dashboard → **Authentication → Hooks → Send SMS hook**
   → type **Postgres function** → schema `public`, function
   `send_sms_via_httpsms`.
4. **Phone provider**: Authentication → Providers → Phone stays enabled; the
   Twilio fields are ignored once the hook is active.

```sql
create extension if not exists pg_net;

create or replace function public.send_sms_via_httpsms(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text;
  v_otp text;
  v_api_key text := '<HTTPSMS_API_KEY (uk_...)>';
  v_sender_phone text := '<+91XXXXXXXXXX — the Android phone's own number>';
begin
  -- Documented hook payload: { user: { phone }, sms: { otp } }
  v_phone := event->'user'->>'phone';
  v_otp := event->'sms'->>'otp';

  if v_phone is null or v_otp is null then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 400, 'message', 'Malformed SMS hook payload'));
  end if;

  -- Supabase stores phones without the leading '+'; httpSMS needs E.164
  if left(v_phone, 1) <> '+' then
    v_phone := '+' || v_phone;
  end if;

  -- OTP first in the body helps Android auto-detect the code
  perform net.http_post(
    url := 'https://api.httpsms.com/v1/messages/send',
    headers := jsonb_build_object(
      'x-api-key', v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_sender_phone,
      'to', v_phone,
      'content', v_otp || ' is your HiddenSpot verification code. It expires in 10 minutes.'
    )
  );

  return '{}'::jsonb;
end;
$$;

-- Auth runs hooks as supabase_auth_admin; nobody else may call this
grant usage on schema public to supabase_auth_admin;
grant execute on function public.send_sms_via_httpsms(jsonb) to supabase_auth_admin;
revoke execute on function public.send_sms_via_httpsms(jsonb) from authenticated, anon, public;
```

### Good to know

- **Debugging**: `pg_net` is fire-and-forget — if a login says "OTP sent" but
  nothing arrives, check the last delivery attempt with
  `select status_code, content from net._http_response order by created desc limit 1;`
  (401 = wrong API key; 200 = accepted, check the Android phone is online).
- **Dev without SMS**: add a *test phone number* with a fixed OTP under
  Authentication → Providers → Phone → Test phone numbers — logins with it never
  send a real SMS.
- **Rate limits**: keep Authentication → Rate Limits for SMS conservative
  (e.g. a handful per hour per number) so a bot can't drain the SIM's daily quota.
- **Scaling out**: personal SIMs in India are capped (~100 SMS/day) and bulk
  A2P traffic legally requires DLT registration. When volume grows, point the
  hook's `net.http_post` at an Indian DLT-compliant provider (MSG91 / Textlocal,
  ~₹0.15–0.25 per SMS) — the app code doesn't change, only this function.
- The Android phone must stay on, charged, and online — it *is* the SMS gateway.
