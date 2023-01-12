import { render, screen } from '@testing-library/react'
import { act, fireEvent, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PageSettingsPreviewEnvironments, {
  PageSettingsPreviewEnvironmentsProps,
} from './page-settings-preview-environments'

const props: PageSettingsPreviewEnvironmentsProps = {
  onSubmit: jest.fn(),
  applications: applicationFactoryMock(3),
}

describe('PageSettingsPreviewEnvironments', () => {
  const defaultValues: any = {
    auto_preview: false,
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

  it(`should have margin when we have applications`, () => {
    render(wrapWithReactHookForm(<PageSettingsPreviewEnvironments {...props} />))

    const toggles = screen.getByTestId('toggles')

    expect(toggles.classList.contains('mt-5')).toBe(true)
  })
})
