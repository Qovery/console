import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum, WeekdayEnum } from 'qovery-typescript-axios'
import * as environmentDomain from '@qovery/domains/environments/feature'
import * as servicesDomains from '@qovery/domains/services/feature'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsDeploymentRestrictionsFeature } from './page-settings-deployment-restrictions-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectId: '0', environmentId: '0', applicationId: '0' }),
}))

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
  beforeEach(() => {
    jest.spyOn(servicesDomains, 'useServiceType').mockReturnValue({
      data: ServiceTypeEnum.APPLICATION,
      isLoading: false,
      error: {},
    })
    jest.spyOn(environmentDomain, 'useDeploymentRule').mockReturnValue({
      data: {
        auto_stop: true,
        auto_preview: true,
        created_at: '2020-01-01T00:00:00Z',
        start_time: '1970-01-01T08:00:00.000Z',
        stop_time: '1970-01-01T18:00:00.000Z',
        weekdays: [WeekdayEnum.MONDAY, WeekdayEnum.FRIDAY],
        updated_at: '2020-01-01T00:00:00Z',
        timezone: 'UTC',
        id: '1',
      },
      isLoading: false,
    })
  })
  it('should render successfully', () => {
    jest.spyOn(servicesDomains, 'useDeploymentRestrictions').mockReturnValue({
      data: deploymentRestrictionsMocks,
      isLoading: false,
      error: {},
    })
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
