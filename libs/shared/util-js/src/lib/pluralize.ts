const pluralRules = new Intl.PluralRules('en-US')

// Inspired by https://2ality.com/2019/12/intl-pluralrules.html#a-simple-tool-function-for-pluralization
export function pluralize(count: number, singular: string, plural: string) {
  const grammaticalNumber = pluralRules.select(count)
  switch (grammaticalNumber) {
    case 'one':
      return singular
    case 'other':
      return plural
    default:
      throw new Error('Unknown: ' + grammaticalNumber)
  }
}

export function plural(count: number, singular: string) {
  return pluralize(count, singular, singular + 's')
}
