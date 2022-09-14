import { render } from '@testing-library/react'
import PageApplicationCreateResourcesFeature from './page-application-create-resources-feature'

describe('PageApplicationCreateResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
