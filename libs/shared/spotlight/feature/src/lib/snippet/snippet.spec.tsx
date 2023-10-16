import { renderWithProviders } from '@qovery/shared/util-tests'
import { Snippet } from './snippet'

describe('Snippet', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Snippet />)
    expect(baseElement).toBeTruthy()
  })
})
