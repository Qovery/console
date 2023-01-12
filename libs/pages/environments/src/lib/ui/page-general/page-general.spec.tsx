import { render } from '__tests__/utils/setup-jest'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { PageGeneral, PageGeneralProps } from './page-general'

let props: PageGeneralProps

beforeEach(() => {
  props = {
    environments: environmentFactoryMock(2),
    buttonActions: [
      {
        name: 'redeploy',
        action: () => null,
      },
      {
        name: 'deploy',
        action: () => null,
      },
      {
        name: 'stop',
        action: () => null,
      },
      {
        name: 'cancel-deployment',
        action: () => null,
      },
      {
        name: 'delete',
        action: () => null,
      },
    ],
    listHelpfulLinks: [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment',
        linkLabel: 'How to manage my environment',
        external: true,
      },
    ],
  }
})

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
