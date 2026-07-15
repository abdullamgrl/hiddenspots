import type { LucideIcon } from 'lucide-react'
import {
  Footprints,
  Compass,
  Mountain,
  Crown,
  Gem,
  Layers,
  Trophy,
  MapPinned,
  Film,
  PencilLine,
  Star,
  Sunrise,
} from 'lucide-react'

// -------------------------------------------------------------------
// Explorer levels — derived purely from profiles.reputation_score.
// Thresholds are calibrated to the DB economy in
// recalculate_user_reputation() (+10 per approved spot, +20 featured,
// +5 per approved edit/reel): Pathfinder ≈ 4 approved spots,
// Trailblazer ≈ 14, Local Legend ≈ 29. Retune together with the DB.
// -------------------------------------------------------------------

export interface Level {
  name: string
  min: number
  icon: LucideIcon
}

export const LEVELS: readonly Level[] = [
  { name: 'Wanderer', min: 0, icon: Footprints },
  { name: 'Pathfinder', min: 50, icon: Compass },
  { name: 'Trailblazer', min: 150, icon: Mountain },
  { name: 'Local Legend', min: 300, icon: Crown },
] as const

export function explorerLevel(rep: number) {
  let idx = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (rep >= LEVELS[i].min) {
      idx = i
      break
    }
  }
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1] ?? null
  const progress = next
    ? Math.min(100, Math.round(((rep - current.min) / (next.min - current.min)) * 100))
    : 100
  return { current, next, progress }
}

// -------------------------------------------------------------------
// Badges — computed live from real contribution counts, never stored.
// Reputation can go DOWN (rejections, resolved spam reports), so badge
// copy is phrased as current state, never "unlocked on <date>".
// -------------------------------------------------------------------

export interface GamificationInputs {
  approvedSpots: number
  totalSubmissions: number
  districtsExplored: number
  categoriesContributed: number
  approvedReels: number
  approvedEdits: number
  featuredSpots: number
  joinedAt: string
  reputation: number
}

export interface BadgeProgress {
  current: number
  target: number
}

export interface BadgeDef {
  id: string
  name: string
  /** Shown to the owner on locked badges: how to earn it. */
  description: string
  icon: LucideIcon
  earned: (s: GamificationInputs) => boolean
  progress?: (s: GamificationInputs) => BadgeProgress
}

// Founding cohort cutoff for the Early Explorer badge.
const EARLY_EXPLORER_CUTOFF = '2027-01-01'

function countBadge(
  id: string,
  name: string,
  description: string,
  icon: LucideIcon,
  pick: (s: GamificationInputs) => number,
  target: number
): BadgeDef {
  return {
    id,
    name,
    description,
    icon,
    earned: (s) => pick(s) >= target,
    progress: (s) => ({ current: Math.min(pick(s), target), target }),
  }
}

export const BADGES: readonly BadgeDef[] = [
  countBadge('first-gem', 'First Gem', 'Get your first spot approved', Gem, (s) => s.approvedSpots, 1),
  countBadge('gem-collector', 'Gem Collector', 'Get 5 spots approved', Layers, (s) => s.approvedSpots, 5),
  countBadge('keeper-of-ten', 'Keeper of Ten', 'Get 10 spots approved', Trophy, (s) => s.approvedSpots, 10),
  countBadge('district-hopper', 'District Hopper', 'Share approved spots in 3 districts', MapPinned, (s) => s.districtsExplored, 3),
  countBadge('reel-scout', 'Reel Scout', 'Get 3 reels approved', Film, (s) => s.approvedReels, 3),
  countBadge('fact-checker', 'Fact Checker', 'Get 3 edit suggestions approved', PencilLine, (s) => s.approvedEdits, 3),
  countBadge('spotlighted', 'Spotlighted', 'Have a spot featured by moderators', Star, (s) => s.featuredSpots, 1),
  {
    id: 'early-explorer',
    name: 'Early Explorer',
    description: 'Joined during the founding year',
    icon: Sunrise,
    earned: (s) => s.joinedAt < EARLY_EXPLORER_CUTOFF,
  },
] as const

export interface EvaluatedBadge extends BadgeDef {
  isEarned: boolean
  badgeProgress: BadgeProgress | null
}

export function evaluateBadges(inputs: GamificationInputs): EvaluatedBadge[] {
  return BADGES.map((b) => ({
    ...b,
    isEarned: b.earned(inputs),
    badgeProgress: b.progress?.(inputs) ?? null,
  }))
}

/**
 * The single closest unearned badge with measurable progress — the
 * owner's "next goal" nudge. Highest completion ratio wins; ties go to
 * the smaller remaining count so the quickest win surfaces first.
 */
export function nearestBadge(badges: EvaluatedBadge[]): EvaluatedBadge | null {
  const candidates = badges.filter((b) => !b.isEarned && b.badgeProgress)
  if (candidates.length === 0) return null
  return candidates.reduce((best, b) => {
    const bp = b.badgeProgress!
    const bestP = best.badgeProgress!
    const ratio = bp.current / bp.target
    const bestRatio = bestP.current / bestP.target
    if (ratio !== bestRatio) return ratio > bestRatio ? b : best
    return bp.target - bp.current < bestP.target - bestP.current ? b : best
  })
}
