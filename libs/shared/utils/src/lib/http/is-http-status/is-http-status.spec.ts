import { AxiosError, type AxiosResponse } from 'axios'
import { isHttpStatus } from './is-http-status'

describe('isHttpStatus', () => {
  it('matches the status of an Axios error', () => {
    const error = new AxiosError('Not found', undefined, undefined, undefined, { status: 404 } as AxiosResponse)

    expect(isHttpStatus(error, 404)).toBe(true)
    expect(isHttpStatus(error, 500)).toBe(false)
  })

  it('matches the status of a serialized error', () => {
    expect(isHttpStatus({ response: { status: 404 } }, 404)).toBe(true)
  })

  it.each([undefined, null, 'Not found', {}, { response: null }])('does not match %p', (error) => {
    expect(isHttpStatus(error, 404)).toBe(false)
  })
})
