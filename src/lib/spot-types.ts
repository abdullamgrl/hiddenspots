/**
 * Shared shapes for Supabase join rows. The client isn't using generated DB
 * types, so joined relations come back loosely typed — and depending on the
 * relationship, PostgREST may represent a joined row as an object or a
 * one-element array. `first()` normalizes that.
 */

export interface NameSlug {
  name: string
  slug: string
}

export type Joined<T> = T | T[] | null

export const first = <T,>(v: Joined<T> | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null)

/** Card row after joins are resolved to plain objects (many-to-one FKs). */
export interface SpotCardResolved {
  id: string
  title: string
  slug: string
  cover_image: string
  verification_score: number
  status?: string
  created_at?: string
  best_time_to_visit?: string | null
  state: NameSlug
  district: NameSlug
  category: { name: string }
}

/** Common card-level spot row with joined state/district/category. */
export interface SpotCardRow {
  id: string
  title: string
  slug: string
  cover_image: string
  verification_score: number
  status?: string
  created_at?: string
  best_time_to_visit?: string | null
  latitude?: number
  longitude?: number
  state: Joined<NameSlug>
  district: Joined<NameSlug>
  category: Joined<{ name: string }>
}
