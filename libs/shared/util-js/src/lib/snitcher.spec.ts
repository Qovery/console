/**
 * @jest-environment jsdom
 */
import { loadSnitcher } from './snitcher'

describe('loadSnitcher', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('injects the Snitcher profile script as an external script', () => {
    loadSnitcher('1234')

    const scripts = document.head.querySelectorAll('script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe('https://snid.snitcher.com/1234.js')
    expect(scripts[0].async).toBe(true)
    expect(scripts[0].hasChildNodes()).toBe(false)
  })

  it('does not inject the script twice', () => {
    loadSnitcher('1234')
    loadSnitcher('1234')

    expect(document.head.querySelectorAll('script')).toHaveLength(1)
  })

  it('ignores another profile once Snitcher is loaded', () => {
    loadSnitcher('1234')
    loadSnitcher('5678')

    const scripts = document.head.querySelectorAll('script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe('https://snid.snitcher.com/1234.js')
  })
})
