import { renderWithProviders } from '@qovery/shared/util-tests'
import Editor from './Editor'

describe('Editor', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Editor />)
    expect(baseElement).toBeTruthy()
  })
})
