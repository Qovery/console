import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsAdvanced, type PageSettingsAdvancedProps } from './page-settings-advanced'

const keys = [
  'load_balancer.size',
  'cronjob.success_jobs_history_limit',
  'test_empty',
  'job.delete_ttl_seconds_after_finished',
]
const defaultValues: { [key: string]: string | number | null } = {
  'load_balancer.size': '/',
  'cronjob.success_jobs_history_limit': 3,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': 3,
}

const defaultAdvancedSetting: { [key: string]: string | number | null } = {
  'load_balancer.size': '/',
  'cronjob.success_jobs_history_limit': 1,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': null,
}

const props: PageSettingsAdvancedProps = {
  keys: keys,
  discardChanges: jest.fn(),
  onSubmit: jest.fn(),
  defaultAdvancedSettings: defaultAdvancedSetting,
  loading: false,
  advancedSettings: undefined,
}

describe('PageSettingsAdvanced', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have three inputs', () => {
    renderWithProviders(wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues }))
    expect(screen.getAllByRole('textbox').length).toBe(4)
  })

  it('should show the sticky action bar if form dirty', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    const input = container.querySelector('textarea[name="load_balancer.size"]')
    if (input) await userEvent.type(input, 'hello')

    expect(screen.getByTestId('sticky-action-form-toaster')).toHaveClass('visible')
  })

  it('should disabled the form submit', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    const input = container.querySelector('textarea[name="load_balancer.size"]')
    if (input) {
      await userEvent.type(input, '79')
      await userEvent.clear(input)
    }

    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('field with empty defaultValue should not be required', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    const input = container.querySelector('textarea[name="test_empty"]')
    if (input) {
      await userEvent.type(input, '79')
      await userEvent.clear(input)
    }

    expect(screen.getByTestId('submit-button')).toBeEnabled()
  })

  it('should display only overridden settings', async () => {
    props.advancedSettings = {
      'build.timeout_max_sec': 60,
      'deployment.custom_domain_check_enabled': true,
      'load_balancer.size': '/',
    }
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await userEvent.click(screen.getByTestId('show-overriden-only-toggle'))

    let count = 0
    screen.getAllByTestId('edition-table-row').forEach((row) => {
      if (row.classList.contains('hidden')) {
        count++
      }
    })

    expect(count).toBe(1)
  })
})
