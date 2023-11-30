import { CloudProviderEnum, ClusterStateEnum } from 'qovery-typescript-axios'
import * as clustersDomains from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LayoutPage, { type LayoutPageProps } from './layout-page'

const useClusterStatusesMockSpy = jest.spyOn(clustersDomains, 'useClusterStatuses') as jest.Mock

describe('LayoutPage', () => {
  const props: LayoutPageProps = {
    defaultOrganizationId: '0000-0000-0000-0000',
    topBar: false,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<LayoutPage {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should have cluster deployment error banner', () => {
    useClusterStatusesMockSpy.mockReturnValue({
      data: [
        {
          cluster_id: '0000-0000-0000-0000',
          status: ClusterStateEnum.INVALID_CREDENTIALS,
        },
      ],
    })
    props.clusters = [
      {
        id: '0000-0000-0000-0000',
        name: 'cluster-name',
        created_at: '',
        region: '',
        cloud_provider: CloudProviderEnum.AWS,
      },
    ]

    renderWithProviders(<LayoutPage {...props} />)
    screen.getByText('Check the credentials configuration')
  })
})
