import { render } from '__tests__/utils/setup-jest'

import PageCreateEditDeploymentRule, { PageCreateEditDeploymentRuleProps } from './page-create-edit-deployment-rule'

let props: PageCreateEditDeploymentRuleProps

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

describe('PageCreateEditDeploymentRule', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageCreateEditDeploymentRule {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
