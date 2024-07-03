import { renderWithProviders } from '@qovery/shared/util-tests'
import { ResourceAvatar, ResourceAvatarIcon } from './resource-avatar'

describe('ResourceAvatar', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      <ResourceAvatar size="md">
        <ResourceAvatarIcon icon="APPLICATION" size="md" />
      </ResourceAvatar>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
