import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ApplyImmediatelyCheckbox } from './apply-immediately-checkbox'

describe('ApplyImmediatelyCheckbox', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ApplyImmediatelyCheckbox />)
    expect(baseElement).toBeTruthy()
  })

  it('should display warning when checkbox is checked', async () => {
    const { userEvent } = renderWithProviders(<ApplyImmediatelyCheckbox />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(screen.getByTestId('apply-immediately-warning')).toBeInTheDocument()
  })

  it('should not display warning when checkbox is unchecked', () => {
    renderWithProviders(<ApplyImmediatelyCheckbox />)

    expect(screen.queryByTestId('apply-immediately-warning')).not.toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<ApplyImmediatelyCheckbox disabled />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
