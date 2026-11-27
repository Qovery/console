import { renderHook } from '@testing-library/react'
import { act, renderWithRouter, screen, waitFor } from '@qovery/shared/util-tests'
import { getStoredUtmParams, useCaptureUtmParams, useUtmParams } from './use-utm-params'

jest.unmock('@tanstack/react-router')

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

  it('does not throw when storage is unavailable', () => {
    window.history.replaceState({}, '', '/signup?utm_source=google')
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })

    expect(() => renderHook(() => useCaptureUtmParams())).not.toThrow()

    setItem.mockRestore()
  })
})

it('updates attribution from the real router search string after navigation', async () => {
  function Attribution() {
    const params = useUtmParams()
    return <output>{JSON.stringify(params)}</output>
  }
  const { router } = await renderWithRouter(<Attribution />, { route: '/?utm_source=google&gclid=abc&other=ignored' })
  expect(screen.getByRole('status')).toHaveTextContent(JSON.stringify({ utm_source: 'google', gclid: 'abc' }))
  await act(async () => {
    await router.navigate({ to: '/', search: { utm_campaign: 'summer' } })
  })
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(JSON.stringify({ utm_campaign: 'summer' })))
})
