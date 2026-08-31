import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterAdvancedSettings } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { buildClusterAdvancedSettingsPayload } from './build-cluster-advanced-settings-payload'
import { ClusterAdvancedSettings as ClusterAdvancedSettingsComponent } from './cluster-advanced-settings'

jest.mock('./build-cluster-advanced-settings-payload', () => {
  const actualModule = jest.requireActual('./build-cluster-advanced-settings-payload')

  return {
    ...actualModule,
    buildClusterAdvancedSettingsPayload: jest.fn(actualModule.buildClusterAdvancedSettingsPayload),
  }
})

const mockedBuildClusterAdvancedSettingsPayload = jest.mocked(buildClusterAdvancedSettingsPayload)
const actualBuildClusterAdvancedSettingsPayload = jest.requireActual(
  './build-cluster-advanced-settings-payload'
).buildClusterAdvancedSettingsPayload

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
    mockedBuildClusterAdvancedSettingsPayload.mockImplementation(actualBuildClusterAdvancedSettingsPayload)
  })

  it('should render correctly', () => {
    const { container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
          formBaseline={mockClusterAdvancedSettings}
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

    expect(screen.getByRole('columnheader', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Default Value' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument()
    const spinners = screen.queryAllByTestId('spinner')
    expect(spinners.length).toBeLessThanOrEqual(1)
  })

  it('should show StickyActionFormToaster when the form payload changes quickly', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
          formBaseline={mockClusterAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    const textarea = container.querySelector('textarea[name="key1"]') as HTMLTextAreaElement
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'modified quickly')

    await waitFor(() => expect(screen.getByTestId('sticky-action-form-toaster')).toBeVisible())
  })

  it('should not show StickyActionFormToaster when the form payload is unchanged', () => {
    renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
          formBaseline={mockClusterAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument()
  })

  it('should not show StickyActionFormToaster when dirty form values produce the current payload', async () => {
    const clusterAdvancedSettings = {
      'cluster.setting': 1,
      key2: 'value2',
    } as ClusterAdvancedSettings

    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={clusterAdvancedSettings}
          defaultAdvancedSettings={clusterAdvancedSettings}
          formBaseline={clusterAdvancedSettings}
        />,
        {
          defaultValues: {
            'cluster.setting': '1',
            key2: 'value2',
          },
        }
      )
    )

    const textarea = container.querySelector('textarea[name="cluster.setting"]') as HTMLTextAreaElement
    await userEvent.clear(textarea)
    await userEvent.type(textarea, '1.0')

    await waitFor(() => expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument())
  })

  it('should hide StickyActionFormToaster when all values are reverted', async () => {
    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
          formBaseline={mockClusterAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    const textarea = container.querySelector('textarea[name="key1"]') as HTMLTextAreaElement
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'modified')
    expect(await screen.findByTestId('sticky-action-form-toaster')).toBeVisible()

    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'value1')

    await waitFor(() => expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument())
  })

  it('should compare current and saved values using the same normalization', async () => {
    const clusterAdvancedSettings = {
      'cluster.setting': 1,
      'empty.setting': '',
    } as ClusterAdvancedSettings
    const defaultAdvancedSettings = {
      'cluster.setting': 1,
      'empty.setting': 'default',
    } as ClusterAdvancedSettings

    const { userEvent, container } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={clusterAdvancedSettings}
          defaultAdvancedSettings={defaultAdvancedSettings}
          formBaseline={clusterAdvancedSettings}
        />,
        {
          defaultValues: {
            'cluster.setting': '1',
            'empty.setting': '',
          },
        }
      )
    )

    const textarea = container.querySelector('textarea[name="cluster.setting"]') as HTMLTextAreaElement
    await userEvent.clear(textarea)
    await userEvent.type(textarea, '1.0')

    await waitFor(() => expect(screen.queryByTestId('sticky-action-form-toaster')).not.toBeInTheDocument())
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

  it('should not rebuild the form payload when filtering overridden settings', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(
        <ClusterAdvancedSettingsComponent
          onSubmit={mockOnSubmit}
          loading={false}
          clusterAdvancedSettings={mockClusterAdvancedSettings}
          defaultAdvancedSettings={mockDefaultAdvancedSettings}
          formBaseline={mockClusterAdvancedSettings}
        />,
        {
          defaultValues: {
            key1: 'value1',
            key2: 'value2',
          },
        }
      )
    )

    await waitFor(() => expect(mockedBuildClusterAdvancedSettingsPayload).toHaveBeenCalled())
    const callCount = mockedBuildClusterAdvancedSettingsPayload.mock.calls.length

    await userEvent.click(screen.getByTestId('show-overriden-only-toggle'))

    expect(mockedBuildClusterAdvancedSettingsPayload).toHaveBeenCalledTimes(callCount)
  })
})
