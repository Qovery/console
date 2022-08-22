import { render } from '@testing-library/react'
import { WeekdayEnum } from 'qovery-typescript-axios'
import { environmentFactoryMock } from '@console/domains/environment'
import { weekdaysValues } from '@console/shared/utils'
import PageSettingsDeploymentFeature, { handleSubmit } from './page-settings-deployment-feature'

const environmentDeploymentRules = environmentFactoryMock(1)[0].deploymentRules

describe('PageSettingsDeploymentFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDeploymentFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the application with Docker', () => {
    const startTime = '08:00'
    const stopTime = '19:00'

    const env = handleSubmit(
      {
        auto_deploy: true,
        auto_delete: false,
        auto_stop: true,
        weekdays: weekdaysValues,
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
