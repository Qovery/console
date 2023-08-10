import * as formatModule from 'date-fns-tz'
import { dateFullFormat } from './date'

describe('date', () => {
  it('dateFullFormat', () => {
    Date.now = jest.fn(() => new Date('2023-09-15T10:23:20').getTime())

    const mockFormatInTimeZone = jest.spyOn(formatModule, 'formatInTimeZone')
    mockFormatInTimeZone.mockImplementation(() => '15 Sep, 10:23:20')

    const resultDefault = dateFullFormat('2023-09-15T10:23:20')
    const resultCustomFormat = dateFullFormat('2023-09-15T10:23:20', 'UTC', 'dd/MM/yyyy HH:mm')

    expect(resultDefault).toBe('15 Sep, 10:23:20')
    expect(resultCustomFormat).toBe('15/09/2023 08:23')
  })
})
