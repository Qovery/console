import { act, renderHook } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useLocalStorage as useLocalStorageBase } from '@uidotdev/usehooks'
import type { SetStateAction } from 'react'
import { useLocalStorage } from './use-local-storage'

jest.mock('@uidotdev/usehooks', () => ({
  useLocalStorage: jest.fn(),
}))

const useLocalStorageBaseMock = useLocalStorageBase as jest.Mock

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    useLocalStorageBaseMock.mockImplementation((key: string, initialValue: unknown) => {
      const setValue = jest.fn((value: unknown) => {
        const currentValue = localStorage.getItem(key)
        const previousValue = currentValue ? JSON.parse(currentValue) : initialValue
        const nextValue = typeof value === 'function' ? value(previousValue) : value

        if (nextValue === undefined || nextValue === null) {
          localStorage.removeItem(key)
          return
        }

        localStorage.setItem(key, JSON.stringify(nextValue))
      })
      const currentValue = localStorage.getItem(key)

      return [currentValue ? JSON.parse(currentValue) : initialValue, setValue]
    })
  })

  it('should read JSON values from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('github'))

    const { result } = renderHook(() => useLocalStorage('key', undefined))

    expect(result.current[0]).toBe('github')
  })

  it('should keep legacy raw string values from localStorage', () => {
    localStorage.setItem('currentOrganizationId', '12345678-1234-1234-1234-123456789abc')

    const { result } = renderHook(() => useLocalStorage('currentOrganizationId', ''))

    expect(result.current[0]).toBe('12345678-1234-1234-1234-123456789abc')
    expect(localStorage.getItem('currentOrganizationId')).toBe(JSON.stringify('12345678-1234-1234-1234-123456789abc'))
  })

  it('should store updated string values as JSON', () => {
    localStorage.setItem('lastUsedLogin', 'github')

    const { result } = renderHook(() => useLocalStorage('lastUsedLogin', undefined))

    act(() => {
      result.current[1]('saml_sso' as unknown as SetStateAction<undefined>)
    })

    expect(localStorage.getItem('lastUsedLogin')).toBe(JSON.stringify('saml_sso'))
  })

  it('should support functional updates with legacy raw string values', () => {
    localStorage.setItem('lastUsedLogin', 'github')

    const { result } = renderHook(() => useLocalStorage<string | undefined>('lastUsedLogin', undefined))

    act(() => {
      result.current[1]((previousValue) => `${previousValue}_sso`)
    })

    expect(localStorage.getItem('lastUsedLogin')).toBe(JSON.stringify('github_sso'))
  })

  it('should store updated object values as JSON', () => {
    const { result } = renderHook(() => useLocalStorage('qovery-recent-services', {}))

    act(() => {
      result.current[1]({ organization: ['service-id'] })
    })

    expect(localStorage.getItem('qovery-recent-services')).toBe(JSON.stringify({ organization: ['service-id'] }))
  })

  it('should fallback to the initial value for corrupted object values', () => {
    localStorage.setItem('qovery-recent-services', 'invalid json')

    const { result } = renderHook(() => useLocalStorage('qovery-recent-services', {}))

    expect(result.current[0]).toEqual({})
  })
})
