import { applicationFactoryMock } from '@console/domains/application'
import { render } from '__tests__/utils/setup-jest'
import GeneralPage, { GeneralPageProps } from './general'

let props: GeneralPageProps

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

describe('GeneralPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GeneralPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
