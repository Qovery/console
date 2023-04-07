import { render } from '__tests__/utils/setup-jest'
import SidebarPipelineItem from './sidebar-pipeline-item'

describe('SidebarPipelineItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarPipelineItem />)
    expect(baseElement).toBeTruthy()
  })
})
