import { act, render } from '__tests__/utils/setup-jest'
import { WeekdayEnum } from 'qovery-typescript-axios'
import * as redux from 'react-redux'
import { environmentFactoryMock } from '@qovery/shared/factories'
import { weekdaysValues } from '@qovery/shared/utils'
import PageSettingsDeploymentFeature, { handleSubmit } from './page-settings-deployment-feature'

import SpyInstance = jest.SpyInstance

const environmentDeploymentRules = environmentFactoryMock(1)[0].deploymentRules

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ environmentId: '1' }),
}))

describe('PageSettingsDeploymentFeature', () => {
  let useDispatchSpy: SpyInstance
  let useSelectorSpy: SpyInstance

  const customDeployment = {
    id: '1',
    updated_at: '2020-01-01T00:00:00Z',
    created_at: '2020-01-01T00:00:00Z',
    auto_deploy: true,
    auto_stop: true,
    auto_delete: true,
    auto_preview: true,
    timezone: 'UTC',
    start_time: '1970-01-01T08:00:00.000Z',
    stop_time: '1970-01-01T18:00:00.000Z',
    weekdays: [WeekdayEnum.MONDAY, WeekdayEnum.FRIDAY],
  }

  beforeEach(() => {
    useDispatchSpy = jest.spyOn(redux, 'useDispatch').mockReturnValue(jest.fn())
    useSelectorSpy = jest.spyOn(redux, 'useSelector')
    useSelectorSpy.mockReturnValue(environmentDeploymentRules).mockReturnValue(customDeployment)
  })

  it('should render successfully & dispatch the deployment fetch', async () => {
    const promise = Promise.resolve()
    const { baseElement } = render(<PageSettingsDeploymentFeature />)
    expect(baseElement).toBeTruthy()
    expect(useDispatchSpy).toHaveBeenCalled()

    await act(async () => {
      await promise
    })
  })

  it('should submit the form', () => {
    const startTime = '08:00'
    const stopTime = '19:00'

    const env = handleSubmit(
      {
        auto_deploy: true,
        auto_delete: false,
        auto_stop: true,
        weekdays: weekdaysValues.map((weekday) => weekday.value),
        start_time: startTime,
        stop_time: stopTime,
      },
      environmentDeploymentRules
    )
    expect(env.auto_deploy).toBe(true)
    expect(env.auto_delete).toBe(false)
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
