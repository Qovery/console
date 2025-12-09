import { TextDecoder, TextEncoder } from 'util'
import { mutations } from '@qovery/shared/devops-copilot/data-access'
import { organizationFactoryMock } from '@qovery/shared/factories'
import type { CopilotContextData } from './devops-copilot-panel'
import { submitMessage } from './submit-message'

global.TextEncoder = TextEncoder as typeof global.TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

jest.mock('@qovery/shared/devops-copilot/data-access', () => ({
  mutations: {
    addThread: jest.fn(),
    addMessage: jest.fn(),
  },
}))

describe('submitMessage', () => {
  const mockAddThread = mutations.addThread as jest.MockedFunction<typeof mutations.addThread>
  const mockAddMessage = mutations.addMessage as jest.MockedFunction<typeof mutations.addMessage>

  const mockContext: CopilotContextData = {
    organization: organizationFactoryMock(1)[0],
    readOnly: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('thread creation', () => {
    it('should create new thread when threadId is not provided', async () => {
      mockAddThread.mockResolvedValue({
        data: { id: 'thread-123' },
      } as unknown as ReturnType<typeof mutations.addThread>)

      mockAddMessage.mockResolvedValue({
        body: null,
      } as unknown as Response)

      await submitMessage('user-123', 'Hello', 'token-123', undefined, mockContext)

      expect(mockAddThread).toHaveBeenCalledWith({
        userSub: 'user-123',
        organizationId: mockContext.organization?.id,
        message: 'Hello',
        readOnly: true,
      })
    })

    it('should not create new thread when threadId is provided', async () => {
      mockAddMessage.mockResolvedValue({
        body: null,
      } as unknown as Response)

      await submitMessage('user-123', 'Hello', 'token-123', 'existing-thread', mockContext)

      expect(mockAddThread).not.toHaveBeenCalled()
    })
  })

  describe('message submission', () => {
    it('should add message with correct parameters', async () => {
      mockAddMessage.mockResolvedValue({
        body: null,
      } as unknown as Response)

      await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext)

      expect(mockAddMessage).toHaveBeenCalledWith({
        userSub: 'user-123',
        token: 'token-123',
        organizationId: mockContext.organization?.id,
        threadId: 'thread-123',
        message: 'Hello',
        context: mockContext,
        signal: undefined,
      })
    })

    it('should pass abort signal when provided', async () => {
      const abortController = new AbortController()
      mockAddMessage.mockResolvedValue({
        body: null,
      } as unknown as Response)

      await submitMessage(
        'user-123',
        'Hello',
        'token-123',
        'thread-123',
        mockContext,
        undefined,
        abortController.signal
      )

      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          signal: abortController.signal,
        })
      )
    })
  })

  describe('streaming response', () => {
    it('should process stream chunks when onStream callback provided', async () => {
      const onStreamMock = jest.fn()
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"text","content":"Hello"}\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      mockAddMessage.mockResolvedValue({
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext, onStreamMock)

      expect(onStreamMock).toHaveBeenCalledWith('{"type":"text","content":"Hello"}')
    })

    it('should extract assistant message ID from complete chunk', async () => {
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"complete","content":{"id":"msg-456"}}\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      mockAddMessage.mockResolvedValue({
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      const result = await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext, jest.fn())

      expect(result?.messageId).toBe('msg-456')
    })

    it('should handle multiple data chunks in one stream', async () => {
      const onStreamMock = jest.fn()
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: chunk1\ndata: chunk2\ndata: chunk3\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      mockAddMessage.mockResolvedValue({
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext, onStreamMock)

      expect(onStreamMock).toHaveBeenCalledTimes(3)
      expect(onStreamMock).toHaveBeenCalledWith('chunk1')
      expect(onStreamMock).toHaveBeenCalledWith('chunk2')
      expect(onStreamMock).toHaveBeenCalledWith('chunk3')
    })

    it('should handle invalid JSON in stream chunks gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {invalid json}\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      mockAddMessage.mockResolvedValue({
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      const result = await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext, jest.fn())

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse chunk:', '{invalid json}', expect.any(Error))
      expect(result?.messageId).toBe('')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('return value', () => {
    it('should return thread ID and message ID', async () => {
      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"type":"complete","content":{"id":"msg-789"}}\n'),
          })
          .mockResolvedValueOnce({
            done: true,
            value: undefined,
          }),
      }

      mockAddMessage.mockResolvedValue({
        body: {
          getReader: () => mockReader,
        },
      } as unknown as Response)

      const result = await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext, jest.fn())

      expect(result).toEqual({
        id: 'thread-123',
        messageId: 'msg-789',
      })
    })

    it('should return empty messageId when no stream or no complete message', async () => {
      mockAddMessage.mockResolvedValue({
        body: null,
      } as unknown as Response)

      const result = await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext)

      expect(result).toEqual({
        id: 'thread-123',
        messageId: '',
      })
    })
  })

  describe('error handling', () => {
    it('should return null when organization ID is missing', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const contextWithoutOrg = {}

      const result = await submitMessage('user-123', 'Hello', 'token-123', undefined, contextWithoutOrg)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.any(Error))
      expect(mockAddThread).not.toHaveBeenCalled()
      expect(mockAddMessage).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should return null when thread creation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      mockAddThread.mockRejectedValue(new Error('Thread creation failed'))

      const result = await submitMessage('user-123', 'Hello', 'token-123', undefined, mockContext)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })

    it('should return null when message submission fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      mockAddMessage.mockRejectedValue(new Error('Message submission failed'))

      const result = await submitMessage('user-123', 'Hello', 'token-123', 'thread-123', mockContext)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })
})
