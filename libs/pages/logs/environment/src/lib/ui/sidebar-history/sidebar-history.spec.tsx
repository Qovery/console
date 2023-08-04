import { render } from '@testing-library/react'
import SidebarHistory from './sidebar-history'

describe('SidebarHistory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarHistory />)
    expect(baseElement).toBeTruthy()
  })
})
