import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import DarkModeEnabler from './dark-mode-enabler'

describe('DarkModeEnabler', () => {
  it('should render without dark mode', async () => {
    const { baseElement } = renderWithProviders(
      <DarkModeEnabler isDarkMode={false}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )

    await waitFor(() => {
      expect(baseElement.parentElement).not.toHaveClass('dark')
    })
  })

  it('should add dark class on root element', async () => {
    const { baseElement } = renderWithProviders(
      <DarkModeEnabler isDarkMode={true}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )
    await waitFor(() => {
      expect(baseElement.parentElement).toHaveClass('dark')
    })
  })

  it('should render its children', () => {
    renderWithProviders(
      <DarkModeEnabler isDarkMode={false}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )

    screen.getByTestId('root')
  })
})
