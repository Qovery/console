import { splitAnsiTextOnMatches, stripAnsi } from './ansi-text-matches'

const GREEN = '\u001b[32m'
const RESET = '\u001b[0m'

describe('stripAnsi', () => {
  it('removes the color codes', () => {
    expect(stripAnsi(`${GREEN}✓ built${RESET} in 8.80s`)).toBe('✓ built in 8.80s')
  })
})

describe('splitAnsiTextOnMatches', () => {
  it('splits the text around every match, ignoring case', () => {
    expect(splitAnsiTextOnMatches('Pushing layer, pushed layer', 'LAYER')).toEqual([
      { text: 'Pushing ', isMatch: false },
      { text: 'layer', isMatch: true },
      { text: ', pushed ', isMatch: false },
      { text: 'layer', isMatch: true },
    ])
  })

  it('keeps the colors of the text around the matches', () => {
    expect(splitAnsiTextOnMatches(`${GREEN}✓ built${RESET} in 8.80s`, 'built in')).toEqual([
      { text: `${GREEN}✓ `, isMatch: false },
      { text: 'built in', isMatch: true },
      { text: `${GREEN}${RESET} 8.80s`, isMatch: false },
    ])
  })

  it('highlights the matches of the text shown when lowercasing changes its length', () => {
    // `İ` lowercases to two characters
    expect(splitAnsiTextOnMatches('İzmir port', 'PORT')).toEqual([
      { text: 'İzmir ', isMatch: false },
      { text: 'port', isMatch: true },
    ])
    expect(splitAnsiTextOnMatches('İzmir, İstanbul', 'İ')).toEqual([
      { text: 'İ', isMatch: true },
      { text: 'zmir, ', isMatch: false },
      { text: 'İ', isMatch: true },
      { text: 'stanbul', isMatch: false },
    ])
  })

  it('returns the whole text without query', () => {
    expect(splitAnsiTextOnMatches(`${GREEN}done`, ' ')).toEqual([{ text: `${GREEN}done`, isMatch: false }])
  })
})
