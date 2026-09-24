import { findHighlightRanges, formatObjectLogMessage } from './format-object-log-message'

describe('formatObjectLogMessage', () => {
  it('formats a JSON object with two-space indentation', () => {
    expect(formatObjectLogMessage('{"message":"Started","context":{"attempt":2},"ports":[80,443]}').message).toBe(`{
  "message": "Started",
  "context": {
    "attempt": 2
  },
  "ports": [
    80,
    443
  ]
}`)
  })

  it('preserves numeric literals and duplicate keys', () => {
    expect(formatObjectLogMessage('{"id":9007199254740993,"decimal":42.0,"exponent":1e3,"key":1,"key":2}').message)
      .toBe(`{
  "id": 9007199254740993,
  "decimal": 42.0,
  "exponent": 1e3,
  "key": 1,
  "key": 2
}`)
  })

  it('preserves whitespace and escaped characters inside strings', () => {
    expect(formatObjectLogMessage('{"message":"keep  spaces, braces { } and \\"quotes\\""}').message).toBe(`{
  "message": "keep  spaces, braces { } and \\"quotes\\""
}`)
  })

  it.each([
    ['invalid JSON', '{"message":"Started"'],
    ['an array', '["Started"]'],
    ['a string', '"Started"'],
    ['a number', '42'],
    ['a boolean', 'true'],
    ['null', 'null'],
    ['plain text', 'Started successfully'],
  ])('keeps %s unchanged', (_description, message) => {
    expect(formatObjectLogMessage(message)).toEqual({ message })
  })

  it('maps a raw compact match to its formatted range', () => {
    const rawMessage = '{"message":"Started","attempt":2}'
    const formattedLogMessage = formatObjectLogMessage(rawMessage)
    const ranges = findHighlightRanges(rawMessage, formattedLogMessage, '"message":"Started"')

    expect(ranges).toEqual([{ start: 4, end: 24 }])
    expect(formattedLogMessage.message.slice(ranges[0]?.start, ranges[0]?.end)).toBe('"message": "Started"')
  })

  it('finds case-insensitive matches in plain-text messages', () => {
    const rawMessage = 'Started successfully'

    expect(findHighlightRanges(rawMessage, formatObjectLogMessage(rawMessage), 'started')).toEqual([
      { start: 0, end: 7 },
    ])
  })
})
