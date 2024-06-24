import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import SidebarPipelineItem, { type SidebarPipelineItemProps } from './sidebar-pipeline-item'

const applications = applicationFactoryMock(2)

describe('SidebarPipelineItem', () => {
  const props: SidebarPipelineItemProps = {
    serviceId: '1',
    index: 1,
    services: applications,
    currentStage: {
      stage: {
        id: 'stage-1',
        name: 'Stage 1',
      },
      applications: [
        {
          id: '1',
          state: StateEnum.READY,
          message: 'hello',
          service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
        },
      ],
      databases: [],
      containers: [],
      jobs: [],
    },
  }

  it('should render successfully', () => {
    const { baseElement, getByText } = renderWithProviders(<SidebarPipelineItem {...props} />)
    expect(baseElement).toBeTruthy()
    expect(getByText('Stage 1')).toBeInTheDocument()
  })

  it('should have message when no services', async () => {
    props.services = []
    props.currentStage = {
      stage: {
        id: 'stage-1',
        name: 'Stage 1',
      },
      applications: [],
      databases: [],
      containers: [],
      jobs: [],
    }

    const { userEvent } = renderWithProviders(<SidebarPipelineItem {...props} />)

    await userEvent.click(screen.getByTestId('toggle-stage'))

    waitFor(() => {
      expect(screen.getByText('No service for this stage')).toBeInTheDocument()
    })
  })
})
