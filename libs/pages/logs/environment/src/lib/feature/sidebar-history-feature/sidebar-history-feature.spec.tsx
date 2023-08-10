import { render } from '__tests__/utils/setup-jest'
import SidebarHistoryFeature, { SidebarHistoryFeatureProps } from './sidebar-history-feature'

describe('SidebarHistoryFeature', () => {
  const props: SidebarHistoryFeatureProps = {
    versionId: '1',
    serviceId: '2',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<SidebarHistoryFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
