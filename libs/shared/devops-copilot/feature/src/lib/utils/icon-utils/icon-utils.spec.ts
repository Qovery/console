import { getIconClass, getIconName } from './icon-utils'

describe('icon-utils', () => {
  describe('getIconName', () => {
    it('should return "check-circle" for completed status', () => {
      expect(getIconName('completed')).toBe('check-circle')
    })

    it('should return "spinner" for in_progress status', () => {
      expect(getIconName('in_progress')).toBe('spinner')
    })

    it('should return "pause-circle" for waiting status', () => {
      expect(getIconName('waiting')).toBe('pause-circle')
    })

    it('should return "exclamation-circle" for error status', () => {
      expect(getIconName('error')).toBe('exclamation-circle')
    })

    it('should return "circle" for unknown status', () => {
      expect(getIconName('unknown')).toBe('circle')
    })
  })

  describe('getIconClass', () => {
    it('should return green color class for completed status', () => {
      const result = getIconClass('completed')
      expect(result).toContain('text-green-500')
    })

    it('should return yellow color and spin animation for in_progress status', () => {
      const result = getIconClass('in_progress')
      expect(result).toContain('animate-spin')
      expect(result).toContain('text-yellow-500')
    })

    it('should return blue color class for waiting status', () => {
      const result = getIconClass('waiting')
      expect(result).toContain('text-blue-500')
    })

    it('should return red color class for error status', () => {
      const result = getIconClass('error')
      expect(result).toContain('text-red-500')
    })

    it('should return gray color class for unknown status', () => {
      const result = getIconClass('unknown')
      expect(result).toContain('text-gray-400')
    })
  })
})
