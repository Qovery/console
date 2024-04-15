import { render } from '__tests__/utils/setup-jest'
import { PageDeployments, type PageDeploymentsProps } from './page-deployments'

let props: PageDeploymentsProps

describe('DeploymentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeployments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
