import { findByText, queryByTestId, queryByText } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import PlaceholderSettings, { PlaceholderSettingsProps } from './placeholder-settings'

const props: PlaceholderSettingsProps = {
  title: 'No Storage are set',
}

describe('PlaceholderSettings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlaceholderSettings {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render the title', () => {
    const { baseElement } = render(<PlaceholderSettings {...props} />)
    findByText(baseElement, 'No Storage are set')
  })

  it('should not render the description block if no description provided', async () => {
    const { baseElement } = render(<PlaceholderSettings {...props} />)
    const paragraph = queryByTestId(baseElement, 'placeholder-settings-description')
    expect(paragraph).toBeNull()
  })

  it('should render the description block if no description provided', async () => {
    props.description = 'Need help? You may find these links useful'
    const { baseElement } = render(<PlaceholderSettings {...props} />)
    const paragraph = queryByText(baseElement, 'Need help? You may find these links useful')
    expect(paragraph).not.toBeNull()
  })
})
