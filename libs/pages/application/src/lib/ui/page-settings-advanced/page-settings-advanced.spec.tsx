import { act, fireEvent, getByTestId, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageSettingsAdvanced, { type PageSettingsAdvancedProps } from './page-settings-advanced'

const keys = [
  'deployment.affinity.node.required',
  'cronjob.success_jobs_history_limit',
  'test_empty',
  'job.delete_ttl_seconds_after_finished',
  'deployment.custom_domain_check_enabled',
]

type AdvancedSettingsType = string | number | object | boolean | null

const defaultValues: { [key: string]: AdvancedSettingsType } = {
  'deployment.affinity.node.required': {},
  'cronjob.success_jobs_history_limit': 3,
  'deployment.custom_domain_check_enabled': true,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': 3,
}

const defaultAdvancedSetting: { [key: string]: AdvancedSettingsType } = {
  'deployment.affinity.node.required': { key: 'value' },
  'cronjob.success_jobs_history_limit': 1,
  'deployment.custom_domain_check_enabled': true,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': 3,
}

const props: PageSettingsAdvancedProps = {
  keys: keys,
  discardChanges: jest.fn(),
  onSubmit: jest.fn(),
  defaultAdvancedSettings: defaultAdvancedSetting,
  loading: 'loaded',
  advancedSettings: undefined,
}

describe('PageSettingsAdvanced', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )
    expect(baseElement).toBeTruthy()
  })

  it('should have three inputs', () => {
    const { getAllByTestId } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )
    expect(getAllByTestId('input').length).toBe(4)
  })

  it('should show the sticky action bar if form dirty', async () => {
    const { getByTestId, getByLabelText } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      const input = getByLabelText('deployment.affinity.node.required')
      fireEvent.input(input, { target: { value: 'hello' } })
    })

    expect(getByTestId('sticky-action-form-toaster')).toHaveClass('visible')
  })

  it('should disabled the form submit', async () => {
    const { getByTestId, getByLabelText } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      const input = getByLabelText('deployment.affinity.node.required')
      fireEvent.input(input, { target: { value: '79' } })
      fireEvent.input(input, { target: { value: '' } })
    })

    expect(getByTestId('submit-button')).toBeDisabled()
  })

  it('field with empty defaultValue should not be required', async () => {
    const { getByLabelText, baseElement } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      const input = getByLabelText('test_empty')
      fireEvent.input(input, { target: { value: '79' } })
      fireEvent.input(input, { target: { value: '' } })
    })

    expect(getByTestId(baseElement, 'submit-button')).not.toBeDisabled()
  })

  it('should display only overridden settings', async () => {
    props.advancedSettings = {
      'cronjob.success_jobs_history_limit': 3,
      'deployment.custom_domain_check_enabled': true,
      'deployment.affinity.node.required': { key: 'value' },
    }
    const { getByTestId, getAllByTestId } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      getByTestId('show-overriden-only-toggle').click()
    })

    let count = 0
    getAllByTestId('edition-table-row').forEach((row) => {
      if (row.classList.contains('hidden')) {
        count++
      }
    })

    expect(count).toBe(2)
  })
})
