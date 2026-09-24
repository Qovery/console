import { formatObjectLogMessage } from './format-object-log-message'

describe('formatObjectLogMessage', () => {
  it('formats a JSON object with two-space indentation', () => {
    expect(formatObjectLogMessage('{"message":"Started","context":{"attempt":2},"ports":[80,443]}')).toBe(`{
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

  it.each([
    ['invalid JSON', '{"message":"Started"'],
    ['an array', '["Started"]'],
    ['a string', '"Started"'],
    ['a number', '42'],
    ['a boolean', 'true'],
    ['null', 'null'],
    ['plain text', 'Started successfully'],
  ])('keeps %s unchanged', (_description, message) => {
    expect(formatObjectLogMessage(message)).toBe(message)
  })
})
