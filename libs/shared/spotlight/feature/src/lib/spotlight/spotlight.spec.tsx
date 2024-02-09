import { renderWithProviders } from '@qovery/shared/util-tests'
import { Spotlight } from './spotlight'

describe('Spotlight', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Spotlight />)
    expect(baseElement).toBeTruthy()
  })
})
