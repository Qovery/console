import { render } from '@testing-library/react'
import SidebarPodStatuses from './sidebar-pod-statuses'

describe('SidebarPodStatuses', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarPodStatuses />)
    expect(baseElement).toBeTruthy()
  })
})
