import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ScalewayFeatures, type ScalewayFeaturesProps } from './scaleway-features'

const mockStaticIpFeature: ClusterFeatureResponse = {
  id: 'STATIC_IP',
  title: 'Static IP',
  description: 'Enable static IP addresses for your cluster nodes',
  value_object: {
    type: 'BOOLEAN',
    value: true,
  },
  is_cloud_provider_paying_feature: true,
  cloud_provider_feature_documentation: 'https://www.scaleway.com/en/docs/',
}

const mockNatGatewayFeature: ClusterFeatureResponse = {
  id: 'NAT_GATEWAY',
  title: 'NAT Gateway',
  description: 'Enable NAT Gateway for your cluster',
  value_object: {
    type: 'STRING',
    value: false,
  },
  is_cloud_provider_paying_feature: true,
}

const defaultProps: ScalewayFeaturesProps = {
  staticIpFeature: mockStaticIpFeature,
  natGatewayFeature: mockNatGatewayFeature,
}

describe('ScalewayFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<ScalewayFeatures {...defaultProps} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: 'VPC-GW-S' },
          },
        },
      })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render Static IP toggle and NAT Gateway dropdown', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ScalewayFeatures {...defaultProps} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: 'VPC-GW-S' },
          },
        },
      })
    )

    expect(screen.getByText('Static IP')).toBeInTheDocument()
    expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
  })

  it('should show documentation link when cloud_provider_feature_documentation is provided', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ScalewayFeatures {...defaultProps} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: 'VPC-GW-S' },
          },
        },
      })
    )

    // Should have external link when documentation URL is provided
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('should render documentation link', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ScalewayFeatures {...defaultProps} />, {
        defaultValues: {
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: 'VPC-GW-S' },
          },
        },
      })
    )

    expect(screen.getByText('Documentation link')).toBeInTheDocument()
  })

  it('should render without features gracefully', () => {
    const props = {
      ...defaultProps,
      staticIpFeature: undefined,
      natGatewayFeature: undefined,
    }
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ScalewayFeatures {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
