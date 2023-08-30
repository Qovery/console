import * as formatModule from 'date-fns-tz'
import { dateFullFormat } from './util-datas-dates'

describe('date', () => {
  it('dateFullFormat', () => {
    Date.now = jest.fn(() => new Date('2023-09-15T10:23:20').getTime())

    const mockFormatInTimeZone = jest.spyOn(formatModule, 'formatInTimeZone')
    mockFormatInTimeZone.mockImplementation(() => '15 Sep, 10:23:20')

    const resultDefault = dateFullFormat('2023-09-15T10:23:20')

    expect(resultDefault).toBe('15 Sep, 10:23:20')
  })
})
