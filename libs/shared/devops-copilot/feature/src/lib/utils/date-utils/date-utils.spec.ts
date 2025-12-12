import { isToday, isWithinLastSevenDays, isWithinLastThirtyDays, isYesterday } from './date-utils'

describe('date-utils', () => {
  describe('isToday', () => {
    it("should return true for today's date", () => {
      const today = new Date()
      expect(isToday(today)).toBe(true)
    })

    it("should return false for yesterday's date", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for a date in the past', () => {
      const pastDate = new Date('2020-01-01')
      expect(isToday(pastDate)).toBe(false)
    })
  })

  describe('isYesterday', () => {
    it("should return true for yesterday's date", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isYesterday(yesterday)).toBe(true)
    })

    it("should return false for today's date", () => {
      const today = new Date()
      expect(isYesterday(today)).toBe(false)
    })

    it('should return false for a date two days ago', () => {
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      expect(isYesterday(twoDaysAgo)).toBe(false)
    })
  })

  describe('isWithinLastSevenDays', () => {
    it('should return true for a date 3 days ago', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(isWithinLastSevenDays(threeDaysAgo)).toBe(true)
    })

    it('should return false for today', () => {
      const today = new Date()
      expect(isWithinLastSevenDays(today)).toBe(false)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isWithinLastSevenDays(yesterday)).toBe(false)
    })

    it('should return false for a date 8 days ago', () => {
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
      expect(isWithinLastSevenDays(eightDaysAgo)).toBe(false)
    })
  })

  describe('isWithinLastThirtyDays', () => {
    it('should return true for a date 15 days ago', () => {
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      expect(isWithinLastThirtyDays(fifteenDaysAgo)).toBe(true)
    })

    it('should return false for a date 5 days ago (within 7 days)', () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      expect(isWithinLastThirtyDays(fiveDaysAgo)).toBe(false)
    })

    it('should return false for a date 40 days ago', () => {
      const fortyDaysAgo = new Date()
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40)
      expect(isWithinLastThirtyDays(fortyDaysAgo)).toBe(false)
    })

    it('should return false for today', () => {
      const today = new Date()
      expect(isWithinLastThirtyDays(today)).toBe(false)
    })
  })
})
