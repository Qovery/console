import { render } from '@testing-library/react'
import PageGeneralFeature from './page-general-feature'

describe('PageGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
