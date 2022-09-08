import { render } from '@testing-library/react'
import PageApplicationCreateGeneralFeature from './page-application-create-general-feature'

describe('PageApplicationCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
