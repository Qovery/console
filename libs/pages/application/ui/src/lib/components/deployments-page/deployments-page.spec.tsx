import { render } from '__tests__/utils/setup-jest'
import { DeploymentsPage, DeploymentsProps } from './deployments-page'

let props: DeploymentsProps

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
    const { baseElement } = render(<DeploymentsPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
