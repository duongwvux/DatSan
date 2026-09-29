import type { SportType } from './types'

export const SPORTS: Record<SportType, { label: string; emoji: string }> = {
  BADMINTON: { label: 'Cầu lông', emoji: '🏸' },
  PICKLEBALL: { label: 'Pickleball', emoji: '🥒' },
  FOOTBALL_5: { label: 'Bóng đá 5', emoji: '⚽' },
  FOOTBALL_7: { label: 'Bóng đá 7', emoji: '🥅' },
}

export const SPORT_TYPES = Object.keys(SPORTS) as SportType[]
