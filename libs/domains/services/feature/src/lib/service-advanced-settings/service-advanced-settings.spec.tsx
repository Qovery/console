import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AdvancedSettings } from './service-advanced-settings'

const mockMutateEdit = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: '', projectId: '' }),
}))

jest.mock('../hooks/use-advanced-settings/use-advanced-settings', () => ({
  useAdvancedSettings: () => ({ data: undefined }),
}))

jest.mock('../hooks/use-default-advanced-settings/use-default-advanced-settings', () => ({
  useDefaultAdvancedSettings: () => ({ data: undefined }),
}))

jest.mock('../hooks/use-edit-advanced-settings/use-edit-advanced-settings', () => ({
  useEditAdvancedSettings: () => ({ mutate: mockMutateEdit, isLoading: false }),
}))

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
  beforeEach(() => {
    mockMutateEdit.mockClear()
  })

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

  it('should have five textbox inputs', () => {
    renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    expect(screen.getAllByRole('textbox')).toHaveLength(5)
  })

  it('should disable the form submit when required field is cleared', async () => {
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

  it('should display only overridden settings when toggle is on', async () => {
    const advancedSettingsOverride = {
      'cronjob.success_jobs_history_limit': 3,
      'deployment.custom_domain_check_enabled': true,
      'deployment.affinity.node.required': { key: 'value' },
    }
    const { userEvent } = renderWithProviders(
      <AdvancedSettings
        service={mockApplication}
        advancedSettings={advancedSettingsOverride}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    )
    await userEvent.click(screen.getByRole('checkbox'))
    const hiddenRows = screen.getAllByRole('row').filter((row) => row.classList.contains('hidden'))
    expect(hiddenRows).toHaveLength(2)
  })

  it('should call edit endpoint on submit', async () => {
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

    expect(mockMutateEdit).toHaveBeenCalledWith({
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
