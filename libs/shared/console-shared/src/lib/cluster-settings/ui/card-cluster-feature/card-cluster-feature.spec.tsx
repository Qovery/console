import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import CardClusterFeature, { type CardClusterFeatureProps } from './card-cluster-feature'

const STATIC_IP = 'STATIC_IP'

const props: CardClusterFeatureProps = {
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

describe('CardClusterFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<CardClusterFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getByDisplayValue, getAllByDisplayValue } = render(
      wrapWithReactHookForm(<CardClusterFeature {...props} />, {
        defaultValues: {
          [STATIC_IP]: {
            value: true,
            extendedValue: 'my-value',
          },
        },
      })
    )

    getByDisplayValue('true')
    // all because we have two inputs on the inputs select with search
    getAllByDisplayValue('my-value')
  })

  describe('backward compatibility with old API format', () => {
    it('should render with old format - boolean value (enabled)', () => {
      const oldFormatProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: STATIC_IP,
          title: 'Static IP',
          value_object: {
            type: 'BOOLEAN',
            value: true,
          },
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...oldFormatProps} />))
      expect(baseElement).toBeTruthy()

      // Check that the toggle is rendered with correct value
      const toggle = getByRole('checkbox')
      expect(toggle).toBeChecked()
    })

    it('should render with old format - boolean value (disabled)', () => {
      const oldFormatProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: STATIC_IP,
          title: 'Static IP',
          value_object: {
            type: 'BOOLEAN',
            value: false,
          },
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...oldFormatProps} />))
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).not.toBeChecked()
    })
  })

  describe('new API format compatibility', () => {
    it('should render with new format - common static IP (enabled)', () => {
      const newFormatProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: STATIC_IP,
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'common',
              value: true,
              is_enabled: true,
            },
          },
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...newFormatProps} />))
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).toBeChecked()
    })

    it('should render with new format - common static IP (disabled)', () => {
      const newFormatProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: STATIC_IP,
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'common',
              value: false,
              is_enabled: false,
            },
          },
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...newFormatProps} />))
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).not.toBeChecked()
    })

    it('should render with new format - Scaleway static IP with gateway type', () => {
      const newFormatScalewayProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.SCW,
        feature: {
          id: STATIC_IP,
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'scaleway',
              value: true,
              is_enabled: true,
              gateway_type: 'VPC_GW_M',
              dhcp_subnet_cidr: '172.16.0.0/24',
            },
          },
        },
      }

      const { baseElement, getByRole } = render(
        wrapWithReactHookForm(<CardClusterFeature {...newFormatScalewayProps} />)
      )
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).toBeChecked()
    })
  })

  describe('handles null/undefined value_object', () => {
    it('should render with null value_object', () => {
      const nullValueProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: 'EXISTING_VPC',
          title: 'Existing VPC',
          value_object: null,
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...nullValueProps} />))
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).not.toBeChecked()
    })

    it('should render with undefined value_object', () => {
      const undefinedValueProps: CardClusterFeatureProps = {
        cloudProvider: CloudProviderEnum.AWS,
        feature: {
          id: 'EXISTING_VPC',
          title: 'Existing VPC',
        },
      }

      const { baseElement, getByRole } = render(wrapWithReactHookForm(<CardClusterFeature {...undefinedValueProps} />))
      expect(baseElement).toBeTruthy()

      const toggle = getByRole('checkbox')
      expect(toggle).not.toBeChecked()
    })
  })
})
