import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { GcpStaticIp } from './gcp-static-ip'

const mockStaticIpFeature: ClusterFeatureResponse = {
  id: 'STATIC_IP',
  value: true,
  value_object: {
    value: true,
  },
}

const mockNatGatewayFeature: ClusterFeatureResponse = {
  id: 'NAT_GATEWAY',
  value: true,
  value_object: {
    type: 'NAT_GATEWAY',
    value: {
      nat_gateway_type: {
        provider: 'gcp',
        static_ips_enabled: true,
        static_ips_count: 2,
      },
    },
  },
}

describe('GcpStaticIp', () => {
  it('should hide GCP NAT details when static IP toggle is disabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
        />,
        {
          defaultValues: {
            features: {
              STATIC_IP: { value: false },
              NAT_GATEWAY: { value: false, extendedValue: undefined },
            },
          },
        }
      )
    )

    expect(screen.queryByText('Enable static egress IPs')).not.toBeInTheDocument()
    expect(screen.queryByText('Static IP count')).not.toBeInTheDocument()
  })

  it('should show default static IP count when static IP toggle is enabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
        />,
        {
          defaultValues: {
            features: {
              STATIC_IP: { value: true },
              NAT_GATEWAY: {
                value: true,
                extendedValue: {
                  static_ips_enabled: true,
                  static_ips_count: 2,
                },
              },
            },
          },
        }
      )
    )

    expect(screen.getByText('Enable static egress IPs')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('should hide static IP count when static egress toggle is disabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
        />,
        {
          defaultValues: {
            features: {
              STATIC_IP: { value: true },
              NAT_GATEWAY: {
                value: true,
                extendedValue: {
                  static_ips_enabled: false,
                  static_ips_count: 2,
                },
              },
            },
          },
        }
      )
    )

    expect(screen.getByText('Enable static egress IPs')).toBeInTheDocument()
    expect(screen.queryByText('Static IP count')).not.toBeInTheDocument()
  })

  it('should read nested nat_gateway_type settings for existing GCP clusters', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
          disabled
        />
      )
    )

    expect(screen.getByText('Enable static egress IPs')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('should disable static ip toggle when staticIpToggleDisabled is true', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
          staticIpToggleDisabled
        />,
        {
          defaultValues: {
            features: {
              STATIC_IP: { value: true },
              NAT_GATEWAY: {
                value: true,
                extendedValue: {
                  static_ips_enabled: true,
                  static_ips_count: 2,
                },
              },
            },
          },
        }
      )
    )

    expect(screen.getAllByTestId('input-toggle')[0]).toHaveClass('opacity-50')
    expect(screen.getByText('Enable static egress IPs')).toBeInTheDocument()
  })

  it('should not show NAT sub-options when natGatewayFeature is undefined', () => {
    renderWithProviders(
      wrapWithReactHookForm(<GcpStaticIp staticIpFeature={mockStaticIpFeature} production={false} />, {
        defaultValues: { features: { STATIC_IP: { value: true } } },
      })
    )

    expect(screen.queryByText('Enable static egress IPs')).not.toBeInTheDocument()
  })

  it('should render billing badge button when is_cloud_provider_paying_feature is true', () => {
    const paidFeature = {
      ...mockStaticIpFeature,
      is_cloud_provider_paying_feature: true,
      cloud_provider_feature_documentation: 'https://cloud.google.com/nat',
    }

    // disabled mode: staticIpEnabled comes from feature.value_object.value, useEffect does not run
    renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={paidFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
          disabled
        />
      )
    )

    // ExternalLink as="button" renders an <a> (role=link); billing badge + docs link = 2 links total
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('should reset static IP count to default when input is cleared', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <GcpStaticIp
          staticIpFeature={mockStaticIpFeature}
          natGatewayFeature={mockNatGatewayFeature}
          production={false}
        />,
        {
          defaultValues: {
            features: {
              STATIC_IP: { value: true },
              NAT_GATEWAY: { value: true, extendedValue: { static_ips_enabled: true, static_ips_count: 5 } },
            },
          },
        }
      )
    )

    const countInput = screen.getByDisplayValue('5')
    await userEvent.clear(countInput)

    // clearing triggers NaN path → resets to DEFAULT_STATIC_IPS_COUNT (2)
    await waitFor(() => expect(screen.getByDisplayValue('2')).toBeInTheDocument())
  })
})
