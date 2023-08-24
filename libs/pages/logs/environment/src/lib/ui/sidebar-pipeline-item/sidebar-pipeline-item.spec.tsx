import { render, waitFor } from '__tests__/utils/setup-jest'
import { ServiceDeploymentStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { applicationFactoryMock } from '@qovery/shared/factories'
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
    const { baseElement, getByText } = render(<SidebarPipelineItem {...props} />)
    expect(baseElement).toBeTruthy()
    expect(getByText('Stage 1')).toBeInTheDocument()
  })

  it('should have message when no services', () => {
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

    const { getByText, getByTestId } = render(<SidebarPipelineItem {...props} />)

    getByTestId('toggle-stage').click()

    waitFor(() => {
      expect(getByText('No service for this stage')).toBeInTheDocument()
    })
  })
})
