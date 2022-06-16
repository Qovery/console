import { render } from '@testing-library/react'

import Deployments, { DeploymentsPageProps } from './deployments'

let props: DeploymentsPageProps

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
    const { baseElement } = render(<Deployments {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
