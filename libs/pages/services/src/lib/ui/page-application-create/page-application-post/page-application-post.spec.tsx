import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import PageApplicationPost, { PageApplicationPostProps } from './page-application-post'

const props: PageApplicationPostProps = {
  gotoResources: jest.fn(),
  resourcesData: {
    cpu: [0.5],
    instances: [1, 12],
    memory: 512,
  },
  gotoGlobalInformation: jest.fn(),
  generalData: {
    serviceType: ServiceTypeEnum.APPLICATION,
    name: 'test',
  },
  gotoPorts: jest.fn(),
  onPrevious: jest.fn(),
  onSubmit: jest.fn(),
  portsData: {
    ports: [
      {
        application_port: 80,
        external_port: 443,
        is_public: true,
      },
    ],
  },
  isLoading: false,
}

describe('PageApplicationPost', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationPost {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
