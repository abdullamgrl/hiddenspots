import {
  Camera,
  Coffee,
  Compass,
  Droplet,
  Droplets,
  Footprints,
  Gem,
  Mountain,
  Sunrise,
  Sunset,
  Tent,
  Umbrella,
  Waves,
  type LucideIcon,
} from 'lucide-react'

// One distinct icon per category slug (previously every card showed a compass).
const ICONS: Record<string, LucideIcon> = {
  waterfalls: Droplets,
  viewpoints: Mountain,
  beaches: Umbrella,
  lakes: Droplet,
  rivers: Waves,
  'trekking-spots': Footprints,
  'camping-spots': Tent,
  'photography-spots': Camera,
  'sunrise-spots': Sunrise,
  'sunset-spots': Sunset,
  'hidden-gems': Gem,
  'tea-spot': Coffee,
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Compass
  return <Icon className={className} />
}
