import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterAdvancedSettings as ClusterAdvancedSettingsComponent } from './cluster-advanced-settings'

const mockClusterAdvancedSettings = {
  key1: 'value1',
  key2: 'value2',
} as ClusterAdvancedSettings

const mockDefaultAdvancedSettings = {
  key1: 'default1',
  key2: 'default2',
} as ClusterAdvancedSettings

function TestWrapper({
  onSubmit,
  loading,
  clusterAdvancedSettings,
  defaultAdvancedSettings,
}: {
  onSubmit: () => void
  loading: boolean
  clusterAdvancedSettings?: ClusterAdvancedSettings
  defaultAdvancedSettings?: ClusterAdvancedSettings
}) {
  const methods = useForm<{ [key: string]: string }>({
    mode: 'onChange',
    defaultValues: {
      key1: 'value1',
      key2: 'value2',
    },
  })

  return (
    <FormProvider {...methods}>
      <ClusterAdvancedSettingsComponent
        onSubmit={onSubmit}
        loading={loading}
        clusterAdvancedSettings={clusterAdvancedSettings}
        defaultAdvancedSettings={defaultAdvancedSettings}
      />
    </FormProvider>
  )
}

describe('ClusterAdvancedSettings', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={false}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )
    expect(container).toBeInTheDocument()
  })

  it('should display loader when loading and settings are empty', () => {
    renderWithProviders(<TestWrapper onSubmit={mockOnSubmit} loading={true} />)

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should display table when not loading and settings are provided', () => {
    renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={false}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Default Value')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('should display table even when loading if settings are provided', () => {
    renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={true}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('should show StickyActionFormToaster when form is dirty', () => {
    function DirtyTestWrapper() {
      const methods = useForm<{ [key: string]: string }>({
        mode: 'onChange',
        defaultValues: { key1: 'value1' },
      })

      methods.formState.isDirty = true

      return (
        <FormProvider {...methods}>
          <ClusterAdvancedSettingsComponent
            onSubmit={mockOnSubmit}
            loading={false}
            clusterAdvancedSettings={mockClusterAdvancedSettings}
            defaultAdvancedSettings={mockDefaultAdvancedSettings}
          />
        </FormProvider>
      )
    }

    renderWithProviders(<DirtyTestWrapper />)

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeInTheDocument()
  })

  it('should not show StickyActionFormToaster when form is not dirty', () => {
    renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={false}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )

    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()
  })

  it('should call onSubmit when form is submitted', () => {
    const { container } = renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={false}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should display toggle for show overridden only', () => {
    renderWithProviders(
      <TestWrapper
        onSubmit={mockOnSubmit}
        loading={false}
        clusterAdvancedSettings={mockClusterAdvancedSettings}
        defaultAdvancedSettings={mockDefaultAdvancedSettings}
      />
    )

    expect(screen.getByText('Show only overridden settings')).toBeInTheDocument()
  })
})
