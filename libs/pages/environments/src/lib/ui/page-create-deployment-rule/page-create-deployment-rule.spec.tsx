import { render } from '__tests__/utils/setup-jest'

import PageCreateDeploymentRule, { PageCreateDeploymentRuleProps } from './page-create-deployment-rule'

let props: PageCreateDeploymentRuleProps

beforeEach(() => {
  props = {
    listHelpfulLinks: [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule/',
        linkLabel: 'How to configure my deployment rule',
        external: true,
      },
    ],
    onSubmit: () => console.log('submit'),
  }
})

describe('PageCreateDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateDeploymentRule {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
