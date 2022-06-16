import { render } from '__tests__/utils/setup-jest'
import { PageDeployments, PageDeploymentsProps } from './page-deployments'

let props: PageDeploymentsProps

beforeEach(() => {
  props = {
    listHelpfulLinks: [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
        linkLabel: 'How to configure my application',
        external: true,
      },
    ],
  }
})

describe('DeploymentsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDeployments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
