import { renderWithProviders } from '@qovery/shared/util-tests'
import SidebarHistoryFeature, { type SidebarHistoryFeatureProps } from './sidebar-history-feature'

describe('SidebarHistoryFeature', () => {
  const props: SidebarHistoryFeatureProps = {
    versionId: '1',
    serviceId: '2',
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<SidebarHistoryFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
