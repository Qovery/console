import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceTerminal } from './service-terminal'

describe('ServiceTerminal', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceTerminal />)
    expect(baseElement).toMatchSnapshot()
  })
})
