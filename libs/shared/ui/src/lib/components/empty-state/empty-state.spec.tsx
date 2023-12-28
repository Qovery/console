import { renderWithProviders } from '@qovery/shared/util-tests'
import EmptyState, { type EmptyStateProps } from './empty-state'

const props: EmptyStateProps = {
  title: 'No Storage are set',
}

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EmptyState {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    props.description = 'Need help? You may find these links useful'
    const { baseElement } = renderWithProviders(<EmptyState {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
