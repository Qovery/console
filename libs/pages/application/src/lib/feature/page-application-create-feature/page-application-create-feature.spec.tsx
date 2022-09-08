import { render } from '@testing-library/react'
import PageApplicationCreateFeature from './page-application-create-feature'

describe('PageApplicationCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateFeature />)
    expect(baseElement).toBeTruthy()
  })
})
