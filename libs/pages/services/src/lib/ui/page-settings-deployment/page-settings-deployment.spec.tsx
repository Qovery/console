import { render, screen } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { timezoneValues, weekdaysValues } from '@console/shared/utils'
import PageSettingsDeployment, { PageSettingsDeploymentProps } from './page-settings-deployment'

describe('PageSettingsDeployment', () => {
  const props: PageSettingsDeploymentProps = {
    watchAutoStop: false,
    onSubmit: jest.fn(),
  }

  const defaultValues = {
    auto_deploy: true,
    auto_delete: false,
    auto_stop: true,
    weekdays: weekdaysValues.map((day) => day.value),
    timezone: timezoneValues[0].value,
    start_time: `1970-01-01T09:00:00.000Z`,
    stop_time: `1970-01-01T19:00:00.000Z`,
  }

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsDeployment {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with docker section', async () => {
    render(
      wrapWithReactHookForm(<PageSettingsDeployment {...props} />, {
        defaultValues: defaultValues,
      })
    )

    // const buildMode = screen.getByTestId('input-select-mode')
    // const dockerfile = screen.getByTestId('input-text-dockerfile')

    screen.getByDisplayValue('hello-world')
    // expect(buildMode.querySelector('.input__value')?.textContent).toContain(upperCaseFirstLetter(BuildModeEnum.DOCKER))
    // expect(dockerfile.getAttribute('value')).toBe('Dockerfile')
  })
})
