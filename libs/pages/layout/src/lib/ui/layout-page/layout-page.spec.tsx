import { CloudProviderEnum } from 'qovery-typescript-axios'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LayoutPage, { type LayoutPageProps } from './layout-page'

jest.mock('@qovery/domains/clusters/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/clusters/feature'),
    useClusterStatuses: () => ({
      data: [
        {
          cluster_id: '0000-0000-0000-0000',
          status: 'INVALID_CREDENTIALS',
        },
      ],
    }),
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

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(renderComponent({ ...props }))
    expect(baseElement).toBeTruthy()
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

    renderWithProviders(renderComponent({ ...props }))
    screen.getByText('Check the credentials configuration')
  })
})
