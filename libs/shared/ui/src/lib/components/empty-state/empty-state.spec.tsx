import { renderWithProviders } from '@qovery/shared/util-tests'
import EmptyState from './empty-state'

describe('EmptyState', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      <EmptyState
        title="No Storage are set"
        icon="folder-open"
        description="Need help? You may find these links useful"
      >
        <button>Create project</button>
      </EmptyState>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
