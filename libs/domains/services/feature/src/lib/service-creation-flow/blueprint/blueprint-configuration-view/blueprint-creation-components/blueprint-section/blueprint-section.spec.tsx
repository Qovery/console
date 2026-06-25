import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintSection, type BlueprintSectionProps } from './blueprint-section'

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    Icon: ({ iconName }: { iconName: string }) => <span aria-hidden="true" data-testid={`icon-${iconName}`} />,
  }
})

function renderBlueprintSection(props: Partial<BlueprintSectionProps> = {}) {
  const defaultProps: BlueprintSectionProps = {
    iconName: 'gear',
    title: 'Service information',
  }

  return renderWithProviders(<BlueprintSection {...defaultProps} {...props} />)
}

describe('BlueprintSection', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render title, description and children', () => {
    renderBlueprintSection({
      description: 'Configure basic service settings',
      children: <p>Section content</p>,
    })

    expect(screen.getByRole('heading', { name: 'Service information' })).toBeInTheDocument()
    expect(screen.getByText('Configure basic service settings')).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('should render a clickable collapsed header when onClick is provided', async () => {
    const onClick = jest.fn()

    const { userEvent } = renderBlueprintSection({ onClick })

    const button = screen.getByRole('button', { name: 'Service information' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not render a button when the section is active', () => {
    renderBlueprintSection({ active: true, onClick: jest.fn() })

    expect(screen.queryByRole('button', { name: 'Service information' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Service information' })).toBeInTheDocument()
  })

  it('should disable the header button when the section is disabled', async () => {
    const onClick = jest.fn()

    const { userEvent } = renderBlueprintSection({ disabled: true, onClick })

    const button = screen.getByRole('button', { name: 'Service information' })
    expect(button).toBeDisabled()

    await userEvent.click(button)

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render the completed icon when completed', () => {
    renderBlueprintSection({ completed: true })

    expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument()
  })
})
