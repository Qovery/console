/**
 * @jest-environment jsdom
 */
import { loadGoogleTagManager, pushToDataLayer } from './google-tag-manager'

describe('loadGoogleTagManager', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    delete window.dataLayer
  })

  it('injects the GTM script as an external script', () => {
    loadGoogleTagManager('GTM-TEST')

    const scripts = document.head.querySelectorAll('script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TEST')
    expect(scripts[0].async).toBe(true)
    expect(scripts[0].hasChildNodes()).toBe(false)
  })

  it('initializes the dataLayer with the gtm.js event', () => {
    loadGoogleTagManager('GTM-TEST')

    expect(window.dataLayer).toEqual([{ 'gtm.start': expect.any(Number), event: 'gtm.js' }])
  })

  it('keeps events pushed before GTM is loaded', () => {
    window.dataLayer = [{ event: 'early-event' }]

    loadGoogleTagManager('GTM-TEST')

    expect(window.dataLayer).toEqual([{ event: 'early-event' }, { 'gtm.start': expect.any(Number), event: 'gtm.js' }])
  })

  it('does not inject the script twice', () => {
    loadGoogleTagManager('GTM-TEST')
    loadGoogleTagManager('GTM-TEST')

    expect(document.head.querySelectorAll('script')).toHaveLength(1)
    expect(window.dataLayer).toHaveLength(1)
  })
})

describe('pushToDataLayer', () => {
  afterEach(() => {
    delete window.dataLayer
  })

  it('pushes the event to the existing dataLayer', () => {
    window.dataLayer = [{ event: 'gtm.js' }]

    pushToDataLayer({ event: 'onboarding-organization-created', plan: 'TEAM' })

    expect(window.dataLayer).toEqual([{ event: 'gtm.js' }, { event: 'onboarding-organization-created', plan: 'TEAM' }])
  })

  it('creates the dataLayer when GTM is not loaded', () => {
    pushToDataLayer({ event: 'onboarding-organization-created' })

    expect(window.dataLayer).toEqual([{ event: 'onboarding-organization-created' }])
  })
})
