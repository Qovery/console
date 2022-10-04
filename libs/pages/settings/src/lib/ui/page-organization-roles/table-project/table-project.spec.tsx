import { render } from '@testing-library/react'
import Table from './table'

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Table />)
    expect(baseElement).toBeTruthy()
  })
})
