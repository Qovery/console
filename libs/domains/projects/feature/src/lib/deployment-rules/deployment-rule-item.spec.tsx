import { render, screen } from '__tests__/utils/setup-jest'
import { deploymentRulesFactoryMock } from '@qovery/shared/factories'
import { DeploymentRules, type PageDeploymentRulesProps } from './deployement-rules'

let props: PageDeploymentRulesProps

beforeEach(() => {
  const deploymentRules = deploymentRulesFactoryMock(1)
  deploymentRules[0].start_time = '1970-01-01T08:00:00.000Z'
  deploymentRules[0].stop_time = '1970-01-01T19:00:00.000Z'
  deploymentRules[0].weekdays = ['MONDAY', 'TUESDAY']

  props = {
    organizationId: 'org-id',
    clusters: [],
    deploymentRules,
    updateDeploymentRulesOrder: jest.fn(),
    deleteDeploymentRule: jest.fn(),
    isLoading: false,
    linkNewRule: '/organization/org-id/project/project-id/deployment-rules/create',
  }
})

describe('DeploymentRules inline rows', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeploymentRules {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render row with border structure', () => {
    render(<DeploymentRules {...props} />)
    expect(screen.getByTestId('item')).toHaveClass('border-b')
  })

  it('should display formatted weekdays', () => {
    render(<DeploymentRules {...props} />)
    expect(screen.getByTestId('time')).toHaveTextContent(/Mon, Tue/)
  })
})
