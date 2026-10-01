import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { ServiceEditWarningCodeEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { toast } from '@qovery/shared/ui'
import { act, renderHook, waitFor } from '@qovery/shared/util-tests'
import { useEditService } from './use-edit-service'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: jest.fn(),
}))

jest.mock('../use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({ mutate: jest.fn() }),
}))

// The generated client dispatches every call through `axios.request`
const mockAxiosRequest = jest.spyOn(axios, 'request')

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const editHelm = async () => {
  const { result } = renderHook(
    () => useEditService({ organizationId: 'org-1', projectId: 'project-1', environmentId: 'env-1' }),
    { wrapper: createWrapper() }
  )
  await act(async () => {
    await result.current.mutateAsync({
      serviceId: 'helm-1',
      payload: { serviceType: 'HELM' } as Parameters<typeof result.current.mutateAsync>[0]['payload'],
    })
  })
}

describe('useEditService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should warn the user when the edit could not set up the auto-deploy webhook', async () => {
    mockAxiosRequest.mockResolvedValue({
      data: {
        id: 'helm-1',
        environment: { id: 'env-1' },
        warnings: [
          {
            code: ServiceEditWarningCodeEnum.WEBHOOK_PERMISSION_DENIED,
            message: "the git account of 'colin' needs admin rights on the repository",
          },
        ],
      },
    })

    await editHelm()

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        'warning',
        'Auto-deploy webhook not created',
        expect.stringContaining('Ask a repository admin')
      )
    )
  })

  it('should still warn when the API returns a warning code this client does not know', async () => {
    mockAxiosRequest.mockResolvedValue({
      data: { id: 'helm-1', environment: { id: 'env-1' }, warnings: [{ code: 'SOMETHING_NEW', message: 'details' }] },
    })

    await editHelm()

    await waitFor(() => expect(toast).toHaveBeenCalledWith('warning', 'Service updated with a warning', 'details'))
  })

  it('should not warn when the edit returns no warnings', async () => {
    mockAxiosRequest.mockResolvedValue({ data: { id: 'helm-1', environment: { id: 'env-1' } } })

    await editHelm()

    expect(toast).not.toHaveBeenCalledWith('warning', expect.anything(), expect.anything())
  })
})
