import { render } from '@testing-library/react'

import PagesLayout from './pages-layout'

describe('PagesLayout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesLayout />)
    expect(baseElement).toBeTruthy()
  })
})
