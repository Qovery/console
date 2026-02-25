import { createRef } from 'react'
import { render, screen } from '@qovery/shared/util-tests'
import { type Message, type PlanStep } from '../devops-copilot-panel'
import { renderStreamingMessageWithMermaid } from '../streaming-mermaid-renderer/streaming-mermaid-renderer'
import { MessageList } from './message-list'

jest.mock('@qovery/shared/ui', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react')
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ScrollArea: React.forwardRef(({ children, className }: any, ref: any) => (
      <div ref={ref} className={className}>
        {children}
      </div>
    )),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Button: ({ children, onClick, className }: any) => (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    ),
    Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
  }
})

jest.mock('../empty-state/empty-state', () => ({
  EmptyState: ({ docLinks, expand }: { docLinks: unknown[]; expand: boolean }) =>
    docLinks.length > 0 && expand ? <div data-testid="empty-state">Empty State</div> : null,
}))

jest.mock('../assistant-message/assistant-message', () => ({
  AssistantMessage: ({ message }: { message: Message }) => (
    <div data-testid={`assistant-message-${message.id}`}>{message.text}</div>
  ),
}))

jest.mock('../loading-indicator/loading-indicator', () => ({
  LoadingIndicator: () => <div data-testid="loading-indicator">Loading...</div>,
}))

jest.mock('../streaming-message/streaming-message', () => ({
  StreamingMessage: () => <div data-testid="streaming-message">Streaming...</div>,
}))

describe('MessageList', () => {
  const scrollAreaRef = createRef<HTMLDivElement>()
  const mockOnSuggestionClick = jest.fn()
  const mockSetShowPlans = jest.fn()
  const mockHandleVote = jest.fn()

  const defaultProps = {
    scrollAreaRef,
    expand: false,
    thread: [] as Message[],
    docLinks: [],
    isCopilotEnabled: true,
    onSuggestionClick: mockOnSuggestionClick,
    isLoading: false,
    streamingMessage: '',
    displayedStreamingMessage: '',
    loadingText: 'Loading...',
    plan: [] as PlanStep[],
    showPlans: {},
    setShowPlans: mockSetShowPlans,
    threadId: undefined,
    pendingThreadId: undefined,
    renderStreamingMessageWithMermaid,
    handleVote: mockHandleVote,
    isAtBottom: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render empty state when thread is empty and expand is true', () => {
      render(<MessageList {...defaultProps} expand={true} docLinks={[{ label: 'Test', link: 'https://test.com' }]} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should not render empty state when thread has messages', () => {
      const thread: Message[] = [{ id: 'msg-1', text: 'Hello', owner: 'user', timestamp: 1000 }]

      render(<MessageList {...defaultProps} thread={thread} expand={true} />)

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })
  })

  describe('user messages', () => {
    it('should render user messages', () => {
      const thread: Message[] = [{ id: 'msg-1', text: 'User message', owner: 'user', timestamp: 1000 }]

      render(<MessageList {...defaultProps} thread={thread} />)

      expect(screen.getByText('User message')).toBeInTheDocument()
    })

    it('should render multiple user messages', () => {
      const thread: Message[] = [
        { id: 'msg-1', text: 'First message', owner: 'user', timestamp: 1000 },
        { id: 'msg-2', text: 'Second message', owner: 'user', timestamp: 2000 },
      ]

      render(<MessageList {...defaultProps} thread={thread} />)

      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })
  })

  describe('assistant messages', () => {
    it('should render assistant messages', () => {
      const thread: Message[] = [{ id: 'msg-1', text: 'Assistant response', owner: 'assistant', timestamp: 1000 }]

      render(<MessageList {...defaultProps} thread={thread} />)

      expect(screen.getByTestId('assistant-message-msg-1')).toBeInTheDocument()
      expect(screen.getByText('Assistant response')).toBeInTheDocument()
    })

    it('should render mixed user and assistant messages', () => {
      const thread: Message[] = [
        { id: 'msg-1', text: 'User question', owner: 'user', timestamp: 1000 },
        { id: 'msg-2', text: 'Assistant answer', owner: 'assistant', timestamp: 2000 },
      ]

      render(<MessageList {...defaultProps} thread={thread} />)

      expect(screen.getByText('User question')).toBeInTheDocument()
      expect(screen.getByTestId('assistant-message-msg-2')).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('should render loading indicator when loading and no streaming message', () => {
      render(<MessageList {...defaultProps} isLoading={true} streamingMessage="" />)

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    })

    it('should render streaming message when loading and has streaming message', () => {
      render(
        <MessageList
          {...defaultProps}
          isLoading={true}
          streamingMessage="Streaming..."
          displayedStreamingMessage="Streaming..."
          threadId="thread-1"
          pendingThreadId="thread-1"
        />
      )

      expect(screen.getByTestId('streaming-message')).toBeInTheDocument()
    })

    it('should not render streaming message when thread IDs do not match', () => {
      render(
        <MessageList
          {...defaultProps}
          isLoading={true}
          streamingMessage="Streaming..."
          threadId="thread-1"
          pendingThreadId="thread-2"
        />
      )

      expect(screen.queryByTestId('streaming-message')).not.toBeInTheDocument()
    })

    it('should not render loading indicator when not loading', () => {
      render(<MessageList {...defaultProps} isLoading={false} />)

      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    })
  })

  describe('scroll to bottom button', () => {
    it('should render scroll button when not at bottom', () => {
      render(<MessageList {...defaultProps} isAtBottom={false} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should not render scroll button when at bottom', () => {
      render(<MessageList {...defaultProps} isAtBottom={true} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply different height classes based on expand state', () => {
      const { container, rerender } = render(
        <MessageList
          {...defaultProps}
          expand={false}
          thread={[{ id: 'msg-1', text: 'Test', owner: 'user', timestamp: 1000 }]}
        />
      )

      let scrollArea = container.querySelector('.h-\\[220px\\]')
      expect(scrollArea).toBeInTheDocument()

      rerender(
        <MessageList
          {...defaultProps}
          expand={true}
          thread={[{ id: 'msg-1', text: 'Test', owner: 'user', timestamp: 1000 }]}
        />
      )

      scrollArea = container.querySelector('.h-\\[calc\\(100vh-316px\\)\\]')
      expect(scrollArea).toBeInTheDocument()
    })

    it('should have overflow-y-scroll class', () => {
      const { container } = render(<MessageList {...defaultProps} />)

      const scrollArea = container.querySelector('.overflow-y-scroll')
      expect(scrollArea).toBeInTheDocument()
    })
  })

  describe('user message styling', () => {
    it('should apply correct classes to user messages', () => {
      const thread: Message[] = [{ id: 'msg-1', text: 'User message', owner: 'user', timestamp: 1000 }]

      const { container } = render(<MessageList {...defaultProps} thread={thread} />)

      const userMessage = container.querySelector('.ml-auto')
      expect(userMessage).toBeInTheDocument()
      expect(userMessage).toHaveClass('rounded-[1.5rem]')
      expect(userMessage).toHaveClass('bg-brand-50')
    })
  })
})
