import { render } from '__tests__/utils/setup-jest'
import SidebarFeature, { SidebarFeatureProps } from './sidebar-feature'

describe('SidebarFeature', () => {
  const props: SidebarFeatureProps = {
    serviceId: '1',
  }

  it('should render successfully', () => {
    const { baseElement } = render(<SidebarFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
