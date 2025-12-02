import { CloudProviderEnum } from 'qovery-typescript-axios'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LayoutPage, { type LayoutPageProps } from './layout-page'

// Override global mocks with test-specific values
jest.mock('@qovery/domains/clusters/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/clusters/feature'),
    useClusterStatuses: jest.fn(() => ({
      data: [
        {
          cluster_id: '0000-0000-0000-0000',
          status: 'INVALID_CREDENTIALS',
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    })),
    useClusterInstallNotifications: jest.fn(() => undefined),
  }
})

const renderComponent = (props: LayoutPageProps) => (
  <IntercomProvider appId="__test__app__id__" autoBoot={false}>
    <LayoutPage {...props} />
  </IntercomProvider>
)

describe('LayoutPage', () => {
  const props: LayoutPageProps = {
    defaultOrganizationId: '0000-0000-0000-0000',
    topBar: false,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement, unmount } = renderWithProviders(renderComponent({ ...props }))
    expect(baseElement).toBeTruthy()
    unmount()
  })

  it('should have cluster deployment error banner', () => {
    props.clusters = [
      {
        id: '0000-0000-0000-0000',
        name: 'cluster-name',
        created_at: '',
        region: '',
        cloud_provider: CloudProviderEnum.AWS,
      },
    ]

    const { unmount } = renderWithProviders(renderComponent({ ...props }))
    screen.getByText('Check the credentials configuration')
    unmount()
  })
})
