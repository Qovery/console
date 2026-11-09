import { renderHook } from '@testing-library/react'
import { getStoredUtmParams, useCaptureUtmParams } from './use-utm-params'

describe('UTM params', () => {
  afterEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('stores the landing URL attribution and reads it back, null when missing', () => {
    window.history.replaceState({}, '', '/signup?utm_source=google&utm_campaign=brand&gclid=abc')

    renderHook(() => useCaptureUtmParams())

    expect(getStoredUtmParams()).toEqual({
      utm_source: 'google',
      utm_medium: null,
      utm_campaign: 'brand',
      utm_term: null,
      utm_content: null,
      utm_landing_page: null,
      gclid: 'abc',
    })
  })

  it('keeps the stored attribution when a later URL has none', () => {
    localStorage.setItem('utm_source', 'newsletter')
    window.history.replaceState({}, '', '/login/auth0-callback?code=x&state=y')

    renderHook(() => useCaptureUtmParams())

    expect(getStoredUtmParams().utm_source).toBe('newsletter')
  })
})
