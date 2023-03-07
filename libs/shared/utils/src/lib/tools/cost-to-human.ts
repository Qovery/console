import { currencyDictionary } from '../constants/currency-dictionaries'

export const costToHuman = (value: number, currency: string): string => {
  if (!value || !currency) return ''

  // prepend or append the currency symbol to the value and split the value per 3 digits
  const currencySymbol = currencyDictionary[currency]
  return `${currencySymbol}${value}`.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}
