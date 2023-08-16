import { render } from '@testing-library/react'
import PagesUser from './pages-user'

describe('PagesUser', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesUser />)
    expect(baseElement).toBeTruthy()
  })
})
