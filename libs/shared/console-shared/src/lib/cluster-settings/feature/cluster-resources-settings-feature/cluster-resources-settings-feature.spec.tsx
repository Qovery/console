import { render } from '@testing-library/react'
import ClusterResourcesSettingsFeature from './cluster-resources-settings-feature'

describe('ClusterResourcesSettingsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterResourcesSettingsFeature />)
    expect(baseElement).toBeTruthy()
  })
})
