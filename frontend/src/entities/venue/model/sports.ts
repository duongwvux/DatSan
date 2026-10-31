import type { SportType } from './types'

export const SPORTS: Record<SportType, { label: string }> = {
  BADMINTON: { label: 'Cầu lông' },
  PICKLEBALL: { label: 'Pickleball' },
  FOOTBALL_5: { label: 'Bóng đá 5' },
  FOOTBALL_7: { label: 'Bóng đá 7' },
}

export const SPORT_TYPES = Object.keys(SPORTS) as SportType[]
