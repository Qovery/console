import { renderWithProviders } from '@qovery/shared/util-tests'
import Terminal from './terminal'

describe('Terminal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Terminal />)
    expect(baseElement).toBeTruthy()
  })
})
