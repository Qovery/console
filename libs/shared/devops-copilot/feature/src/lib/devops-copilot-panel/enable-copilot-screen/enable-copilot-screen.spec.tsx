import { type ReactNode } from 'react'
import { render, screen } from '@qovery/shared/util-tests'
import { EnableCopilotScreen } from './enable-copilot-screen'

jest.mock('@qovery/shared/ui', () => ({
  Button: ({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  ),
  EmptyState: ({
    children,
    title,
    description,
    icon,
  }: {
    children: ReactNode
    title: ReactNode
    description: ReactNode
    icon: string
  }) => (
    <div>
      <span data-testid={`icon-${icon}`} />
      <div>{title}</div>
      <div>{description}</div>
      {children}
    </div>
  ),
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
  Link: ({
    children,
    onClick,
    params,
    to,
  }: {
    children: ReactNode
    onClick?: () => void
    params?: Record<string, string>
    to: string
  }) => {
    const href = Object.entries(params ?? {}).reduce((path, [key, value]) => path.replace(`$${key}`, value), to)

    return (
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault()
          onClick?.()
        }}
      >
        {children}
      </a>
    )
  },
}))

describe('EnableCopilotScreen', () => {
  const defaultProps = {
    organizationId: 'org-123',
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the empty state content and CTA', () => {
    render(<EnableCopilotScreen {...defaultProps} />)

    expect(screen.getByTestId('icon-robot')).toBeInTheDocument()
    expect(screen.getByText('AI Copilot not activated yet')).toBeInTheDocument()
    expect(screen.getByText(/Our DevOps AI Copilot can help you fix your deployments/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enable AI Copilot' })).toBeInTheDocument()
    expect(screen.getByTestId('icon-sparkles')).toBeInTheDocument()
  })

  it('links to the AI Copilot settings for the current organization', () => {
    render(<EnableCopilotScreen {...defaultProps} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/organization/org-123/settings/ai-copilot')
  })
})
