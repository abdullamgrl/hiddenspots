# HiddenSpot — Offbeat Travel Discovery Platform

This is the codebase for **HiddenSpot** (`hiddenspot.in`), a premium travel discovery platform focused on hidden and remote gems in India.

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
> - `https://hiddenspot.in/*`
> - `https://*.hiddenspot.in/*`
