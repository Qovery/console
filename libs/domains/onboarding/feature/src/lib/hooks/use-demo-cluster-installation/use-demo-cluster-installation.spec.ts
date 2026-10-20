import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@qovery/shared/util-tests'
import { useDemoClusterInstallation } from './use-demo-cluster-installation'

jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQuery: jest.fn() }))

it.each([
  [false, 'DEPLOYED', false],
  [true, 'READY', false],
  [true, 'DEPLOYING', false],
  [true, 'DEPLOYMENT_ERROR', false],
  [true, 'DEPLOYED', true],
])('requires a demo cluster (%s) to be deployed (%s)', (isDemo, status, ready) => {
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: [{ id: 'cluster-id', is_demo: isDemo, status }] } as ReturnType<typeof useQuery>)
  const { result } = renderHook(() => useDemoClusterInstallation({ organizationId: 'org-id' }))
  expect(Boolean(result.current.readyCluster)).toBe(ready)
  expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, refetchInterval: 5000 }))
})

it('does not poll without an organization', () => {
  jest.mocked(useQuery).mockReturnValue({ data: undefined } as ReturnType<typeof useQuery>)
  renderHook(() => useDemoClusterInstallation({ organizationId: '' }))
  expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
})
