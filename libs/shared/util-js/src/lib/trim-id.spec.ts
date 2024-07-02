import { trimId } from './trim-id'

describe('trimId', () => {
  it('should truncate in middle with default values', () => {
    expect(trimId('foobarbazquxquux')).toEqual('fooba...uux')
  })
  it('should truncate at start with default values', () => {
    expect(trimId('foobarbazquxquux', 'start')).toEqual('fooba')
  })
  it('should truncate at end with default values', () => {
    expect(trimId('foobarbazquxquux', 'end')).toEqual('uux')
  })
  it('should truncate in middle with custom values', () => {
    expect(trimId('foobarbazquxquux', 'both', { startOffset: 1, endOffset: 1 })).toEqual('f...x')
  })
  it('should truncate at start with custom values', () => {
    expect(trimId('foobarbazquxquux', 'start', { startOffset: 2 })).toEqual('fo')
  })
  it('should truncate at end with custom values', () => {
    expect(trimId('foobarbazquxquux', 'end', { endOffset: 6 })).toEqual('uxquux')
  })
})
