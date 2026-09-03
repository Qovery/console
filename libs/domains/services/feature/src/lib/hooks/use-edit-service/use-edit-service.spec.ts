import { TerraformDeployRequestActionEnum } from 'qovery-typescript-axios'
import { renderHook } from '@qovery/shared/util-tests'
import { useEditService } from './use-edit-service'

const mockDeployService = jest.fn()
const mockInvalidateQueries = jest.fn()
let mockMutationOptions: unknown

jest.mock('@tanstack/react-query', () => ({
  useMutation: (_mutation: unknown, options: unknown) => {
    mockMutationOptions = options
    return {}
  },
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

jest.mock('../use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({ mutate: mockDeployService }),
}))

type SuccessNotification = {
  callback: () => void
  description: string
  labelAction: string
  title: string
}

type EditServiceMutationOptions = {
  meta: {
    notifyOnSuccess: (_data: unknown, variables: unknown) => SuccessNotification
  }
}

function getSuccessNotification({ planTerraformChanges = false }: { planTerraformChanges?: boolean } = {}) {
  renderHook(() =>
    useEditService({
      organizationId: 'organization-id',
      projectId: 'project-id',
      environmentId: 'environment-id',
      planTerraformChanges,
    })
  )

  const options = mockMutationOptions as EditServiceMutationOptions
  return options.meta.notifyOnSuccess(undefined, {
    serviceId: 'service-id',
    payload: { serviceType: 'TERRAFORM' },
  })
}

describe('useEditService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('offers a Terraform plan and starts only a plan when requested', () => {
    const notification = getSuccessNotification({ planTerraformChanges: true })

    expect(notification).toMatchObject({
      title: 'Service updated',
      description: 'Run a plan to preview these changes before applying them',
      labelAction: 'Plan',
    })

    notification.callback()

    expect(mockDeployService).toHaveBeenCalledWith({
      serviceId: 'service-id',
      serviceType: 'TERRAFORM',
      request: { action: TerraformDeployRequestActionEnum.PLAN },
    })
  })

  it('keeps the default deployment action for other Terraform updates', () => {
    const notification = getSuccessNotification()

    expect(notification).toMatchObject({
      description: 'You must update to apply the settings',
      labelAction: 'Update',
    })

    notification.callback()

    expect(mockDeployService).toHaveBeenCalledWith({
      serviceId: 'service-id',
      serviceType: 'TERRAFORM',
    })
  })
})
