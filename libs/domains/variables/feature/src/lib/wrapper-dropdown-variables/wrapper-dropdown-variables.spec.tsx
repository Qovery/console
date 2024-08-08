import { renderWithProviders } from '@qovery/shared/util-tests'
import { WrapperDropdownVariables } from './wrapper-dropdown-variables'

describe('WrapperDropdownVariables', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<WrapperDropdownVariables environmentId="000" />)
    expect(baseElement).toBeTruthy()
  })
})
