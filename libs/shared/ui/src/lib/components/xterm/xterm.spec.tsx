import { renderWithProviders } from '@qovery/shared/util-tests'
import XTerm from './xterm'

describe('XTerm', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<XTerm />)
    expect(baseElement).toBeTruthy()
  })
})
