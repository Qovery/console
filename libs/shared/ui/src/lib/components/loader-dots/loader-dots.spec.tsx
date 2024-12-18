import { renderWithProviders } from '@qovery/shared/util-tests'
import LoaderDots from './loader-dots'

describe('LoaderDots', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<LoaderDots />)
    expect(baseElement).toBeTruthy()
  })
})
