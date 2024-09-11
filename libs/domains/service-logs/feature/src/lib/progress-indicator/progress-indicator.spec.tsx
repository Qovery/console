import { renderWithProviders } from '@qovery/shared/util-tests'
import ProgressIndicator from './progress-indicator'

describe('ProgressIndicator', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ProgressIndicator />)
    expect(baseElement).toBeTruthy()
  })
})
