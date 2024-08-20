import { renderWithProviders } from '@qovery/shared/util-tests'
import { InputDropdownVariables } from './input-suggestions-variables'

describe('InputDropdownVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<InputDropdownVariables environmentId="000" />)
    expect(baseElement).toBeTruthy()
  })
})
