import { render } from '@testing-library/react'
import PageApplicationCreateGeneral from './page-application-create-general'

describe('PageApplicationCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateGeneral />)
    expect(baseElement).toBeTruthy()
  })
})
