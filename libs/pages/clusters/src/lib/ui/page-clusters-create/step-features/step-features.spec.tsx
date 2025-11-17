import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepFeatures, { type StepFeaturesProps } from './step-features'

const STATIC_IP = 'STATIC_IP'

const mockFeatures: ClusterFeatureResponse[] = [
  {
    id: STATIC_IP,
    title: 'feature-1',
    cost_per_month: 23,
    value_object: {
      type: 'STRING',
      value: 'test',
    },
    accepted_values: ['test', 'my-value'],
  },
]

const props: StepFeaturesProps = {
  onSubmit: jest.fn(),
  cloudProvider: CloudProviderEnum.AWS,
  features: mockFeatures,
}

describe('StepFeatures', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<StepFeatures {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          vpc_mode: 'DEFAULT',
          feature: {
            [STATIC_IP]: {
              value_object: {
                type: 'BOOLEAN',
                value: false,
              },
              extendedValue: 'my-value',
            },
          },
        },
      })
    )

    const input = screen.getByTestId('feature')
    await userEvent.click(input)

    // all because we have two inputs on the inputs select with search
    expect(screen.getByDisplayValue('true')).toBeInTheDocument()
  })

  it('should submit the form on click', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<StepFeatures {...props} />, {
        defaultValues: {
          vpc_mode: 'DEFAULT',
          feature: {
            [STATIC_IP]: {
              value: true,
              extendedValue: 'my-value',
            },
          },
        },
      })
    )

    const button = screen.getByTestId('button-submit')

    const input = screen.getByTestId('feature')

    await userEvent.click(input)
    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(props.onSubmit).toHaveBeenCalled()
  })

  describe('Scaleway', () => {
    const scwProps: StepFeaturesProps = {
      ...props,
      cloudProvider: CloudProviderEnum.SCW,
      features: [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          description: 'Enable static IP addresses',
          value_object: {
            type: 'BOOLEAN',
            value: true,
          },
          is_cloud_provider_paying_feature: true,
          cloud_provider_feature_documentation: 'https://www.scaleway.com/en/docs/',
        },
        {
          id: 'NAT_GATEWAY',
          title: 'NAT Gateway',
          description: 'Enable NAT Gateway',
          value_object: {
            type: 'STRING',
            value: 'VPC-GW-S',
          },
          is_cloud_provider_paying_feature: true,
        },
      ],
    }

    it('should render Scaleway specific description', () => {
      renderWithProviders(wrapWithReactHookForm(<StepFeatures {...scwProps} />))
      expect(screen.getByText('Configure network features for your Scaleway cluster.')).toBeInTheDocument()
    })

    it('should not render VPC mode selection for Scaleway', () => {
      renderWithProviders(wrapWithReactHookForm(<StepFeatures {...scwProps} />))
      expect(screen.queryByText('Qovery managed')).not.toBeInTheDocument()
      expect(screen.queryByText('Self-managed')).not.toBeInTheDocument()
    })

    it('should render Scaleway features component with merged Static IP / Nat Gateways', () => {
      renderWithProviders(
        wrapWithReactHookForm(<StepFeatures {...scwProps} />, {
          defaultValues: {
            features: {
              STATIC_IP: { value: false },
              NAT_GATEWAY: { value: false, extendedValue: 'VPC-GW-S' },
            },
          },
        })
      )
      expect(screen.getByRole('heading', { name: 'Static IP / Nat Gateways' })).toBeInTheDocument()
      expect(screen.getByText('NAT Gateway Type')).toBeInTheDocument()
    })

    it('should render submit button for Scaleway', () => {
      renderWithProviders(
        wrapWithReactHookForm(<StepFeatures {...scwProps} />, {
          defaultValues: {
            vpc_mode: 'DEFAULT',
            features: {
              STATIC_IP: { value: true },
              NAT_GATEWAY: { value: true, extendedValue: 'VPC-GW-M' },
            },
          },
        })
      )

      const button = screen.getByTestId('button-submit')
      expect(button).toBeInTheDocument()
    })
  })
})
