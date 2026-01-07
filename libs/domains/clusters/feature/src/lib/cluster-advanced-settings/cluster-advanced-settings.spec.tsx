import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
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

describe('ClusterAdvancedSettings', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )
    expect(container).toBeInTheDocument()
  })

  it('should display loader when loading and settings are empty', () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterAdvancedSettingsComponent onSubmit={mockOnSubmit} loading={true} />, {
        defaultValues: {},
      })
    )

    const spinners = screen.getAllByTestId('spinner')
    expect(spinners.length).toBeGreaterThan(0)
    expect(spinners[0]).toBeInTheDocument()
  })

  it('should display table even when loading if settings are provided', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={true}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    const spinners = screen.queryAllByTestId('spinner')
    expect(spinners.length).toBeLessThanOrEqual(1)
  })

  it('should show StickyActionFormToaster when form is dirty', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: '',
            key2: '',
          },
        }
      )
    )

    const textarea = container.querySelector('textarea[name="key1"]') as HTMLTextAreaElement
    if (textarea) {
      await userEvent.type(textarea, 'modified')
    }

    expect(screen.getByTestId('sticky-action-form-toaster')).toBeInTheDocument()
    const toaster = screen.getByTestId('sticky-action-form-toaster')
    expect(toaster).toHaveClass('visible')
  })

  it('should not show StickyActionFormToaster when form is not dirty', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: '',
            key2: '',
          },
        }
      )
    )

    const toaster = screen.queryByTestId('sticky-action-form-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveClass('hidden')
    expect(toaster).not.toHaveClass('visible')
  })

  it('should call onSubmit when form is submitted', () => {
    const { container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('should display toggle for show overridden only', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    expect(screen.getByText('Show only overridden settings')).toBeInTheDocument()
  })
})
