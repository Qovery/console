import { render, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type PlanStep } from '../devops-copilot-panel'
import { StreamingMessage } from './streaming-message'

describe('StreamingMessage', () => {
  const mockRenderStreamingMessageWithMermaid = jest.fn((input: string) => [<div key="mock">{input}</div>])
  const mockSetShowPlans = jest.fn()

  const defaultProps = {
    displayedStreamingMessage: 'Test message',
    plan: [] as PlanStep[],
    showPlans: {},
    setShowPlans: mockSetShowPlans,
    renderStreamingMessageWithMermaid: mockRenderStreamingMessageWithMermaid,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render streaming message component', () => {
    const { container } = render(<StreamingMessage {...defaultProps} displayedStreamingMessage="Hello world" />)

    expect(container.querySelector('.streaming')).toBeInTheDocument()
  })

  describe('plan steps', () => {
    const tempPlanSteps: PlanStep[] = [
      { messageId: 'temp', description: 'Step 1', toolName: 'tool1', status: 'not_started' },
      { messageId: 'temp', description: 'Step 2', toolName: 'tool2', status: 'in_progress' },
    ]

    it('should show plan toggle when temp plan exists', () => {
      render(<StreamingMessage {...defaultProps} plan={tempPlanSteps} />)

      expect(screen.getByText('Plan steps')).toBeInTheDocument()
    })

    it('should not show plan toggle when no temp plan exists', () => {
      const nonTempPlan: PlanStep[] = [
        { messageId: 'msg-123', description: 'Step 1', toolName: 'tool1', status: 'completed' },
      ]
      render(<StreamingMessage {...defaultProps} plan={nonTempPlan} />)

      expect(screen.queryByText('Plan steps')).not.toBeInTheDocument()
    })

    it('should toggle plan visibility when clicking plan toggle', async () => {
      const { userEvent } = renderWithProviders(
        <StreamingMessage {...defaultProps} plan={tempPlanSteps} showPlans={{ temp: false }} />
      )

      const toggle = screen.getByText('Plan steps')
      await userEvent.click(toggle)

      expect(mockSetShowPlans).toHaveBeenCalledWith(expect.any(Function))

      const updateFn = mockSetShowPlans.mock.calls[0][0]
      expect(updateFn({ temp: false })).toEqual({ temp: true })
    })

    it('should render plan steps when visible', () => {
      render(<StreamingMessage {...defaultProps} plan={tempPlanSteps} showPlans={{ temp: true }} />)

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })

    it('should not render plan steps when hidden', () => {
      render(<StreamingMessage {...defaultProps} plan={tempPlanSteps} showPlans={{ temp: false }} />)

      expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Step 2')).not.toBeInTheDocument()
    })

    it('should format step status for display', () => {
      const stepsWithStatus: PlanStep[] = [
        { messageId: 'temp', description: 'Step 1', toolName: 'tool1', status: 'not_started' },
        { messageId: 'temp', description: 'Step 2', toolName: 'tool2', status: 'in_progress' },
      ]
      render(<StreamingMessage {...defaultProps} plan={stepsWithStatus} showPlans={{ temp: true }} />)

      expect(screen.getByText('not started')).toBeInTheDocument()
      expect(screen.getByText('in progress')).toBeInTheDocument()
    })
  })

  describe('mermaid code block handling', () => {
    it('should show "Generating charts…" for incomplete mermaid block', () => {
      const messageWithIncompleteMermaid = 'Some text\n```mer'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={messageWithIncompleteMermaid} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith('Some text\nGenerating charts…')
    })

    it('should show "Generating charts…" for unclosed mermaid block', () => {
      const messageWithUnclosedMermaid = 'Text\n```mermaid\ngraph TD\nA --> B'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={messageWithUnclosedMermaid} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith('Text\nGenerating charts…')
    })

    it('should not modify message with complete mermaid blocks', () => {
      const completeMessage = 'Text\n```mermaid\ngraph TD\nA --> B\n```\nMore text'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={completeMessage} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith(completeMessage)
    })

    it('should handle incomplete code block language', () => {
      const messageWithIncompleteLanguage = 'Text\n```ja'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={messageWithIncompleteLanguage} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith('Text\n')
    })

    it('should handle empty code block', () => {
      const messageWithEmptyBlock = 'Text\n```'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={messageWithEmptyBlock} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith('Text\n')
    })

    it('should not modify message without code blocks', () => {
      const simpleMessage = 'Just a simple message'
      render(<StreamingMessage {...defaultProps} displayedStreamingMessage={simpleMessage} />)

      expect(mockRenderStreamingMessageWithMermaid).toHaveBeenCalledWith(simpleMessage)
    })
  })
})
