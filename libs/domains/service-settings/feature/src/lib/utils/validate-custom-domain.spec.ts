import { validateCustomDomain } from './validate-custom-domain'

describe('validateCustomDomain', () => {
  it.each(['app.example.com', 'example.io', '*.customers.example.com', 'xn--bcher-kva.example.de'])(
    'accepts %s',
    (domain) => expect(validateCustomDomain(domain)).toBe(true)
  )

  it.each([
    ['rmnbrd-test-01', 'Enter a full domain name, such as app.example.com.'],
    ['example.c', 'Enter a full domain name, such as app.example.com.'],
    ['a.com', 'Enter a full domain name, such as app.example.com.'],
    ['app.example.c0m', 'Enter a full domain name, such as app.example.com.'],
    ['https://app.example.com', 'Enter the domain without http:// or https://.'],
    ['app.example.com/path', "A domain can't contain spaces or slashes."],
    ['app example.com', "A domain can't contain spaces or slashes."],
    ['App.Example.com', 'Use lowercase letters only.'],
  ])('refuses %s', (domain, message) => expect(validateCustomDomain(domain)).toBe(message))
})
