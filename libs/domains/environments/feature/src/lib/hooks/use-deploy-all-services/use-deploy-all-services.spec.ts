import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderHook } from '@qovery/shared/util-tests'
import { queries } from '@qovery/state/util-queries'
import { useDeployAllServices } from './use-deploy-all-services'

const mockInvalidateQueries = jest.fn()
const mockUseMutation = jest.fn()

interface MutationOptions {
  onSuccess: (
    data: unknown,
    variables: {
      environment: ReturnType<typeof environmentFactoryMock>[number]
      payload: { terraforms: { id: string; git_commit_id: string }[] }
    }
  ) => void
}

let mockMutationOptions: MutationOptions

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
}))

describe('useDeployAllServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMutation.mockImplementation((_mutation: unknown, options: MutationOptions) => {
      mockMutationOptions = options
      return {}
    })
  })

  it('invalidates Terraform details after a successful deployment', () => {
    const environment = environmentFactoryMock(1)[0]
    renderHook(() => useDeployAllServices())

    mockMutationOptions.onSuccess(undefined, {
      environment,
      payload: { terraforms: [{ id: 'terraform-1', git_commit_id: 'commit-1' }] },
    })

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queries.services.details({ serviceId: 'terraform-1', serviceType: 'TERRAFORM' }).queryKey,
    })
  })
})
