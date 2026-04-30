import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Route, Routes } from 'react-router-dom'
import { useCluster } from '@qovery/domains/clusters/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsFeature from './page-settings-feature'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => true),
}))

jest.mock('@qovery/domains/clusters/feature', () => ({
  ...jest.requireActual('@qovery/domains/clusters/feature'),
  useCluster: jest.fn(),
}))

jest.mock('../../router/router', () => ({
  ROUTER_CLUSTER_SETTINGS: [],
}))

const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>
const useClusterMock = useCluster as jest.MockedFunction<typeof useCluster>

describe('PageSettingsFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useFeatureFlagEnabledMock.mockReturnValue(true)
    useClusterMock.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        kubernetes: 'MANAGED',
      },
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Routes location="/organization/1/cluster/2/general">
        <Route path="/organization/1/cluster/2/*" element={<PageSettingsFeature />} />
      </Routes>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should not display advanced settings for EKS Anywhere cluster', () => {
    useClusterMock.mockReturnValue({
      data: {
        cloud_provider: 'AWS',
        kubernetes: 'PARTIALLY_MANAGED',
      },
    })

    renderWithProviders(
      <Routes location="/organization/1/cluster/2/general">
        <Route path="/organization/1/cluster/2/*" element={<PageSettingsFeature />} />
      </Routes>
    )

    expect(screen.getByText('EKS Anywhere configuration')).toBeInTheDocument()
    expect(screen.queryByText('Advanced settings')).not.toBeInTheDocument()
  })
})
