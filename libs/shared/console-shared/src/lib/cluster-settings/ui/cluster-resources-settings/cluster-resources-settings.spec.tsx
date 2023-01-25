import { render } from '@testing-library/react'
import ClusterResourcesSettings from './cluster-resources-settings'

describe('ClusterResourcesSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterResourcesSettings />)
    expect(baseElement).toBeTruthy()
  })
})
