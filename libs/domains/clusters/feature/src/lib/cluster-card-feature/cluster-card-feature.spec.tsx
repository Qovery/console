import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterCardFeature, type ClusterCardFeatureProps } from './cluster-card-feature'

const STATIC_IP = 'STATIC_IP'

const props: ClusterCardFeatureProps = {
  cloudProvider: CloudProviderEnum.AWS,
  feature: {
    id: STATIC_IP,
    title: 'feature-1',
    cost_per_month: 23,
    value_object: {
      type: 'STRING',
      value: 'my-value',
    },
    accepted_values: ['test', 'my-value'],
  },
}

describe('ClusterCardFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterCardFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', () => {
    const { getAllByDisplayValue } = renderWithProviders(
      wrapWithReactHookForm(<ClusterCardFeature {...props} />, {
        defaultValues: {
          [STATIC_IP]: {
            value: true,
            extendedValue: 'my-value',
          },
        },
      })
    )

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(getAllByDisplayValue('my-value').length).toBeGreaterThan(0)
  })

  it('should render feature title and description', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCardFeature {...props} />))

    const titles = screen.getAllByText('feature-1')
    expect(titles.length).toBeGreaterThanOrEqual(1)
    const heading = screen.getByRole('heading', { level: 4 })
    expect(heading).toHaveTextContent('feature-1')
  })

  it('should render disabled toggle when disabled prop is true', () => {
    renderWithProviders(wrapWithReactHookForm(<ClusterCardFeature {...props} disabled />))

    const toggle = screen.getByTestId('feature')
    expect(toggle).toBeInTheDocument()
  })

  it('should show NAT_GATEWAY as false when gcp nested static_ips_enabled is false', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterCardFeature
          cloudProvider={CloudProviderEnum.GCP}
          feature={{
            id: 'NAT_GATEWAY',
            title: 'Static IP / Nat Gateways',
            value_object: {
              type: 'NAT_GATEWAY',
              value: {
                nat_gateway_type: {
                  provider: 'gcp',
                  static_ips_enabled: false,
                  static_ips_count: 2,
                },
              },
            },
          }}
          disabled
        />
      )
    )

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('should read NAT_GATEWAY nested nat_gateway_type static_ips_enabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterCardFeature
          cloudProvider={CloudProviderEnum.GCP}
          feature={{
            id: 'NAT_GATEWAY',
            title: 'Static IP / Nat Gateways',
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
          }}
          disabled
        />
      )
    )

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})
