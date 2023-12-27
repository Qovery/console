import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import EmptyState, { type EmptyStateProps } from './empty-state'

const props: EmptyStateProps = {
  title: 'No Storage are set',
}

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<EmptyState {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the title', () => {
    renderWithProviders(<EmptyState {...props} />)
    screen.getByText('No Storage are set')
  })

  it('should render the description block if no description provided', () => {
    props.description = 'Need help? You may find these links useful'
    renderWithProviders(<EmptyState {...props} />)
    screen.getByText('Need help? You may find these links useful')
  })
})
