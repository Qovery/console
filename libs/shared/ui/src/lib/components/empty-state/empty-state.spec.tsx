import { findByText, queryByTestId, queryByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import EmptyState, { EmptyStateProps } from './empty-state'

const props: EmptyStateProps = {
  title: 'No Storage are set',
}

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmptyState {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the title', () => {
    const { baseElement } = render(<EmptyState {...props} />)
    findByText(baseElement, 'No Storage are set')
  })

  it('should not render the description block if no description provided', async () => {
    const { baseElement } = render(<EmptyState {...props} />)
    const paragraph = queryByTestId(baseElement, 'placeholder-settings-description')
    expect(paragraph).toBeNull()
  })

  it('should render the description block if no description provided', async () => {
    props.description = 'Need help? You may find these links useful'
    const { baseElement } = render(<EmptyState {...props} />)
    const paragraph = queryByText(baseElement, 'Need help? You may find these links useful')
    expect(paragraph).not.toBeNull()
  })
})
