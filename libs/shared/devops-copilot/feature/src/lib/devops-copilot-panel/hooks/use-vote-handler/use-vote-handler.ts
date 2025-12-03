import { useCallback } from 'react'
import { ToastEnum, toast } from '@qovery/shared/ui'
import type { DevopsCopilotContext, Message } from '../../devops-copilot-panel.types'
import { submitVote } from '../../submit-vote'

interface UseVoteHandlerParams {
  thread: Message[]
  setThread: (thread: Message[]) => void
  userId: string
  withContext: boolean
  context: DevopsCopilotContext
}

export function useVoteHandler({ thread, setThread, userId, withContext, context }: UseVoteHandlerParams) {
  const handleVote = useCallback(
    async (messageId: string, vote: 'upvote' | 'downvote') => {
      const currentMessage = thread.find((msg: Message) => msg.id === messageId)
      const currentVote = currentMessage?.vote
      const nextVote = currentVote === vote ? undefined : vote

      const updatedThread = thread.map((msg: Message) => (msg.id === messageId ? { ...msg, vote: nextVote } : msg))
      setThread(updatedThread)

      try {
        const response = await submitVote(
          userId,
          messageId,
          vote,
          withContext ? context : { organization: context.organization }
        )

        if (!response) {
          const updatedThread = thread.map((msg: Message) =>
            msg.id === messageId ? { ...msg, vote: currentVote } : msg
          )
          setThread(updatedThread)
        } else {
          if (nextVote) {
            toast(ToastEnum.SUCCESS, `Message successfully ${nextVote === 'upvote' ? 'upvoted' : 'downvoted'}`)
          }
        }
      } catch (error) {
        console.error('Error sending vote:', error)
        const updatedThread = thread.map((msg: Message) => (msg.id === messageId ? { ...msg, vote: currentVote } : msg))
        setThread(updatedThread)
      }
    },
    [thread, setThread, userId, withContext, context]
  )

  return handleVote
}
