import { renderWithProviders } from '@qovery/shared/util-tests'
import { TopBar } from './top-bar'

describe('TopBar', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = renderWithProviders(<TopBar />)
    expect(baseElement).toBeTruthy()
  })
})
