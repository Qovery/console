import { CloudProviderEnum, ClusterStateEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LayoutPage, { type LayoutPageProps } from './layout-page'

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
    props.clusters = [
      {
        id: '0000-0000-0000-0000',
        name: 'cluster-name',
        status: ClusterStateEnum.INVALID_CREDENTIALS,
        created_at: '',
        region: '',
        cloud_provider: CloudProviderEnum.AWS,
      },
    ]

    renderWithProviders(<LayoutPage {...props} />)
    screen.getByText('Check the credentials configuration')
  })
})
