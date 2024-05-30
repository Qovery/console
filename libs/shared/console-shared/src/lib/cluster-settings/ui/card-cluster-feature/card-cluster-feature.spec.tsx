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
})
