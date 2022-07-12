import { render } from '@testing-library/react'

import HelpSidebar from './help-sidebar'

describe('HelpSidebar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<HelpSidebar />)
    expect(baseElement).toBeTruthy()
  })
})
