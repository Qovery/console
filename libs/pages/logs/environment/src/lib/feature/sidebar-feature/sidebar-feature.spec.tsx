import { render } from '__tests__/utils/setup-jest'
import SidebarFeature from './sidebar-feature'

describe('SidebarFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarFeature />)
    expect(baseElement).toBeTruthy()
  })
})
