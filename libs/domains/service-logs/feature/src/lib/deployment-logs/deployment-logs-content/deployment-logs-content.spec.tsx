import {
  type DeploymentStageWithServicesStatuses,
  ServiceDeploymentStatusEnum,
  StateEnum,
} from 'qovery-typescript-axios'
import { applicationFactoryMock, environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DeploymentLogsFeature, {
  type DeploymentLogsContentProps,
  getServiceStatusesById,
} from './deployment-logs-content'

const mockApplication = applicationFactoryMock(1)[0]

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ serviceId: '052613b3-de4e-4077-8c89-7228bddda8f9', executionId: 'exec-1' }),
  useNavigate: () => jest.fn(),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useService: () => ({ data: mockApplication }),
  useDeploymentStatus: () => ({ data: undefined }),
}))

jest.mock('@qovery/domains/environments/feature', () => ({
  ...jest.requireActual('@qovery/domains/environments/feature'),
  useDeploymentHistory: () => ({ data: [] }),
}))

jest.mock('../../list-deployment-logs/list-deployment-logs', () => ({
  ListDeploymentLogs: () => <div data-testid="list-deployment-logs" />,
}))

const services: DeploymentStageWithServicesStatuses[] = [
  {
    stage: {
      id: 'a9cb8c98-c502-4a6e-93d4-80152eb12d7d',
      name: 'DATABASE DEFAULT',
    },
    applications: [],
    containers: [],
    databases: [],
    jobs: [],
  },
  {
    stage: {
      id: 'agentic-workflow-stage',
      name: 'AGENTIC WORKFLOW DEFAULT',
    },
    agentic_workflows: [
      {
        id: 'workflow-id',
        state: StateEnum.RUNNING,
      },
    ],
  },
  {
    stage: {
      id: 'c5b554bc-850b-4ddb-bb45-3d47112c3e82',
      name: 'APPLICATION DEFAULT',
    },
    applications: [
      {
        id: '052613b3-de4e-4077-8c89-7228bddda8f9',
        state: StateEnum.DEPLOYED,
        service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
        last_deployment_date: '2023-04-14T09:40:37.451334Z',
        is_part_last_deployment: false,
      },
    ],
    containers: [],
    databases: [],
    jobs: [],
  },
]

describe('DeploymentLogsFeature', () => {
  const props: DeploymentLogsContentProps = {
    environment: environmentFactoryMock(1)[0],
    deploymentStages: services,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DeploymentLogsFeature {...props} />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByTestId('list-deployment-logs')).toBeInTheDocument()
  })

  it('should return the service with the given id', () => {
    const serviceId = '052613b3-de4e-4077-8c89-7228bddda8f9'
    const expectedService = {
      id: '052613b3-de4e-4077-8c89-7228bddda8f9',
      state: StateEnum.DEPLOYED,
      service_deployment_status: ServiceDeploymentStatusEnum.UP_TO_DATE,
      last_deployment_date: '2023-04-14T09:40:37.451334Z',
      is_part_last_deployment: false,
    }
    expect(getServiceStatusesById(services, serviceId)).toEqual(expectedService)
  })

  it('should return an agentic workflow status with the given id', () => {
    expect(getServiceStatusesById(services, 'workflow-id')).toEqual({
      id: 'workflow-id',
      state: StateEnum.RUNNING,
    })
  })
})
