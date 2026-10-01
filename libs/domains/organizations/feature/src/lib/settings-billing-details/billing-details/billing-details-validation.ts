import { EU_COUNTRY_CODES } from '@qovery/shared/enums'

const POSTAL_CODE_PATTERNS: Partial<Record<string, RegExp>> = {
  AT: /^\d{4}$/,
  BE: /^\d{4}$/,
  BG: /^\d{4}$/,
  CY: /^\d{4}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  DE: /^\d{5}$/,
  DK: /^\d{4}$/,
  EE: /^\d{5}$/,
  ES: /^\d{5}$/,
  FI: /^\d{5}$/,
  FR: /^\d{5}$/,
  GR: /^\d{3}\s?\d{2}$/,
  HR: /^\d{5}$/,
  HU: /^\d{4}$/,
  IE: /^(?:D6W|[AC-FHKNPRTV-Y]\d{2})\s?[0-9AC-FHKNPRTV-Y]{4}$/i,
  IT: /^\d{5}$/,
  LT: /^(?:LT-)?\d{5}$/i,
  LU: /^\d{4}$/,
  LV: /^(?:LV-)?\d{4}$/i,
  MT: /^[A-Z]{3}\s?\d{4}$/i,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
  PL: /^\d{2}-?\d{3}$/,
  PT: /^\d{4}-?\d{3}$/,
  RO: /^\d{6}$/,
  SE: /^\d{3}\s?\d{2}$/,
  SI: /^\d{4}$/,
  SK: /^\d{3}\s?\d{2}$/,
  US: /^\d{5}(?:-\d{4})?$/,
}

export function validateRequiredField(value: string | null | undefined, message: string) {
  return Boolean(value?.trim()) || message
}

export function validatePostalCode(postalCode: string | null | undefined, countryCode: string) {
  const value = postalCode?.trim() ?? ''

  if (!value) return 'Please provide a postal code'

  const pattern = POSTAL_CODE_PATTERNS[countryCode]

  return !pattern || pattern.test(value) || 'Please provide a valid postal code for the selected country'
}

export function validateVatNumber(vatNumber: string | undefined, countryCode: string) {
  return !EU_COUNTRY_CODES.has(countryCode) || Boolean(vatNumber?.trim()) || 'Please provide a VAT number'
}
