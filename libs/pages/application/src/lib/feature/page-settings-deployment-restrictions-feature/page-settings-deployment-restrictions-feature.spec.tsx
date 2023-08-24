import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import * as servicesDomains from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsDeploymentRestrictionsFeature } from './page-settings-deployment-restrictions-feature'

const deploymentRestrictionsMocks = [
  {
    id: '0',
    mode: DeploymentRestrictionModeEnum.EXCLUDE,
    type: DeploymentRestrictionTypeEnum.PATH,
    created_at: '2022-07-21T09:59:41.999006Z',
    value: 'foo',
  },
  {
    id: '1',
    mode: DeploymentRestrictionModeEnum.MATCH,
    type: DeploymentRestrictionTypeEnum.PATH,
    created_at: '2022-06-21T09:59:41.999006Z',
    value: 'bar',
  },
]

describe('PageSettingsDeploymentRestrictionsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsDeploymentRestrictionsFeature />)

    expect(baseElement).toBeTruthy()
  })

  it('should display deployment restrictions list', () => {
    jest.spyOn(servicesDomains, 'useDeploymentRestrictions').mockReturnValue({
      data: deploymentRestrictionsMocks,
      isLoading: false,
      error: {},
    })
    renderWithProviders(<PageSettingsDeploymentRestrictionsFeature />)
    screen.getByDisplayValue(/foo/)
    screen.getByDisplayValue(/bar/)
  })

  it('should display empty state', () => {
    jest.spyOn(servicesDomains, 'useDeploymentRestrictions').mockReturnValue({
      data: [],
      isLoading: false,
      error: {},
    })
    renderWithProviders(<PageSettingsDeploymentRestrictionsFeature />)
    screen.getByText(/No deployment restrictions are set/)
  })

  it('should display item actions', () => {
    jest.spyOn(servicesDomains, 'useDeploymentRestrictions').mockReturnValue({
      data: deploymentRestrictionsMocks,
      isLoading: false,
      error: {},
    })
    renderWithProviders(<PageSettingsDeploymentRestrictionsFeature />)
    expect(screen.getAllByTestId('edit')).toHaveLength(2)
    expect(screen.getAllByTestId('remove')).toHaveLength(2)
  })
})
