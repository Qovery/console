import { clusterFactoryMock, organizationFactoryMock, projectsFactoryMock } from '@qovery/shared/factories'
import { toast } from '@qovery/shared/ui'
import { renderHook, waitFor } from '@qovery/shared/util-tests'
import type { CopilotContextData, Message } from '../../devops-copilot-panel'
import * as submitVoteModule from '../../submit-vote'
import { useVoteHandler } from './use-vote-handler'

jest.mock('../../submit-vote')

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    ToastEnum: {
      SUCCESS: 'SUCCESS',
    },
    toast: jest.fn(),
  }
})

const mockToast = toast as jest.MockedFunction<typeof toast>

describe('useVoteHandler', () => {
  const mockSubmitVote = submitVoteModule.submitVote as jest.MockedFunction<typeof submitVoteModule.submitVote>

  const mockContext: CopilotContextData = {
    organization: organizationFactoryMock(1)[0],
  }

  const mockThread: Message[] = [
    {
      id: 'msg-1',
      text: 'Hello',
      owner: 'user',
      timestamp: 1000,
    },
    {
      id: 'msg-2',
      text: 'Hi there',
      owner: 'assistant',
      timestamp: 2000,
    },
  ]

  const mockSetThread = jest.fn()

  const defaultParams = {
    thread: mockThread,
    setThread: mockSetThread,
    userId: 'user-123',
    withContext: false,
    context: mockContext,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('voting behavior', () => {
    it('should add upvote to message without existing vote', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'upvote',
          },
        ])
      })
    })

    it('should add downvote to message without existing vote', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'downvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'downvote',
          },
        ])
      })
    })

    it('should remove vote when clicking same vote again', async () => {
      const threadWithVote: Message[] = [
        mockThread[0],
        {
          ...mockThread[1],
          vote: 'upvote',
        },
      ]

      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          thread: threadWithVote,
        })
      )

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: undefined,
          },
        ])
      })
    })

    it('should change from upvote to downvote', async () => {
      const threadWithUpvote: Message[] = [
        mockThread[0],
        {
          ...mockThread[1],
          vote: 'upvote',
        },
      ]

      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          thread: threadWithUpvote,
        })
      )

      await result.current('msg-2', 'downvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'downvote',
          },
        ])
      })
    })

    it('should change from downvote to upvote', async () => {
      const threadWithDownvote: Message[] = [
        mockThread[0],
        {
          ...mockThread[1],
          vote: 'downvote',
        },
      ]

      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          thread: threadWithDownvote,
        })
      )

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'upvote',
          },
        ])
      })
    })
  })

  describe('API interaction', () => {
    it('should call submitVote with correct parameters', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSubmitVote).toHaveBeenCalledWith('user-123', 'msg-2', 'upvote', {
          organization: mockContext.organization,
        })
      })
    })

    it('should send full context when withContext is true', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const fullContext = {
        organization: mockContext.organization,
        cluster: clusterFactoryMock(1)[0],
        project: projectsFactoryMock(1)[0],
      }

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          withContext: true,
          context: fullContext,
        })
      )

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSubmitVote).toHaveBeenCalledWith('user-123', 'msg-2', 'upvote', fullContext)
      })
    })

    it('should send only organization when withContext is false', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const fullContext = {
        organization: mockContext.organization,
        cluster: clusterFactoryMock(1)[0],
      }

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          withContext: false,
          context: fullContext,
        })
      )

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSubmitVote).toHaveBeenCalledWith('user-123', 'msg-2', 'upvote', {
          organization: mockContext.organization,
        })
      })
    })
  })

  describe('toast notifications', () => {
    it('should show success toast when upvoting', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('SUCCESS', 'Message successfully upvoted')
      })
    })

    it('should show success toast when downvoting', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'downvote')

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('SUCCESS', 'Message successfully downvoted')
      })
    })

    it('should not show toast when removing vote', async () => {
      const threadWithVote: Message[] = [
        mockThread[0],
        {
          ...mockThread[1],
          vote: 'upvote',
        },
      ]

      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          thread: threadWithVote,
        })
      )

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockToast).not.toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should revert vote when API call fails', async () => {
      mockSubmitVote.mockRejectedValue(new Error('API error'))

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledTimes(2)
        expect(mockSetThread).toHaveBeenLastCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: undefined,
          },
        ])
      })
    })

    it('should revert to previous vote when API call fails', async () => {
      const threadWithUpvote: Message[] = [
        mockThread[0],
        {
          ...mockThread[1],
          vote: 'upvote',
        },
      ]

      mockSubmitVote.mockRejectedValue(new Error('API error'))

      const { result } = renderHook(() =>
        useVoteHandler({
          ...defaultParams,
          thread: threadWithUpvote,
        })
      )

      await result.current('msg-2', 'downvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledTimes(2)
        expect(mockSetThread).toHaveBeenLastCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'upvote',
          },
        ])
      })
    })

    it('should revert vote when exception occurs', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockSubmitVote.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledTimes(2)
        expect(mockSetThread).toHaveBeenLastCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: undefined,
          },
        ])
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending vote:', expect.any(Error))
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('optimistic updates', () => {
    it('should immediately update UI before API call completes', async () => {
      mockSubmitVote.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ id: 'vote-id' }), 100)
          })
      )

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      result.current('msg-2', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith([
          mockThread[0],
          {
            ...mockThread[1],
            vote: 'upvote',
          },
        ])
      })
    })
  })

  describe('message not found', () => {
    it('should handle voting on non-existent message gracefully', async () => {
      mockSubmitVote.mockResolvedValue({ id: 'vote-id' })

      const { result } = renderHook(() => useVoteHandler(defaultParams))

      await result.current('non-existent-msg', 'upvote')

      await waitFor(() => {
        expect(mockSetThread).toHaveBeenCalledWith(mockThread)
      })
    })
  })
})
