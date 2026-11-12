import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren } from 'react'
import { type VariableResponse } from '@qovery/domains/variables/data-access'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useVariables } from './use-variables'

describe('useVariables', () => {
  it.each(['accounts.0.password', null, undefined])(
    'preserves external secret metadata for selector %s when preparing table rows',
    (jsonTargetKey) => {
      const externalSecret: VariableResponse = {
        id: 'secret-id',
        created_at: '2026-01-01T00:00:00.000Z',
        key: 'APP_PASSWORD',
        value: 'production/config',
        scope: 'APPLICATION',
        variable_type: 'EXTERNAL_SECRET',
        is_secret: false,
        secret_manager_access_id: 'manager-id',
        json_target_key: jsonTargetKey,
      }
      const privateVariable: VariableResponse = {
        ...externalSecret,
        id: 'private-id',
        key: 'PRIVATE_TOKEN',
        value: null,
        variable_type: 'VALUE',
        is_secret: true,
        secret_manager_access_id: null,
        json_target_key: null,
      }
      const props = { parentId: 'service-id', scope: 'APPLICATION' as const }
      const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
      queryClient.setQueryData(queries.variables.list(props).queryKey, [privateVariable, externalSecret])
      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )

      const { result, unmount } = renderHook(() => useVariables(props), { wrapper })
      try {
        expect(result.current.data).toEqual([
          { ...externalSecret, variable_kind: 'Public' },
          { ...privateVariable, variable_kind: 'Private' },
        ])
      } finally {
        unmount()
        queryClient.clear()
      }
    }
  )

  it('keeps project variables and only the project built-in when preparing project rows', () => {
    const projectVariable: VariableResponse = {
      id: 'project-variable',
      created_at: '2026-01-01T00:00:00.000Z',
      key: 'LOG_LEVEL',
      value: 'info',
      scope: 'PROJECT',
      variable_type: 'VALUE',
      is_secret: false,
    }
    const projectId: VariableResponse = {
      ...projectVariable,
      id: 'project-id-variable',
      key: 'QOVERY_PROJECT_ID',
      value: 'project-id',
      scope: 'BUILT_IN',
      variable_type: 'BUILT_IN',
    }
    const environmentId: VariableResponse = {
      ...projectId,
      id: 'environment-id-variable',
      key: 'QOVERY_ENVIRONMENT_ID',
      value: 'environment-id',
    }
    const props = { parentId: 'project-id', scope: 'PROJECT' as const }
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
    queryClient.setQueryData(queries.variables.list(props).queryKey, [projectVariable, environmentId, projectId])
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result, unmount } = renderHook(() => useVariables(props), { wrapper })
    try {
      expect(result.current.data).toEqual([
        { ...projectId, variable_kind: 'Public' },
        { ...projectVariable, variable_kind: 'Public' },
      ])
    } finally {
      unmount()
      queryClient.clear()
    }
  })
})
