import { renderWithProviders } from '@qovery/shared/util-tests'
import { ResourceAvatar } from './resource-avatar'

describe('ResourceAvatar', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ResourceAvatar />)
    expect(baseElement).toBeTruthy()
  })
})
