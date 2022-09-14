import { render } from '@testing-library/react'
import PageApplicationCreateGeneralContainer from './page-application-create-general-container'

describe('PageApplicationCreateGeneralContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateGeneralContainer />)
    expect(baseElement).toBeTruthy()
  })
})
