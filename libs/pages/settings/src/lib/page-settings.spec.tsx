import { render } from '@testing-library/react'

import PagesSettings from './pages-settings'

describe('PagesSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesSettings />)
    expect(baseElement).toBeTruthy()
  })
})
