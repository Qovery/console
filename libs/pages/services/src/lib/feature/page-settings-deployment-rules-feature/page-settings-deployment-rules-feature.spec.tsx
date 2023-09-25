import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { act, render } from '__tests__/utils/setup-jest'
import { type EnvironmentDeploymentRule, WeekdayEnum } from 'qovery-typescript-axios'
import * as redux from 'react-redux'
import * as environmentDomain from '@qovery/domains/environment'
import { weekdaysValues } from '@qovery/shared/enums'
import { environmentFactoryMock } from '@qovery/shared/factories'
import PageSettingsDeploymentRulesFeature, { handleSubmit } from './page-settings-deployment-rules-feature'

import SpyInstance = jest.SpyInstance

const environmentDeploymentRules = environmentFactoryMock(1)[0].deploymentRules

const useFetchEnvironmentDeploymentRuleSpy = jest.spyOn(environmentDomain, 'useFetchEnvironmentDeploymentRule')

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ environmentId: '1' }),
}))

describe('PageSettingsDeploymentRulesFeature', () => {
  let useSelectorSpy: SpyInstance

  const customDeployment = {
    id: '1',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    auto_stop: true,
    auto_preview: true,
    timezone: 'UTC',
    start_time: '1970-01-01T08:00:00.000Z',
    stop_time: '1970-01-01T18:00:00.000Z',
    weekdays: [WeekdayEnum.MONDAY, WeekdayEnum.FRIDAY],
  }

  beforeEach(() => {
    useSelectorSpy = jest.spyOn(redux, 'useSelector')
    useSelectorSpy.mockReturnValue(environmentDeploymentRules).mockReturnValue(customDeployment)

    useFetchEnvironmentDeploymentRuleSpy.mockReturnValue(
      mockUseQueryResult<EnvironmentDeploymentRule>({
        auto_stop: true,
        auto_preview: true,
        created_at: '2020-01-01T00:00:00Z',
        start_time: '1970-01-01T08:00:00.000Z',
        stop_time: '1970-01-01T18:00:00.000Z',
        weekdays: [WeekdayEnum.MONDAY, WeekdayEnum.FRIDAY],
        updated_at: '2020-01-01T00:00:00Z',
        timezone: 'UTC',
        id: '1',
      })
    )
  })

  it('should render successfully & dispatch the deployment fetch', async () => {
    const promise = Promise.resolve()
    const { baseElement } = render(<PageSettingsDeploymentRulesFeature />)
    expect(baseElement).toBeTruthy()

    expect(useFetchEnvironmentDeploymentRuleSpy).toHaveBeenCalledWith('', '1')

    await act(async () => {
      await promise
    })
  })

  it('should submit the form', () => {
    const startTime = '08:00'
    const stopTime = '19:00'

    const env = handleSubmit(
      {
        auto_stop: true,
        weekdays: weekdaysValues.map((weekday) => weekday.value),
        start_time: startTime,
        stop_time: stopTime,
      },
      environmentDeploymentRules
    )
    expect(env.auto_stop).toBe(true)
    expect(env.weekdays).toStrictEqual([
      WeekdayEnum.MONDAY,
      WeekdayEnum.TUESDAY,
      WeekdayEnum.WEDNESDAY,
      WeekdayEnum.THURSDAY,
      WeekdayEnum.FRIDAY,
      WeekdayEnum.SATURDAY,
      WeekdayEnum.SUNDAY,
    ])
    expect(env.start_time).toBe(`1970-01-01T${startTime}:00.000Z`)
    expect(env.stop_time).toBe(`1970-01-01T${stopTime}:00.000Z`)
  })
})
