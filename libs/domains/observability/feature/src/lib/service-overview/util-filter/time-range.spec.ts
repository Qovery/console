import { type TimeRangeOption, createTimeRangeHandler, timeRangeOptions } from './time-range'

describe('time-range', () => {
  describe('timeRangeOptions', () => {
    it('should contain all expected time range options', () => {
      expect(timeRangeOptions).toHaveLength(9)

      const expectedOptions = [
        { label: 'Last 5 minutes', value: '5m' },
        { label: 'Last 15 minutes', value: '15m' },
        { label: 'Last 30 minutes', value: '30m' },
        { label: 'Last 1 hour', value: '1h' },
        { label: 'Last 3 hours', value: '3h' },
        { label: 'Last 6 hours', value: '6h' },
        { label: 'Last 12 hours', value: '12h' },
        { label: 'Last 24 hours', value: '24h' },
        { label: 'Last 2 days', value: '2d' },
      ]

      expect(timeRangeOptions).toEqual(expectedOptions)
    })

    it('should have valid value types', () => {
      const validValues: TimeRangeOption[] = ['5m', '15m', '30m', '1h', '3h', '6h', '12h', '24h', '2d']

      timeRangeOptions.forEach((option) => {
        expect(validValues).toContain(option.value)
      })
    })
  })

  describe('createTimeRangeHandler', () => {
    let mockSetTimeRange: jest.Mock
    let mockSetStartDate: jest.Mock
    let mockSetEndDate: jest.Mock
    let handler: ReturnType<typeof createTimeRangeHandler>
    let mockNow: Date

    beforeEach(() => {
      mockSetTimeRange = jest.fn()
      mockSetStartDate = jest.fn()
      mockSetEndDate = jest.fn()

      mockNow = new Date('2024-01-01T12:00:00.000Z')
      jest.useFakeTimers()
      jest.setSystemTime(mockNow)

      handler = createTimeRangeHandler(mockSetTimeRange, mockSetStartDate, mockSetEndDate)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should handle 15m time range', () => {
      handler('15m')

      expect(mockSetTimeRange).toHaveBeenCalledWith('15m')
      expect(mockSetStartDate).toHaveBeenCalledWith('2024-01-01T11:45:00.000Z')
      expect(mockSetEndDate).toHaveBeenCalledWith('2024-01-01T12:00:00.000Z')
    })

    it('should call all setter functions for each time range', () => {
      const timeRanges: TimeRangeOption[] = ['5m', '15m', '30m', '1h', '3h', '6h', '12h', '24h', '2d']

      timeRanges.forEach((range) => {
        jest.clearAllMocks()
        handler(range)

        expect(mockSetTimeRange).toHaveBeenCalledTimes(1)
        expect(mockSetStartDate).toHaveBeenCalledTimes(1)
        expect(mockSetEndDate).toHaveBeenCalledTimes(1)
      })
    })
  })
})
