import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { type PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import { useResolvedSkill } from './use-resolved-skill'

const resolvedSkill = (content: string) => ({
  source: 'ROLE',
  skill_name: 'qovery-deploy',
  skill_preset: { id: 'preset-1', name: 'Backend team', revision: 1 },
  mode: 'OVERLAY',
  description: null,
  content,
})

describe('useResolvedSkill', () => {
  afterEach(() => jest.restoreAllMocks())

  it('reads the text again when the member opens it again, so a newer revision shows', async () => {
    const request = jest
      .spyOn(axios, 'request')
      .mockResolvedValueOnce({ data: resolvedSkill('Revision 1') })
      .mockResolvedValueOnce({ data: resolvedSkill('Revision 2') })
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result, rerender } = renderHook(
      ({ enabled }) => useResolvedSkill({ organizationId: 'organization-1', skillName: 'qovery-deploy', enabled }),
      { wrapper, initialProps: { enabled: true } }
    )
    await waitFor(() => expect(result.current.data?.content).toBe('Revision 1'))

    rerender({ enabled: false })
    rerender({ enabled: true })

    await waitFor(() => expect(result.current.data?.content).toBe('Revision 2'))
    expect(request).toHaveBeenCalledTimes(2)
  })
})
