import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { WeekdayEnum } from 'qovery-typescript-axios'
import { timezoneValues } from '@qovery/shared/utils'
import PageSettingsDeployment, { PageSettingsDeploymentProps } from './page-settings-deployment'

describe('PageSettingsDeployment', () => {
  const props: PageSettingsDeploymentProps = {
    watchAutoStop: false,
    onSubmit: jest.fn(),
    loading: false,
  }

  const defaultValues = {
    auto_deploy: true,
    auto_delete: false,
    auto_stop: true,
    weekdays: [WeekdayEnum.MONDAY, WeekdayEnum.FRIDAY],
    timezone: timezoneValues[0].value,
    start_time: `1970-01-01T09:00:00.000Z`,
    stop_time: `1970-01-01T19:00:00.000Z`,
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsDeployment {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should not render the form with auto stop fields', async () => {
    props.watchAutoStop = false

    const { queryByTestId } = render(
      wrapWithReactHookForm(<PageSettingsDeployment {...props} />, {
        defaultValues: defaultValues,
      })
    )

    expect(queryByTestId('auto-deploy')).toBeVisible()
    expect(queryByTestId('auto-delete')).toBeVisible()
    expect(queryByTestId('auto-stop')).toBeVisible()
    expect(queryByTestId('weekdays')).not.toBeInTheDocument()
    expect(queryByTestId('timezone')).not.toBeInTheDocument()
    expect(queryByTestId('start-time')).not.toBeInTheDocument()
    expect(queryByTestId('stop-time')).not.toBeInTheDocument()
  })

  it('should render the form with auto stop fields', async () => {
    props.watchAutoStop = true

    const { queryByTestId } = render(
      wrapWithReactHookForm(<PageSettingsDeployment {...props} />, {
        defaultValues: defaultValues,
      })
    )

    expect(queryByTestId('auto-deploy')).toBeVisible()
    expect(queryByTestId('auto-delete')).toBeVisible()
    expect(queryByTestId('auto-stop')).toBeVisible()
    expect(queryByTestId('weekdays')).toBeVisible()
    expect(queryByTestId('timezone')).toBeVisible()
    expect(queryByTestId('start-time')).toBeVisible()
    expect(queryByTestId('stop-time')).toBeVisible()
  })
})
