import { render } from '@testing-library/react'
import PageGeneral from './page-general'

describe('PageGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral />)
    expect(baseElement).toBeTruthy()
  })
})
