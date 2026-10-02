import { AxiosError, AxiosHeaders } from 'axios'
import { isForbiddenError } from './is-forbidden-error'

// Shape produced by the console auth interceptor
const serializedErrorWithStatus = (status: number) => ({
  message: 'Not authorized',
  name: 'Forbidden',
  code: status.toString(),
  response: { status },
})

describe('isForbiddenError', () => {
  it('should return true for a 403 serialized error', () => {
    expect(isForbiddenError(serializedErrorWithStatus(403))).toBe(true)
  })

  it('should return true for a 403 axios error', () => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, {
      status: 403,
      statusText: '',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    })
    expect(isForbiddenError(error)).toBe(true)
  })

  it('should return false for other statuses', () => {
    expect(isForbiddenError(serializedErrorWithStatus(401))).toBe(false)
    expect(isForbiddenError(serializedErrorWithStatus(500))).toBe(false)
  })

  it('should return false for errors without response', () => {
    expect(isForbiddenError(new Error('Forbidden'))).toBe(false)
    expect(isForbiddenError(null)).toBe(false)
    expect(isForbiddenError(undefined)).toBe(false)
  })
})
