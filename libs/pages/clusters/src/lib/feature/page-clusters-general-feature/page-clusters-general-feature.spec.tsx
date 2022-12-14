import { render } from '@testing-library/react'
import PageClustersGeneralFeature from './page-clusters-general-feature'

describe('PageClustersGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageClustersGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
