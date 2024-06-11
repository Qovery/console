import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageSettingsPreviewEnvironments, {
  type PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  loading: false,
  onSubmit: jest.fn(),
  services: applicationFactoryMock(3) as Application[],
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

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should have the toggle with all applications has true', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />, {
        defaultValues,
      })
    )

    const toggle = screen.getByTestId('toggle-all')
    userEvent.click(toggle)

    await waitFor(async () => {
      expect(screen.getByTestId(`toggle-all`)?.querySelector('input')?.getAttribute('value')).toBe('true')
      expect(screen.getByTestId(`toggle-0`).querySelector('input')?.getAttribute('value')).toBe('true')
      expect(screen.getByTestId(`toggle-1`).querySelector('input')?.getAttribute('value')).toBe('true')
    })
  })
  it('should have the toggle with on_demand_preview', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />, {
        defaultValues,
      })
    )

    const toggle = screen.getByTestId('toggle-on-demand-preview')
    userEvent.click(toggle)

    await waitFor(async () => {
      expect(screen.getByTestId(`toggle-on-demand-preview`)?.querySelector('input')?.getAttribute('value')).toBe('true')
    })
  })

  it(`should have margin when we have applications`, () => {
    renderWithProviders(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))

    const toggles = screen.getByTestId('toggles')
    expect(toggles).toHaveClass('mt-5')

    const applicationTitle = screen.getByTestId('services-title')
    expect(applicationTitle).toBeInTheDocument()
  })
})
