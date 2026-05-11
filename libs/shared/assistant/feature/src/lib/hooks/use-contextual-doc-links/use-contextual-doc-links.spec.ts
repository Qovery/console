import { act, renderHook } from '@qovery/shared/util-tests'
import { useContextualDocLinks } from './use-contextual-doc-links'

const setPathname = (pathname: string) => {
  window.history.replaceState({}, '', pathname)
}

describe('useContextualDocLinks', () => {
  beforeEach(() => {
    setPathname('/')
  })

  it('should keep matching legacy routes', () => {
    setPathname('/organization/org-123/settings/general')

    const { result } = renderHook(() => useContextualDocLinks())

    expect(result.current).toContainEqual({
      link: 'https://www.qovery.com/docs/configuration/organization#general-information',
      label: 'Configure my organization',
    })
  })

  it('should match tanstack organization settings routes', () => {
    setPathname('/organization/org-123/settings/api-token')

    const { result } = renderHook(() => useContextualDocLinks())

    expect(result.current).toContainEqual({
      link: 'https://api-doc.qovery.com/',
      label: 'Qovery API Documentation',
    })
  })

  it('should match tanstack service settings routes', () => {
    setPathname('/organization/org-123/project/project-123/environment/env-123/service/service-123/settings/domain')

    const { result } = renderHook(() => useContextualDocLinks())

    expect(result.current).toContainEqual({
      link: 'https://www.qovery.com/docs/configuration/application#custom-domains',
      label: 'Customize the domain used to reach your application',
    })
  })

  it('should react to navigation events driven by the browser history api', () => {
    setPathname('/organization/org-123/settings/general')

    const { result } = renderHook(() => useContextualDocLinks())

    expect(result.current).toContainEqual({
      link: 'https://www.qovery.com/docs/configuration/organization#general-information',
      label: 'Configure my organization',
    })

    act(() => {
      window.history.pushState(
        {},
        '',
        '/organization/org-123/project/project-123/environment/env-123/service/service-123/settings/terraform-arguments'
      )
    })

    expect(result.current).toContainEqual({
      link: 'https://developer.hashicorp.com/terraform/cli/commands',
      label: 'Terraform CLI documentation',
    })
  })
})
