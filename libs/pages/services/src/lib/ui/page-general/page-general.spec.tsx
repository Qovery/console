import { applicationFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'
import { PageGeneral, PageGeneralProps } from './page-general'

let props: PageGeneralProps

beforeEach(() => {
  props = {
    environmentMode: '',
    services: applicationFactoryMock(2),
    buttonActions: [
      {
        name: 'stop',
        action: jest.fn(),
      },
    ],
    listHelpfulLinks: [
      {
        link: 'my-link',
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
