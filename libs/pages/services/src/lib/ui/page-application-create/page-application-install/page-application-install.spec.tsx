import { render } from '__tests__/utils/setup-jest'
import PageApplicationInstall, { PageApplicationInstallProps } from './page-application-install'

const props: PageApplicationInstallProps = {
  gotoResources: jest.fn(),
  resourcesData: {
    cpu: [0.5],
    instances: [1, 12],
    memory: 512,
  },
  gotoGlobalInformation: jest.fn(),
  generalData: {
    applicationSource: 'application',
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
}

describe('PageApplicationInstall', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationInstall {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
