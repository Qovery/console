import { JobForceEvent } from 'qovery-typescript-axios'
import { type Job } from '@qovery/domains/services/data-access'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ForceRunModal from './force-run-modal'

const mockLifecycle = lifecycleJobFactoryMock(1)[0] as Job
const mockCron = cronjobFactoryMock(1)[0] as Job

const mockDeployService = jest.fn()

jest.mock('../hooks/use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({
    mutateAsync: mockDeployService,
    isLoading: false,
  }),
}))

describe('ForceRunModal', () => {
  it('should render 3 radio box if it is a lifecycle', () => {
    const { baseElement } = renderWithProviders(
      <ForceRunModal organizationId="organization-id" projectId="project-id" service={mockLifecycle} />
    )
    expect(screen.getAllByTestId('input-radio-box')).toHaveLength(3)
    expect(baseElement).toBeTruthy()
  })

  it('should render no radio box if it is a cron', () => {
    renderWithProviders(<ForceRunModal organizationId="organization-id" projectId="project-id" service={mockCron} />)
    expect(screen.queryAllByTestId('input-radio-box')).toHaveLength(0)
  })

  it('should dispatch forceRunJob with the good payload', async () => {
    const { userEvent } = renderWithProviders(
      <ForceRunModal organizationId="organization-id" projectId="project-id" service={mockLifecycle} />
    )

    const radioBox = screen.getByLabelText('Deploy')
    await userEvent.click(radioBox)

    const submit = screen.getByRole('button', { name: 'Force Run' })

    expect(submit).toBeEnabled()

    await userEvent.click(submit)

    expect(mockDeployService).toHaveBeenCalledWith({
      serviceId: '0',
      serviceType: 'JOB',
      forceEvent: JobForceEvent.START,
    })
  })
})
