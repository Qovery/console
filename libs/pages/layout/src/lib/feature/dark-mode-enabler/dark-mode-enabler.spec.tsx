import { getByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import DarkModeEnabler from './dark-mode-enabler'

describe('DarkModeEnabler', () => {
  it('should render without dark mode', async () => {
    const { baseElement } = render(
      <DarkModeEnabler isDarkMode={false}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )

    await waitFor(() => {
      expect(baseElement.parentElement).not.toHaveClass('dark')
    })
  })

  it('should add dark class on root element', async () => {
    const { baseElement, debug } = render(
      <DarkModeEnabler isDarkMode={true}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )
    await waitFor(() => {
      expect(baseElement.parentElement).toHaveClass('dark')
    })
  })

  it('should render its children', () => {
    const { baseElement } = render(
      <DarkModeEnabler isDarkMode={false}>
        <p data-testid="root">Hey</p>
      </DarkModeEnabler>
    )

    getByTestId(baseElement, 'root')
  })
})
