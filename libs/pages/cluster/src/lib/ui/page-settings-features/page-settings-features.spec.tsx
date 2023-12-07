import { render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import PageSettingsFeatures, { type PageSettingsFeaturesProps } from './page-settings-features'

const cluster = clusterFactoryMock(1)[0]

describe('PageSettingsFeatures', () => {
  const props: PageSettingsFeaturesProps = {
    loading: false,
    cloudProvider: CloudProviderEnum.AWS,
    features: cluster.features,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeatures {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a loader spinner', () => {
    props.loading = true
    const { getByTestId } = render(<PageSettingsFeatures {...props} />)
    getByTestId('spinner')
  })

  it('should render a list of features', () => {
    props.loading = false
    props.features = [
      {
        title: 'feature 1',
        value: true,
        description: 'description 1',
        cost_per_month: 80,
      },
      {
        title: 'feature 2',
        value: true,
        description: 'description 2',
        cost_per_month: 80,
      },
    ]

    const { getAllByTestId } = render(<PageSettingsFeatures {...props} />)

    getAllByTestId('feature')
  })
})
