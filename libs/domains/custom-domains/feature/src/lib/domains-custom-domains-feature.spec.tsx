import { render } from '@testing-library/react'
import DomainsCustomDomainsFeature from './domains-custom-domains-feature'

describe('DomainsCustomDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DomainsCustomDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
