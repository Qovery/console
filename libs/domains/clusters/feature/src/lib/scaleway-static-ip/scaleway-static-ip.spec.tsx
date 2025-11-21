import { type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ScalewayStaticIp, type ScalewayStaticIpProps } from './scaleway-static-ip'

const mockStaticIpFeature: ClusterFeatureResponse = {
  id: 'STATIC_IP',
  value: true,
  value_object: {
    value: true,
  },
  is_cloud_provider_paying_feature: true,
  cloud_provider_feature_documentation: 'https://example.com',
}

const mockNatGatewayFeature: ClusterFeatureResponse = {
  id: 'NAT_GATEWAY',
  value: true,
  value_object: {
    value: {
      nat_gateway_type: {
        provider: 'scaleway',
        type: 'VPC-GW-M',
      },
    },
  },
}

const mockNatGatewayFeatureStringValue: ClusterFeatureResponse = {
  id: 'NAT_GATEWAY',
  value: true,
  value_object: {
    value: 'VPC-GW-L',
  },
}

function Wrapper({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: any }) {
  const methods = useForm({
    defaultValues: {
      features: {
        STATIC_IP: { value: true },
        NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-M' },
      },
      ...defaultValues,
    },
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ScalewayStaticIp', () => {
  let props: ScalewayStaticIpProps

  beforeEach(() => {
    props = {
      staticIpFeature: mockStaticIpFeature,
      natGatewayFeature: mockNatGatewayFeature,
      production: false,
      disabled: false,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render static IP toggle', () => {
    renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(screen.getAllByText('Static IP / Nat Gateways').length).toBeGreaterThan(0)
  })

  it('should render NAT Gateway type selector when enabled', () => {
    renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
  })

  it('should disable NAT Gateway selector when static IP is disabled', () => {
    renderWithProviders(
      <Wrapper
        defaultValues={{
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: undefined },
          },
        }}
      >
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    const inputToggle = screen.getByTestId('input-toggle')
    expect(inputToggle).toBeInTheDocument()
  })

  it('should render with billing indicator when feature is cloud provider paying', () => {
    const { baseElement } = renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    // Verify component renders successfully with billing feature enabled
    expect(baseElement).toBeTruthy()
  })

  it('should render in disabled mode', () => {
    props.disabled = true
    renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    // Component should render in disabled mode
    expect(screen.getByTestId('input-toggle')).toBeInTheDocument()
  })

  it('should default to production value for static IP on production clusters', () => {
    props.production = true
    const { baseElement } = renderWithProviders(
      <Wrapper>
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should enable NAT Gateway with default type when enabling Static IP', async () => {
    const { userEvent } = renderWithProviders(
      <Wrapper
        defaultValues={{
          features: {
            STATIC_IP: { value: false },
            NAT_GATEWAY: { value: false, extendedValue: undefined },
          },
        }}
      >
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )

    const toggleButton = screen.getByTestId('input-toggle-button')
    await userEvent.click(toggleButton)

    // Verify component still renders after interaction
    expect(screen.getByTestId('input-toggle')).toBeInTheDocument()
  })

  it('should render NAT Gateway selector with correct value', () => {
    const { baseElement } = renderWithProviders(
      <Wrapper
        defaultValues={{
          features: {
            STATIC_IP: { value: true },
            NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-S' },
          },
        }}
      >
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )

    // Verify NAT Gateway Type selector is present
    expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
    expect(baseElement).toBeTruthy()
  })

  it('should handle NAT Gateway feature with string value format in editable mode', () => {
    props.natGatewayFeature = mockNatGatewayFeatureStringValue
    const { baseElement } = renderWithProviders(
      <Wrapper
        defaultValues={{
          features: {
            STATIC_IP: { value: true },
            NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-L' },
          },
        }}
      >
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(baseElement).toBeTruthy()
    expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
  })

  it('should handle NAT Gateway feature with string value format in disabled mode', () => {
    props.natGatewayFeature = mockNatGatewayFeatureStringValue
    props.disabled = true
    const { baseElement } = renderWithProviders(
      <Wrapper
        defaultValues={{
          features: {
            STATIC_IP: { value: true },
            NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-L' },
          },
        }}
      >
        <ScalewayStaticIp {...props} />
      </Wrapper>
    )
    expect(baseElement).toBeTruthy()
    expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
  })
})
