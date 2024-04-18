import { render } from '__tests__/utils/setup-jest'
import { deploymentRulesFactoryMock } from '@qovery/shared/factories'
import PageDeploymentRules, { type PageDeploymentRulesProps } from './page-deployment-rules'

let props: PageDeploymentRulesProps

beforeEach(() => {
  props = {
    deploymentRules: deploymentRulesFactoryMock(2),
    isLoading: 'loading',
    updateDeploymentRulesOrder: jest.fn(),
    deleteDeploymentRule: jest.fn(),
    linkNewRule: '/general',
  }
})

describe('DeploymentRules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeploymentRules {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
