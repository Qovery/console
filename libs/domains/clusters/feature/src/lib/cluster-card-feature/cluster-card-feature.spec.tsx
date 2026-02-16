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
    const { getByDisplayValue, getAllByDisplayValue } = renderWithProviders(
      wrapWithReactHookForm(<ClusterCardFeature {...props} />, {
        defaultValues: {
          [STATIC_IP]: {
            value: true,
            extendedValue: 'my-value',
          },
        },
      })
    )

    expect(getByDisplayValue('true')).toBeInTheDocument()
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
})
