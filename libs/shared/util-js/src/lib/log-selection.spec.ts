/**
 * @jest-environment jsdom
 */
import { LOG_COPY_EXCLUDE_DATA_ATTRIBUTE, LOG_MESSAGE_DATA_ATTRIBUTE, copySelectedLogMessages } from './log-selection'

describe('copySelectedLogMessages', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    window.getSelection()?.removeAllRanges()
  })

  function copySelectedContent(startNode: Node, endNode: Node) {
    const range = document.createRange()
    const selection = window.getSelection()
    const preventDefault = jest.fn()
    const setData = jest.fn()

    if (!selection) {
      throw new Error('Missing test selection')
    }

    range.setStartBefore(startNode)
    range.setEndAfter(endNode)
    selection.addRange(range)

    copySelectedLogMessages({
      preventDefault,
      clipboardData: { setData },
    })

    return { preventDefault, setData }
  }

  it('copies selected text without excluded absolute log dates', () => {
    document.body.innerHTML = [
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:12.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">first message</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:13.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">second message</span></div>`,
    ].join('')
    const firstDate = document.querySelector<HTMLElement>(`[${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true"]`)
    const secondMessage = document.querySelectorAll<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)[1]

    if (!firstDate || !secondMessage) {
      throw new Error('Missing test selection nodes')
    }

    const { preventDefault, setData } = copySelectedContent(firstDate, secondMessage)

    expect(preventDefault).toHaveBeenCalled()
    expect(setData).toHaveBeenCalledWith('text/plain', 'first message\nsecond message')
  })

  it('copies selected text without excluded elapsed log dates', () => {
    document.body.innerHTML = [
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">00:04:49</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">first message</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">00:04:50</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">second message</span></div>`,
    ].join('')
    const firstDate = document.querySelector<HTMLElement>(`[${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true"]`)
    const secondMessage = document.querySelectorAll<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)[1]

    if (!firstDate || !secondMessage) {
      throw new Error('Missing test selection nodes')
    }

    const { preventDefault, setData } = copySelectedContent(firstDate, secondMessage)

    expect(preventDefault).toHaveBeenCalled()
    expect(setData).toHaveBeenCalledWith('text/plain', 'first message\nsecond message')
  })

  it('preserves timestamp-like content inside messages', () => {
    document.body.innerHTML = [
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">00:04:49</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">retry after 00:04:49</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:13.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">seen at 22 Jun, 14:36:13.00</span></div>`,
    ].join('')
    const firstDate = document.querySelector<HTMLElement>(`[${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true"]`)
    const secondMessage = document.querySelectorAll<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)[1]

    if (!firstDate || !secondMessage) {
      throw new Error('Missing test selection nodes')
    }

    const { preventDefault, setData } = copySelectedContent(firstDate, secondMessage)

    expect(preventDefault).toHaveBeenCalled()
    expect(setData).toHaveBeenCalledWith('text/plain', 'retry after 00:04:49\nseen at 22 Jun, 14:36:13.00')
  })

  it('preserves line breaks between service log rows', () => {
    document.body.innerHTML = [
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:12.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">first service log</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:13.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">second service log</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:14.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">third service log</span></div>`,
    ].join('')
    const firstDate = document.querySelector<HTMLElement>(`[${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true"]`)
    const lastMessage = document.querySelectorAll<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)[2]

    if (!firstDate || !lastMessage) {
      throw new Error('Missing test selection nodes')
    }

    const { preventDefault, setData } = copySelectedContent(firstDate, lastMessage)

    expect(preventDefault).toHaveBeenCalled()
    expect(setData).toHaveBeenCalledWith('text/plain', 'first service log\nsecond service log\nthird service log')
  })

  it('preserves partial selection and leading whitespace inside messages', () => {
    document.body.innerHTML = [
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:12.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">  first message</span></div>`,
      `<div><span ${LOG_COPY_EXCLUDE_DATA_ATTRIBUTE}="true">22 Jun, 14:36:13.00</span><span ${LOG_MESSAGE_DATA_ATTRIBUTE}="true">second message  </span></div>`,
    ].join('')
    const firstMessage = document.querySelector<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)?.firstChild
    const secondMessage = document.querySelectorAll<HTMLElement>(`[${LOG_MESSAGE_DATA_ATTRIBUTE}="true"]`)[1]
      ?.firstChild
    const range = document.createRange()
    const selection = window.getSelection()
    const preventDefault = jest.fn()
    const setData = jest.fn()

    if (!firstMessage || !secondMessage || !selection) {
      throw new Error('Missing test selection nodes')
    }

    range.setStart(firstMessage, 0)
    range.setEnd(secondMessage, 'second mes'.length)
    selection.addRange(range)

    copySelectedLogMessages({
      preventDefault,
      clipboardData: { setData },
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(setData).toHaveBeenCalledWith('text/plain', '  first message\nsecond mes')
  })

  it('exports the data attributes used by log rows', () => {
    expect(LOG_MESSAGE_DATA_ATTRIBUTE).toBe('data-log-message')
    expect(LOG_COPY_EXCLUDE_DATA_ATTRIBUTE).toBe('data-log-copy-exclude')
  })
})
