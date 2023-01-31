import { render } from '@testing-library/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock } from '@qovery/shared/factories'
import { ClusterEntity } from '@qovery/shared/interfaces'
import PageSettingsFeatures, { PageSettingsFeaturesProps } from './page-settings-features'

const cluster: ClusterEntity = clusterFactoryMock(1)[0]

describe('PageSettingsFeatures', () => {
  const props: PageSettingsFeaturesProps = {
    loadingStatus: 'loaded',
    cloudProvider: CloudProviderEnum.AWS,
    features: cluster.features,
  }

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsFeatures {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a loader spinner', () => {
    props.loadingStatus = 'not loaded'
    const { getByTestId } = render(<PageSettingsFeatures {...props} />)
    getByTestId('spinner')
  })

  it('should render a list of features', () => {
    props.loadingStatus = 'loaded'
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
