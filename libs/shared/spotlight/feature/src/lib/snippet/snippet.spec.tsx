import { renderWithProviders } from '@qovery/shared/util-tests'
import { Snippet } from './snippet'

describe('Snippet', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Snippet />)
    expect(baseElement).toBeTruthy()
  })
})
