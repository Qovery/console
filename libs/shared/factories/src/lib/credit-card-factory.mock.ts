import { type CreditCard } from 'qovery-typescript-axios'

export const creditCardsFactoryMock = (howMany: number): CreditCard[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    created_at: new Date().toString(),
    last_digit: '4242',
    expiry_year: 2024,
    expiry_month: 12,
    is_expired: false,
    brand: 'MASTERCARD',
  }))
