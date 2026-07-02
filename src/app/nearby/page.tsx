import type { Metadata } from 'next'
import { NearbyClient } from '@/components/nearby/nearby-client'

export const metadata: Metadata = {
  title: 'Hidden Spots Near Me | HiddenSpot',
  description:
    'Find community-verified hidden waterfalls, viewpoints, and offbeat spots around your current location, sorted by distance.',
}

export default function NearbyPage() {
  return <NearbyClient />
}
