import { render } from '@testing-library/react'
import SidebarHistoryFeature from './sidebar-history-feature'

describe('SidebarHistoryFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarHistoryFeature />)
    expect(baseElement).toBeTruthy()
  })
})
