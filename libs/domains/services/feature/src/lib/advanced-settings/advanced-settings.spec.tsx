import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as hooks from '../hooks/use-edit-advanced-settings/use-edit-advanced-settings'
import { AdvancedSettings } from './advanced-settings'

const mockApplication: Application = applicationFactoryMock(1)[0]

type AdvancedSettingsType = string | number | object | boolean | null

const advancedSettings: Record<string, AdvancedSettingsType> = {
  'deployment.affinity.node.required': {},
  'cronjob.success_jobs_history_limit': 3,
  'deployment.custom_domain_check_enabled': true,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': 3,
}

const defaultAdvancedSettings: Record<string, AdvancedSettingsType> = {
  'deployment.affinity.node.required': { key: 'value' },
  'cronjob.success_jobs_history_limit': 1,
  'deployment.custom_domain_check_enabled': true,
  test_empty: '',
  'job.delete_ttl_seconds_after_finished': 3,
}

describe('AdvancedSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    expect(baseElement).toBeTruthy()
  })
  it('should have three inputs', () => {
    renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    expect(screen.getAllByRole('textbox').length).toBe(5)
  })
  // TODO: flaky test to fix
  it.skip('should show the sticky action bar if form dirty', async () => {
    const { userEvent } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    const input = screen.getByLabelText('deployment.affinity.node.required')
    await userEvent.clear(input)
    await userEvent.type(input, 'hello')

    await waitFor(() => expect(screen.getByTestId('sticky-action-form-toaster')).toHaveClass('visible'))
  })

  it('should disabled the form submit', async () => {
    const { userEvent, container } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    const input = container.querySelector('textarea[name="deployment.affinity.node.required"]')
    if (input) {
      await userEvent.type(input, '79')
      await userEvent.clear(input)
    }

    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('field with empty defaultValue should not be required', async () => {
    const { userEvent, container } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    const input = container.querySelector('textarea[name="test_empty"]')
    if (input) {
      await userEvent.type(input, '79')
      await userEvent.clear(input)
    }

    expect(screen.getByTestId('submit-button')).toBeEnabled()
  })

  it('should display only overridden settings', async () => {
    const advancedSettings = {
      'cronjob.success_jobs_history_limit': 3,
      'deployment.custom_domain_check_enabled': true,
      'deployment.affinity.node.required': { key: 'value' },
    }
    const { userEvent } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    await userEvent.click(screen.getByRole('checkbox'))
    const count = screen.getAllByRole('row').filter((row) => row.classList.contains('hidden')).length

    expect(count).toBe(2)
  })

  it('should call endpoint on submit', async () => {
    const mutate = jest.fn()
    jest.spyOn(hooks, 'useEditAdvancedSettings').mockImplementation(() => ({
      mutate,
    }))
    const { userEvent, container } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    const input = container.querySelector('textarea[name="test_empty"]')
    if (input) await userEvent.type(input, '79')

    await userEvent.click(screen.getByTestId('submit-button'))

    expect(mutate).toHaveBeenCalledWith({
      payload: {
        'cronjob.success_jobs_history_limit': 3,
        'deployment.affinity.node.required': {},
        'deployment.custom_domain_check_enabled': true,
        'job.delete_ttl_seconds_after_finished': 3,
        serviceType: 'APPLICATION',
        test_empty: 79,
      },
      serviceId: '0',
    })
  })
})
