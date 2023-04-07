import { render } from '__tests__/utils/setup-jest'
import SidebarPipeline from './sidebar-pipeline'

describe('SidebarPipeline', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarPipeline />)
    expect(baseElement).toBeTruthy()
  })
})
