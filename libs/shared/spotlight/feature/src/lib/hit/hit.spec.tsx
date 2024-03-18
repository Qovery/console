import { renderWithProviders } from '@qovery/shared/util-tests'
import { Hit } from './hit'

describe('Hit', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Hit />)
    expect(baseElement).toBeTruthy()
  })
})
