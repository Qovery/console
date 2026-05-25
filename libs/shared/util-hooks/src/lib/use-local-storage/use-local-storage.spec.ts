import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from './use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should read JSON values from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('github'))

    const { result } = renderHook(() => useLocalStorage('key', undefined))

    expect(result.current[0]).toBe('github')
  })

  it('should read legacy raw string values without mutating localStorage', () => {
    localStorage.setItem('lastUsedLogin', 'github')

    const { result } = renderHook(() => useLocalStorage<string | undefined>('lastUsedLogin', undefined))

    expect(result.current[0]).toBe('github')
    expect(localStorage.getItem('lastUsedLogin')).toBe('github')
  })

  it('should read legacy current organization id values without mutating localStorage', () => {
    localStorage.setItem('currentOrganizationId', '12345678-1234-1234-1234-123456789abc')

    const { result } = renderHook(() => useLocalStorage('currentOrganizationId', ''))

    expect(result.current[0]).toBe('12345678-1234-1234-1234-123456789abc')
    expect(localStorage.getItem('currentOrganizationId')).toBe('12345678-1234-1234-1234-123456789abc')
  })

  it('should store updated string values as raw strings', () => {
    const { result } = renderHook(() => useLocalStorage<string | undefined>('lastUsedLogin', undefined))

    act(() => {
      result.current[1]('saml_sso')
    })

    expect(localStorage.getItem('lastUsedLogin')).toBe('saml_sso')
  })

  it('should store updated object values as JSON', () => {
    const { result } = renderHook(() => useLocalStorage('qovery-recent-services', {}))

    act(() => {
      result.current[1]({ organization: ['service-id'] })
    })

    expect(localStorage.getItem('qovery-recent-services')).toBe(JSON.stringify({ organization: ['service-id'] }))
  })

  it('should fallback to the initial value for corrupted object values without mutating localStorage', () => {
    localStorage.setItem('qovery-recent-services', 'invalid json')

    const { result } = renderHook(() => useLocalStorage('qovery-recent-services', {}))

    expect(result.current[0]).toEqual({})
    expect(localStorage.getItem('qovery-recent-services')).toBe('invalid json')
  })
})
