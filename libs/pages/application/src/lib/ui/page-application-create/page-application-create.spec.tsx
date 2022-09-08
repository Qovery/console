import { render } from '@testing-library/react'
import PageApplicationCreate from './page-application-create'

describe('PageApplicationCreate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreate />)
    expect(baseElement).toBeTruthy()
  })
})
