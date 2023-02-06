import { render } from '@testing-library/react'
import ClusterRemoteSettings from './cluster-remote-settings'

describe('ClusterRemoteSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ClusterRemoteSettings />)
    expect(baseElement).toBeTruthy()
  })
})
