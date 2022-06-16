import { applicationFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'
import { GeneralPage, GeneralProps } from './general'

let props: GeneralProps

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
    const { baseElement } = render(<GeneralPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
