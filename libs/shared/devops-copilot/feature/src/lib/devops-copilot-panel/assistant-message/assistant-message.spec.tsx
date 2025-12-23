import { render, renderWithProviders, screen } from '@qovery/shared/util-tests'
import type { Message, PlanStep } from '../devops-copilot-panel'
import { AssistantMessage } from './assistant-message'

jest.mock('../../devops-render-markdown/devops-render-markdown', () => ({
  RenderMarkdown: ({ children }: { children: string }) => <div data-testid="render-markdown">{children}</div>,
}))

jest.mock('../../utils/icon-utils/icon-utils', () => ({
  getIconName: (status: string) => {
    const iconMap: Record<string, string> = {
      not_started: 'circle',
      in_progress: 'spinner',
      completed: 'check-circle',
    }
    return iconMap[status] || 'circle'
  },
  getIconClass: (status: string) => {
    const classMap: Record<string, string> = {
      not_started: 'text-neutral-400',
      in_progress: 'text-blue-500',
      completed: 'text-green-500',
    }
    return classMap[status] || 'text-neutral-400'
  },
}))

describe('AssistantMessage', () => {
  const mockHandleVote = jest.fn()
  const mockSetShowPlans = jest.fn()

  const mockMessage: Message = {
    id: 'msg-1',
    text: 'This is an assistant message',
    owner: 'assistant',
    timestamp: 1000,
  }

  const defaultProps = {
    message: mockMessage,
    plan: [],
    showPlans: {},
    setShowPlans: mockSetShowPlans,
    handleVote: mockHandleVote,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render assistant message text', () => {
      render(<AssistantMessage {...defaultProps} />)

      expect(screen.getByTestId('render-markdown')).toBeInTheDocument()
      expect(screen.getByTestId('render-markdown')).toHaveTextContent('This is an assistant message')
    })
  })

  describe('plan steps', () => {
    const mockPlan: PlanStep[] = [
      { messageId: 'msg-1', description: 'Step 1', toolName: 'tool1', status: 'completed' },
      { messageId: 'msg-1', description: 'Step 2', toolName: 'tool2', status: 'in_progress' },
      { messageId: 'msg-2', description: 'Other step', toolName: 'tool3', status: 'not_started' },
    ]

    it('should show plan toggle when message has plan steps', () => {
      render(<AssistantMessage {...defaultProps} plan={mockPlan} />)

      expect(screen.getByText('Plan steps')).toBeInTheDocument()
    })

    it('should not show plan toggle when message has no plan steps', () => {
      render(<AssistantMessage {...defaultProps} plan={[]} />)

      expect(screen.queryByText('Plan steps')).not.toBeInTheDocument()
    })

    it('should filter plan steps by message ID', () => {
      render(<AssistantMessage {...defaultProps} plan={mockPlan} showPlans={{ 'msg-1': true }} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.queryByText('Other step')).not.toBeInTheDocument()
    })

    it('should toggle plan visibility when clicking plan toggle', async () => {
      const { userEvent } = renderWithProviders(
        <AssistantMessage {...defaultProps} plan={mockPlan} showPlans={{ 'msg-1': false }} />
      )

      const planToggle = screen.getByText('Plan steps')
      await userEvent.click(planToggle)

      expect(mockSetShowPlans).toHaveBeenCalledWith(expect.any(Function))

      const updateFn = mockSetShowPlans.mock.calls[0][0]
      expect(updateFn({ 'msg-1': false })).toEqual({ 'msg-1': true })
    })

    it('should show plan steps when visible', () => {
      render(<AssistantMessage {...defaultProps} plan={mockPlan} showPlans={{ 'msg-1': true }} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('should hide plan steps when not visible', () => {
      render(<AssistantMessage {...defaultProps} plan={mockPlan} showPlans={{ 'msg-1': false }} />)

      expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
    })

    it('should display step status', () => {
      render(<AssistantMessage {...defaultProps} plan={mockPlan} showPlans={{ 'msg-1': true }} />)

      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('in progress')).toBeInTheDocument()
    })
  })

  describe('voting', () => {
    it('should render voting buttons', () => {
      render(<AssistantMessage {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('styling', () => {
    it('should apply group class for hover effects', () => {
      const { container } = render(<AssistantMessage {...defaultProps} />)

      const messageContainer = container.querySelector('.group')
      expect(messageContainer).toBeInTheDocument()
    })

    it('should have invisible vote buttons by default', () => {
      const { container } = render(<AssistantMessage {...defaultProps} />)

      const voteContainer = container.querySelector('.invisible')
      expect(voteContainer).toBeInTheDocument()
    })

    it('should apply neutral color to completed step description', () => {
      const completedPlan: PlanStep[] = [
        { messageId: 'msg-1', description: 'Completed step', toolName: 'tool1', status: 'completed' },
      ]

      render(<AssistantMessage {...defaultProps} plan={completedPlan} showPlans={{ 'msg-1': true }} />)

      const completedDescription = screen.getByText('Completed step')
      expect(completedDescription).toHaveClass('text-neutral-400')
    })

    it('should not apply neutral color to in-progress step description', () => {
      const inProgressPlan: PlanStep[] = [
        { messageId: 'msg-1', description: 'In progress step', toolName: 'tool1', status: 'in_progress' },
      ]

      render(<AssistantMessage {...defaultProps} plan={inProgressPlan} showPlans={{ 'msg-1': true }} />)

      const inProgressDescription = screen.getByText('In progress step')
      expect(inProgressDescription).not.toHaveClass('text-neutral-400')
    })
  })

  describe('plan toggle behavior', () => {
    it('should use cursor pointer on plan toggle', () => {
      const mockPlan: PlanStep[] = [
        { messageId: 'msg-1', description: 'Step 1', toolName: 'tool1', status: 'completed' },
      ]

      const { container } = render(<AssistantMessage {...defaultProps} plan={mockPlan} />)

      const planToggle = container.querySelector('.plan-toggle')
      expect(planToggle).toHaveClass('cursor-pointer')
    })
  })
})
