import { clusterFactoryMock, organizationFactoryMock, projectsFactoryMock } from '@qovery/shared/factories'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import * as submitMessageModule from '../../submit-message'
import { useMessageSubmission } from './use-message-submission'

jest.mock('../../submit-message')

describe('useMessageSubmission', () => {
  const mockSubmitMessage = submitMessageModule.submitMessage as jest.MockedFunction<
    typeof submitMessageModule.submitMessage
  >

  const mockOrganization = organizationFactoryMock(1)[0]
  const mockCluster = clusterFactoryMock(1)[0]
  const mockProject = projectsFactoryMock(1)[0]

  const createMockRefs = () => ({
    controller: { current: null } as React.MutableRefObject<AbortController | null>,
    scrollArea: { current: null } as React.MutableRefObject<HTMLDivElement | null>,
    input: { current: null } as React.MutableRefObject<HTMLTextAreaElement | null>,
    pendingThreadId: { current: undefined } as React.MutableRefObject<string | undefined>,
  })

  const createMockState = () => ({
    inputMessage: '',
    thread: [],
    threadId: undefined,
    withContext: false,
    context: {
      organization: mockOrganization,
    },
    isReadOnly: false,
    userId: 'user-123',
  })

  const createMockActions = () => ({
    setIsFinish: jest.fn(),
    setStreamingMessage: jest.fn(),
    setDisplayedStreamingMessage: jest.fn(),
    setIsStopped: jest.fn(),
    setLoadingText: jest.fn(),
    setInputMessage: jest.fn(),
    setIsLoading: jest.fn(),
    setThreadId: jest.fn(),
    setPlan: jest.fn(),
    setThread: jest.fn(),
    refetchThreads: jest.fn(),
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubmitMessage.mockResolvedValue({
      id: 'message-123',
      messageId: 'msg-456',
    })
  })

  describe('handleSendMessage', () => {
    it('should not send empty message', async () => {
      const refs = createMockRefs()
      const state = createMockState()
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      expect(mockSubmitMessage).not.toHaveBeenCalled()
    })

    it('should send message with trimmed input', async () => {
      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: '  Hello world  ' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(mockSubmitMessage).toHaveBeenCalledWith(
          'user-123',
          'Hello world',
          'mock-token',
          undefined,
          expect.objectContaining({
            organization: mockOrganization,
            readOnly: false,
          }),
          expect.any(Function),
          expect.any(Object)
        )
      })
    })

    it('should use message override when provided', async () => {
      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: 'Original message' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage('Override message')

      await waitFor(() => {
        expect(mockSubmitMessage).toHaveBeenCalledWith(
          'user-123',
          'Override message',
          expect.any(String),
          undefined,
          expect.any(Object),
          expect.any(Function),
          expect.any(Object)
        )
      })
    })

    it('should add user message to thread', async () => {
      const refs = createMockRefs()
      const existingMessage = { id: '1', text: 'Previous message', owner: 'user' as const, timestamp: 1000 }
      const state = { ...createMockState(), inputMessage: 'New message', thread: [existingMessage] }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(actions.setThread).toHaveBeenCalledWith(
          expect.arrayContaining([
            existingMessage,
            expect.objectContaining({
              text: 'New message',
              owner: 'user',
            }),
          ])
        )
      })
    })

    it('should reset state before sending message', async () => {
      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(actions.setIsFinish).toHaveBeenCalledWith(false)
        expect(actions.setStreamingMessage).toHaveBeenCalledWith('')
        expect(actions.setDisplayedStreamingMessage).toHaveBeenCalledWith('')
        expect(actions.setIsStopped).toHaveBeenCalledWith(false)
        expect(actions.setLoadingText).toHaveBeenCalledWith('Loading...')
        expect(actions.setInputMessage).toHaveBeenCalledWith('')
        expect(actions.setIsLoading).toHaveBeenCalledWith(true)
      })
    })

    it('should include full context when withContext is true', async () => {
      const refs = createMockRefs()
      const fullContext = {
        organization: mockOrganization,
        cluster: mockCluster,
        project: mockProject,
      }
      const state = {
        ...createMockState(),
        inputMessage: 'Test',
        withContext: true,
        context: fullContext,
        threadId: 'thread-1',
      }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(mockSubmitMessage).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(String),
          'thread-1',
          expect.objectContaining({
            organization: mockOrganization,
            readOnly: false,
          }),
          expect.any(Function),
          expect.any(Object)
        )
      })
    })

    it('should only include organization when withContext is false', async () => {
      const refs = createMockRefs()
      const fullContext = {
        organization: mockOrganization,
        cluster: mockCluster,
      }
      const state = {
        ...createMockState(),
        inputMessage: 'Test',
        withContext: false,
        context: fullContext,
        threadId: 'thread-2',
      }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(mockSubmitMessage).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.any(String),
          'thread-2',
          {
            organization: mockOrganization,
            readOnly: false,
          },
          expect.any(Function),
          expect.any(Object)
        )
      })
    })

    it('should set isFinish to true after successful submission', async () => {
      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(actions.setIsFinish).toHaveBeenCalledWith(true)
      })
    })

    it('should set isFinish to true after error', async () => {
      mockSubmitMessage.mockRejectedValueOnce(new Error('Network error'))

      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(actions.setIsFinish).toHaveBeenCalledWith(true)
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching response:', expect.any(Error))
      })

      consoleErrorSpy.mockRestore()
    })

    it('should reset input height when input ref exists', async () => {
      const mockInputElement = document.createElement('textarea')
      mockInputElement.style.height = '100px'

      const refs = {
        ...createMockRefs(),
        input: { current: mockInputElement } as React.MutableRefObject<HTMLTextAreaElement | null>,
      }
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(mockInputElement).toHaveStyle({ height: 'initial' })
      })
    })

    it('should scroll to bottom when scrollArea ref exists', async () => {
      const mockScrollTo = jest.fn()
      const mockScrollArea = {
        scrollHeight: 1000,
        scrollTo: mockScrollTo,
      } as unknown as HTMLDivElement

      const refs = {
        ...createMockRefs(),
        scrollArea: { current: mockScrollArea } as React.MutableRefObject<HTMLDivElement | null>,
      }
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(mockScrollTo).toHaveBeenCalledWith({
          top: 1000,
          behavior: 'smooth',
        })
      })
    })

    it('should store last submit result', async () => {
      const refs = createMockRefs()
      const state = { ...createMockState(), inputMessage: 'Test message' }
      const actions = createMockActions()

      mockSubmitMessage.mockResolvedValueOnce({
        id: 'thread-789',
        messageId: 'msg-999',
      })

      const { result } = renderHook(() => useMessageSubmission({ refs, state, actions }))

      await result.current.handleSendMessage()

      await waitFor(() => {
        expect(result.current.lastSubmitResult.current).toEqual({
          id: 'thread-789',
          messageId: 'msg-999',
        })
      })
    })
  })
})
