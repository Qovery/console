import { useQuery } from '@tanstack/react-query'
import { clusterFactoryMock, deploymentRulesFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useDeleteDeploymentRule } from '../hooks/use-delete-deployment-rule/use-delete-deployment-rule'
import { useEditDeploymentRulesPriorityOrder } from '../hooks/use-edit-deployment-rules-priority-order/use-edit-deployment-rules-priority-order'
import { useListDeploymentRules } from '../hooks/use-list-deployment-rules/use-list-deployment-rules'
import DeploymentRules from './deployement-rules'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-id', projectId: 'project-id' }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}))

jest.mock('../hooks/use-list-deployment-rules/use-list-deployment-rules', () => ({
  useListDeploymentRules: jest.fn(),
}))

jest.mock('../hooks/use-delete-deployment-rule/use-delete-deployment-rule', () => ({
  useDeleteDeploymentRule: jest.fn(),
}))

jest.mock('../hooks/use-edit-deployment-rules-priority-order/use-edit-deployment-rules-priority-order', () => ({
  useEditDeploymentRulesPriorityOrder: jest.fn(),
}))

const useQueryMock = useQuery as jest.Mock
const useListDeploymentRulesMock = useListDeploymentRules as jest.Mock
const useDeleteDeploymentRuleMock = useDeleteDeploymentRule as jest.Mock
const useEditDeploymentRulesPriorityOrderMock = useEditDeploymentRulesPriorityOrder as jest.Mock

describe('DeploymentRules', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const deploymentRules = deploymentRulesFactoryMock(1)
    deploymentRules[0].start_time = '1970-01-01T08:00:00.000Z'
    deploymentRules[0].stop_time = '1970-01-01T19:00:00.000Z'
    deploymentRules[0].weekdays = ['MONDAY', 'TUESDAY']

    useQueryMock.mockReturnValue({
      data: clusterFactoryMock(2),
    })

    useListDeploymentRulesMock.mockReturnValue({
      data: deploymentRules,
      isLoading: false,
    })

    useDeleteDeploymentRuleMock.mockReturnValue({
      mutate: jest.fn(),
    })

    useEditDeploymentRulesPriorityOrderMock.mockReturnValue({
      mutate: jest.fn(),
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DeploymentRules />)
    expect(baseElement).toBeTruthy()
  })

  it('should render deployment rule row with expected structure and weekdays', () => {
    renderWithProviders(<DeploymentRules />)

    expect(screen.getByTestId('item')).toHaveClass('border-b')
    expect(screen.getByTestId('time')).toHaveTextContent(/Mon, Tue/)
  })

  it('should render empty state for missing clusters', () => {
    useQueryMock.mockReturnValue({
      data: [],
    })
    useListDeploymentRulesMock.mockReturnValue({
      data: [],
      isLoading: false,
    })

    renderWithProviders(<DeploymentRules />)

    expect(screen.getByText('Create your Cluster first 💫')).toBeInTheDocument()
  })
})
