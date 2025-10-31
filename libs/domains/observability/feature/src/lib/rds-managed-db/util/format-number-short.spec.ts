import { formatNumberShort } from './format-number-short'

describe('formatNumberShort', () => {
  describe('numbers less than 1000', () => {
    it('should return the number as string for 0', () => {
      expect(formatNumberShort(0)).toBe('0')
    })

    it('should return the number as string for 1', () => {
      expect(formatNumberShort(1)).toBe('1')
    })

    it('should return the number as string for 999', () => {
      expect(formatNumberShort(999)).toBe('999')
    })
  })

  describe('thousands (k)', () => {
    it('should format 1,000 as 1.0k', () => {
      expect(formatNumberShort(1_000)).toBe('1.0k')
    })

    it('should format 1,500 as 1.5k', () => {
      expect(formatNumberShort(1_500)).toBe('1.5k')
    })

    it('should format 338,483 as 338.5k', () => {
      expect(formatNumberShort(338_483)).toBe('338.5k')
    })

    it('should format 999,999 as 1000.0k', () => {
      expect(formatNumberShort(999_999)).toBe('1000.0k')
    })
  })

  describe('millions (M)', () => {
    it('should format 1,000,000 as 1.0M', () => {
      expect(formatNumberShort(1_000_000)).toBe('1.0M')
    })

    it('should format 1,500,000 as 1.5M', () => {
      expect(formatNumberShort(1_500_000)).toBe('1.5M')
    })

    it('should format 250,000,000 as 250.0M', () => {
      expect(formatNumberShort(250_000_000)).toBe('250.0M')
    })

    it('should format 500,000,000 as 500.0M', () => {
      expect(formatNumberShort(500_000_000)).toBe('500.0M')
    })

    it('should format 999,999,999 as 1000.0M', () => {
      expect(formatNumberShort(999_999_999)).toBe('1000.0M')
    })
  })

  describe('billions (B)', () => {
    it('should format 1,000,000,000 as 1.0B', () => {
      expect(formatNumberShort(1_000_000_000)).toBe('1.0B')
    })

    it('should format 1,200,000,000 as 1.2B', () => {
      expect(formatNumberShort(1_200_000_000)).toBe('1.2B')
    })

    it('should format 1,500,000,000 as 1.5B', () => {
      expect(formatNumberShort(1_500_000_000)).toBe('1.5B')
    })

    it('should format 1,800,000,000 as 1.8B', () => {
      expect(formatNumberShort(1_800_000_000)).toBe('1.8B')
    })

    it('should format 2,000,000,000 as 2.0B', () => {
      expect(formatNumberShort(2_000_000_000)).toBe('2.0B')
    })

    it('should format 2,147,483,647 (max int32) as 2.1B', () => {
      expect(formatNumberShort(2_147_483_647)).toBe('2.1B')
    })
  })

  describe('negative numbers', () => {
    it('should format -1,500 as -1.5k', () => {
      expect(formatNumberShort(-1_500)).toBe('-1.5k')
    })

    it('should format -1,500,000 as -1.5M', () => {
      expect(formatNumberShort(-1_500_000)).toBe('-1.5M')
    })

    it('should format -1,500,000,000 as -1.5B', () => {
      expect(formatNumberShort(-1_500_000_000)).toBe('-1.5B')
    })
  })

  describe('edge cases for PostgreSQL transaction IDs', () => {
    it('should format 100,000,000 (100M transactions) as 100.0M', () => {
      expect(formatNumberShort(100_000_000)).toBe('100.0M')
    })

    it('should format 1,000,000,000 (1B - yellow threshold) as 1.0B', () => {
      expect(formatNumberShort(1_000_000_000)).toBe('1.0B')
    })

    it('should format 1,500,000,000 (1.5B - red threshold) as 1.5B', () => {
      expect(formatNumberShort(1_500_000_000)).toBe('1.5B')
    })

    it('should format 2,000,000,000 (2B - PostgreSQL max) as 2.0B', () => {
      expect(formatNumberShort(2_000_000_000)).toBe('2.0B')
    })
  })
})
