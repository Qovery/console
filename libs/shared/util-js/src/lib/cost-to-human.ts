import { currencyDictionary } from '../constants/currency-dictionary'

export const costToHuman = (value = 0, currency = 'USD'): string => {
  // prepend or append the currency symbol to the value and split the value per 3 digits
  const currencySymbol = currencyDictionary[currency]
  return `${currencySymbol}${value}`.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
}
