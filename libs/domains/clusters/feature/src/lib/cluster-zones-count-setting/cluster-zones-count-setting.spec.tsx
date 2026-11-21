import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterZonesCountSetting, supportsFewerZones } from './cluster-zones-count-setting'

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(),
}))

const mockUseFeatureFlagEnabled = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

function Form({
  cloudProvider,
  isProduction,
  karpenterEnabled = false,
}: {
  cloudProvider: CloudProviderEnum
  isProduction?: boolean
  karpenterEnabled?: boolean
}) {
  const methods = useForm<ClusterResourcesData>({
    defaultValues: { karpenter: { enabled: karpenterEnabled } } as ClusterResourcesData,
  })
  return (
    <FormProvider {...methods}>
      <ClusterZonesCountSetting cloudProvider={cloudProvider} isProduction={isProduction} />
    </FormProvider>
  )
}

describe('ClusterZonesCountSetting', () => {
  beforeEach(() => {
    mockUseFeatureFlagEnabled.mockReturnValue(true)
  })

  it('should render for a non-production Azure cluster when the flag is on', () => {
    renderWithProviders(<Form cloudProvider="AZURE" />)
    expect(screen.getByText('Availability zones')).toBeInTheDocument()
  })

  it('should not render when the flag is off', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(false)
    renderWithProviders(<Form cloudProvider="AZURE" />)
    expect(screen.queryByText('Availability zones')).not.toBeInTheDocument()
  })

  it('should not render on a production cluster', () => {
    renderWithProviders(<Form cloudProvider="SCW" isProduction />)
    expect(screen.queryByText('Availability zones')).not.toBeInTheDocument()
  })

  it('should only render on AWS when Karpenter is enabled', () => {
    const { unmount } = renderWithProviders(<Form cloudProvider="AWS" />)
    expect(screen.queryByText('Availability zones')).not.toBeInTheDocument()
    unmount()
    renderWithProviders(<Form cloudProvider="AWS" karpenterEnabled />)
    expect(screen.getByText('Availability zones')).toBeInTheDocument()
  })
})

describe('supportsFewerZones', () => {
  it('should support AWS with Karpenter, Azure and Scaleway only', () => {
    expect(supportsFewerZones('AWS', true)).toBe(true)
    expect(supportsFewerZones('AWS', false)).toBe(false)
    expect(supportsFewerZones('AZURE', false)).toBe(true)
    expect(supportsFewerZones('SCW', false)).toBe(true)
    expect(supportsFewerZones('GCP', true)).toBe(false)
  })
})
