import { render } from '__tests__/utils/setup-jest'
import PagesDatabase from './page-database'

describe('PagesDatabase', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesDatabase />)
    expect(baseElement).toBeTruthy()
  })
})
