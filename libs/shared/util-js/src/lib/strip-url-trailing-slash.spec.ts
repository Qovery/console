import { stripUrlTrailingSlash } from './strip-url-trailing-slash'

describe('stripUrlTrailingSlash', () => {
  it('should strip a single trailing slash', () => {
    expect(stripUrlTrailingSlash('oci://docker.io/')).toBe('oci://docker.io')
  })

  it('should strip multiple trailing slashes', () => {
    expect(stripUrlTrailingSlash('oci://docker.io///')).toBe('oci://docker.io')
  })

  it('should leave a URL without a trailing slash untouched', () => {
    expect(stripUrlTrailingSlash('oci://docker.io')).toBe('oci://docker.io')
  })

  it('should preserve a meaningful path', () => {
    expect(stripUrlTrailingSlash('oci://aaa.bbb.ccc.tech/qovery')).toBe('oci://aaa.bbb.ccc.tech/qovery')
  })

  it('should strip a trailing slash from the path while preserving a query string', () => {
    expect(stripUrlTrailingSlash('https://docker.io/?foo=bar')).toBe('https://docker.io?foo=bar')
  })

  it('should strip a trailing slash from the path while preserving a fragment', () => {
    expect(stripUrlTrailingSlash('https://docker.io/#section')).toBe('https://docker.io#section')
  })

  it('should not touch a trailing slash inside a query value', () => {
    expect(stripUrlTrailingSlash('https://docker.io?redirect=/foo/')).toBe('https://docker.io?redirect=/foo/')
  })
})
