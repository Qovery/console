import { act } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import PropertyCard, { PropertyCardProps } from './property-card'

const props: PropertyCardProps = {
  value: 'Every minute',
  helperText: 'This is a helper text',
  name: 'Frequency',
  isLoading: false,
  onSettingsClick: jest.fn(),
}

describe('PropertyCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PropertyCard {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call onSettingsClick when clicking on settings', async () => {
    const { getByTestId } = render(<PropertyCard {...props} />)
    const iconButton = getByTestId('property-card-settings-button')

    await act(() => {
      iconButton.click()
    })

    expect(props.onSettingsClick).toHaveBeenCalled()
  })

  it('should have an icon when helperText is provided', () => {
    const { getByTestId } = render(<PropertyCard {...props} />)
    const icon = getByTestId('icon-helper')

    expect(icon).toBeTruthy()
  })
})
