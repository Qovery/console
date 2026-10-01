import { validatePostalCode, validateRequiredField, validateVatNumber } from './billing-details-validation'

describe('billing details validation', () => {
  describe('validateRequiredField', () => {
    it('rejects a whitespace-only value', () => {
      expect(validateRequiredField('   ', 'Required field')).toBe('Required field')
    })

    it('accepts a non-empty trimmed value', () => {
      expect(validateRequiredField(' value ', 'Required field')).toBe(true)
    })

    it('rejects a missing value returned by the billing API', () => {
      expect(validateRequiredField(null, 'Required field')).toBe('Required field')
      expect(validateRequiredField(undefined, 'Required field')).toBe('Required field')
    })
  })

  describe('validatePostalCode', () => {
    it.each([
      ['FR', '75001'],
      ['US', '10001'],
      ['US', '10001-1234'],
    ])('accepts a valid %s postal code', (countryCode, postalCode) => {
      expect(validatePostalCode(postalCode, countryCode)).toBe(true)
    })

    it.each([
      ['FR', '10001-1234'],
      ['US', '7500'],
    ])('rejects an invalid %s postal code', (countryCode, postalCode) => {
      expect(validatePostalCode(postalCode, countryCode)).toBe(
        'Please provide a valid postal code for the selected country'
      )
    })

    it('only requires a value for a country without a supported format', () => {
      expect(validatePostalCode('100-0001', 'JP')).toBe(true)
      expect(validatePostalCode('  ', 'JP')).toBe('Please provide a postal code')
      expect(validatePostalCode(null, 'JP')).toBe('Please provide a postal code')
    })
  })

  describe('validateVatNumber', () => {
    it('requires a VAT number for EU countries', () => {
      expect(validateVatNumber('', 'FR')).toBe('Please provide a VAT number')
    })

    it('accepts an empty VAT number outside the EU', () => {
      expect(validateVatNumber('', 'US')).toBe(true)
    })
  })
})
