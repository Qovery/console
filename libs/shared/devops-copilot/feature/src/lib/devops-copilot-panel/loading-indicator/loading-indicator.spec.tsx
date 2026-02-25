import { render, screen } from '@qovery/shared/util-tests'
import { type PlanStep } from '../devops-copilot-panel'
import { LoadingIndicator } from './loading-indicator'

jest.mock('@qovery/shared/ui', () => ({
  AnimatedGradientText: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}))

jest.mock('../../utils/icon-utils/icon-utils', () => ({
  getIconName: (status: string) => {
    const iconMap: Record<string, string> = {
      not_started: 'circle',
      in_progress: 'spinner',
      completed: 'check-circle',
      waiting: 'clock',
      error: 'exclamation-circle',
    }
    return iconMap[status] || 'circle'
  },
  getIconClass: (status: string) => {
    const classMap: Record<string, string> = {
      not_started: 'text-neutral-400',
      in_progress: 'text-blue-500',
      completed: 'text-green-500',
      waiting: 'text-yellow-500',
      error: 'text-red-500',
    }
    return classMap[status] || 'text-neutral-400'
  },
}))

describe('LoadingIndicator', () => {
  const mockOnTogglePlans = jest.fn()

  const mockPlan: PlanStep[] = [
    { messageId: 'temp', description: 'Step 1', toolName: 'tool1', status: 'completed' },
    { messageId: 'temp', description: 'Step 2', toolName: 'tool2', status: 'in_progress' },
    { messageId: 'temp', description: 'Step 3', toolName: 'tool3', status: 'not_started' },
  ]

  const defaultProps = {
    loadingText: 'Loading...',
    plan: mockPlan,
    showPlans: {},
    onTogglePlans: mockOnTogglePlans,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading text', () => {
      render(<LoadingIndicator {...defaultProps} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render custom loading text', () => {
      render(<LoadingIndicator {...defaultProps} loadingText="Processing request..." />)

      expect(screen.getByText('Processing request...')).toBeInTheDocument()
    })

    it('should render toggle icon when plan has temp steps', () => {
      render(<LoadingIndicator {...defaultProps} />)

      const chevronIcon = screen.queryByTestId(/icon-chevron-circle-/)
      expect(chevronIcon).toBeInTheDocument()
    })

    it('should not render toggle icon when plan is empty', () => {
      render(<LoadingIndicator {...defaultProps} plan={[]} />)

      const chevronIcon = screen.queryByTestId(/icon-chevron-circle-/)
      expect(chevronIcon).not.toBeInTheDocument()
    })

    it('should not render toggle icon when plan has no temp steps', () => {
      const nonTempPlan: PlanStep[] = [
        { messageId: 'msg-1', description: 'Step 1', toolName: 'tool1', status: 'completed' },
      ]

      render(<LoadingIndicator {...defaultProps} plan={nonTempPlan} />)

      const chevronIcon = screen.queryByTestId(/icon-chevron-circle-/)
      expect(chevronIcon).not.toBeInTheDocument()
    })
  })

  describe('plan visibility', () => {
    it('should show chevron-down icon when plans are hidden', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: false }} />)

      expect(screen.getByTestId('icon-chevron-circle-down')).toBeInTheDocument()
    })

    it('should show chevron-up icon when plans are visible', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      expect(screen.getByTestId('icon-chevron-circle-up')).toBeInTheDocument()
    })

    it('should display plan steps when visible', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('should not display plan steps when hidden', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: false }} />)

      expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Step 3')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onTogglePlans with "temp" when clicked', () => {
      const { container } = render(<LoadingIndicator {...defaultProps} />)

      const clickableDiv = container.querySelector('.cursor-pointer')
      clickableDiv?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(mockOnTogglePlans).toHaveBeenCalledWith('temp')
      expect(mockOnTogglePlans).toHaveBeenCalledTimes(1)
    })
  })

  describe('plan steps display', () => {
    it('should display step descriptions', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('should display step statuses', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('in progress')).toBeInTheDocument()
      expect(screen.getByText('not started')).toBeInTheDocument()
    })

    it('should replace underscores with spaces in status text', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      expect(screen.getByText('in progress')).toBeInTheDocument()
      expect(screen.getByText('not started')).toBeInTheDocument()
    })

    it('should only show temp plan steps', () => {
      const mixedPlan: PlanStep[] = [
        { messageId: 'temp', description: 'Temp step', toolName: 'tool1', status: 'completed' },
        { messageId: 'msg-1', description: 'Other step', toolName: 'tool2', status: 'completed' },
      ]

      render(<LoadingIndicator {...defaultProps} plan={mixedPlan} showPlans={{ temp: true }} />)

      expect(screen.getByText('Temp step')).toBeInTheDocument()
      expect(screen.queryByText('Other step')).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply neutral color to completed step description', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      const completedStep = screen.getByText('Step 1')
      expect(completedStep).toHaveClass('text-neutral-400')
    })

    it('should not apply neutral color to in-progress step', () => {
      render(<LoadingIndicator {...defaultProps} showPlans={{ temp: true }} />)

      const inProgressStep = screen.getByText('Step 2')
      expect(inProgressStep).not.toHaveClass('text-neutral-400')
    })

    it('should have cursor-pointer on clickable container', () => {
      const { container } = render(<LoadingIndicator {...defaultProps} />)

      const clickableDiv = container.querySelector('.cursor-pointer')
      expect(clickableDiv).toBeInTheDocument()
    })

    it('should render chevron icon', () => {
      render(<LoadingIndicator {...defaultProps} />)

      const chevronIcon = screen.queryByTestId(/icon-chevron-circle-/)
      expect(chevronIcon).toBeInTheDocument()
    })
  })
})
