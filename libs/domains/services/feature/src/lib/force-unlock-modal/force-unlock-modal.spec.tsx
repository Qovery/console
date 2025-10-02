import { environmentFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ForceUnlockModal } from './force-unlock-modal'

const environment = environmentFactoryMock(1)[0]
const service = terraformFactoryMock(1)[0]

const mockDeploy = jest.fn()

jest.mock('../hooks/use-deploy-service/use-deploy-service', () => ({
  ...jest.requireActual('../hooks/use-deploy-service/use-deploy-service'),
  useDeployService: () => ({
    mutate: mockDeploy,
  }),
}))

describe('ForceUnlockModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ForceUnlockModal environment={environment} service={service} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call deployService', async () => {
    const { userEvent } = renderWithProviders(<ForceUnlockModal environment={environment} service={service} />)
    const ackCheckboxLabel = screen.getByText('No other Terraform job is executing before continuing')
    await userEvent.click(ackCheckboxLabel)
    const submitButton = screen.getByRole('button', { name: 'Force unlock' })
    await userEvent.click(submitButton)
    expect(mockDeploy).toHaveBeenCalledWith({
      serviceId: service.id,
      serviceType: service.serviceType,
      request: { action: 'FORCE_UNLOCK' },
    })
  })

  it('should not call deployService if the acknowledgement checkbox is not checked', async () => {
    const { userEvent } = renderWithProviders(<ForceUnlockModal environment={environment} service={service} />)
    const submitButton = screen.getByRole('button', { name: 'Force unlock' })
    await userEvent.click(submitButton)
    expect(mockDeploy).not.toHaveBeenCalled()
  })

  it('should match snapshot', () => {
    const { container } = renderWithProviders(<ForceUnlockModal environment={environment} service={service} />)
    expect(container).toMatchSnapshot()
  })
})
