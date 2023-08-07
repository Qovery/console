import { render, screen } from '__tests__/utils/setup-jest'
import { act, fireEvent, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PageSettingsPreviewEnvironments, {
  PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  loading: false,
  onSubmit: jest.fn(),
  applications: applicationFactoryMock(3),
  toggleAll: jest.fn(),
  toggleEnablePreview: jest.fn(),
}

describe('PageSettingsPreviewEnvironments', () => {
  const defaultValues = {
    auto_preview: false,
    on_demand_preview: false,
    0: true,
    1: true,
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))

    await waitFor(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  it('should have the toggle with all applications has true', async () => {
    render(
      wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />, {
        defaultValues,
      })
    )

    await act(() => {
      const toggle = screen.getByTestId('toggle-all')
      fireEvent.click(toggle)
    })

    await waitFor(async () => {
      expect(screen.getByTestId(`toggle-all`)?.querySelector('input')?.getAttribute('value')).toBe('true')
      expect(screen.getByTestId(`toggle-0`).querySelector('input')?.getAttribute('value')).toBe('true')
      expect(screen.getByTestId(`toggle-1`).querySelector('input')?.getAttribute('value')).toBe('true')
    })
  })
  it('should have the toggle with on_demand_preview', async () => {
    render(
      wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />, {
        defaultValues,
      })
    )

    await act(() => {
      const toggle = screen.getByTestId('toggle-on-demand-preview')
      fireEvent.click(toggle)
    })

    await waitFor(async () => {
      expect(screen.getByTestId(`toggle-on-demand-preview`)?.querySelector('input')?.getAttribute('value')).toBe('true')
    })
  })

  it(`should have margin when we have applications`, () => {
    render(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))

    const toggles = screen.getByTestId('toggles')
    expect(toggles.classList.contains('mt-5')).toBe(true)

    const applicationTitle = screen.getByTestId('applications-title')
    expect(applicationTitle).toBeTruthy()
  })
})
