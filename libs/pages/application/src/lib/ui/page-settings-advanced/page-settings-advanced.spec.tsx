import { act, fireEvent, getByLabelText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import PageSettingsAdvanced, { PageSettingsAdvancedProps } from './page-settings-advanced'

const keys = ['build.timeout_max_sec', 'deployment.custom_domain_check_enabled', 'liveness_probe.http_get.path']
const defaultValues: { [key: string]: string } = {
  'build.timeout_max_sec': '60',
  'deployment.custom_domain_check_enabled': 'true',
  'liveness_probe.http_get.path': '/',
}

const defaultAdvancedSetting: { [key: string]: string } = {
  'build.timeout_max_sec': '62',
  'deployment.custom_domain_check_enabled': 'true',
  'liveness_probe.http_get.path': '/',
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
    expect(getAllByTestId('input').length).toBe(3)
  })

  it('should show the sticky action bar if form dirty', async () => {
    const { getByTestId, getByLabelText } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      const input = getByLabelText('build.timeout_max_sec')
      fireEvent.input(input, { target: { value: '9999' } })
    })

    expect(getByTestId('sticky-action-form-toaster')).toHaveClass('visible')
  })

  it('should disabled the form submit', async () => {
    const { getByTestId, getByLabelText } = render(
      wrapWithReactHookForm(<PageSettingsAdvanced {...props} />, { defaultValues: defaultValues })
    )

    await act(() => {
      const input = getByLabelText('build.timeout_max_sec')
      fireEvent.input(input, { target: { value: '79' } })
      fireEvent.input(input, { target: { value: '' } })
    })

    expect(getByTestId('submit-button')).toBeDisabled()
  })

  it('should display only overridden settings', async () => {
    props.advancedSettings = {
      'build.timeout_max_sec': 60,
      'deployment.custom_domain_check_enabled': true,
      'liveness_probe.http_get.path': '/',
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
