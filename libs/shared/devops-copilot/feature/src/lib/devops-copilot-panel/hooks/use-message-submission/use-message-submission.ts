import { type MutableRefObject, useCallback, useRef } from 'react'
import type { CopilotContextData, Message, PlanStep } from '../../devops-copilot-panel'
import { submitMessage } from '../../submit-message'
import { parseStreamChunk } from './parse-stream-chunk'

interface MessageSubmissionRefs {
  controller: MutableRefObject<AbortController | null>
  scrollArea: MutableRefObject<HTMLDivElement | null>
  input: MutableRefObject<HTMLTextAreaElement | null>
  pendingThreadId: MutableRefObject<string | undefined>
}

interface MessageSubmissionState {
  inputMessage: string
  thread: Message[]
  threadId: string | undefined
  withContext: boolean
  context: CopilotContextData
  isReadOnly: boolean
  userId: string
}

interface MessageSubmissionActions {
  setIsFinish: (value: boolean) => void
  setStreamingMessage: (value: string) => void
  setDisplayedStreamingMessage: (value: string) => void
  setIsStopped: (value: boolean) => void
  setLoadingText: (value: string) => void
  setInputMessage: (value: string) => void
  setIsLoading: (value: boolean) => void
  setThreadId: (id: string | undefined) => void
  setPlan: (plan: PlanStep[] | ((prev: PlanStep[]) => PlanStep[])) => void
  setThread: (thread: Message[]) => void
  refetchThreads: () => void
  getAccessTokenSilently: () => Promise<string>
}

interface UseMessageSubmissionParams {
  refs: MessageSubmissionRefs
  state: MessageSubmissionState
  actions: MessageSubmissionActions
}

export function useMessageSubmission({ refs, state, actions }: UseMessageSubmissionParams) {
  const lastSubmitResult = useRef<{ id: string; messageId: string } | null>(null)
  const fullContentRef = useRef('')

  const handleSendMessage = useCallback(
    async (messageOverride?: string, newThread = false) => {
      refs.controller.current = new AbortController()
      lastSubmitResult.current = null
      fullContentRef.current = ''

      const node = refs.scrollArea.current
      if (node) {
        node.scrollTo({
          top: node.scrollHeight,
          behavior: 'smooth',
        })
      }

      actions.setIsFinish(false)
      actions.setStreamingMessage('')
      actions.setDisplayedStreamingMessage('')
      actions.setIsStopped(false)
      actions.setLoadingText('Loading...')

      const trimmedInputMessage =
        typeof messageOverride === 'string' ? messageOverride.trim() : state.inputMessage.trim()

      if (!trimmedInputMessage) return

      const newMessage: Message = {
        id: Date.now().toString(),
        text: trimmedInputMessage,
        owner: 'user',
        timestamp: Date.now(),
      }
      const updatedThread = newThread ? [newMessage] : [...state.thread, newMessage]
      actions.setThread(updatedThread)

      actions.setInputMessage('')
      actions.setIsLoading(true)
      actions.setStreamingMessage('')

      if (refs.input.current) {
        refs.input.current.style.height = 'initial'
      }

      try {
        const token = await actions.getAccessTokenSilently()
        const contextPayload = state.withContext
          ? { ...state.context, readOnly: state.isReadOnly }
          : { organization: state.context.organization, readOnly: state.isReadOnly }

        const response = await submitMessage(
          state.userId,
          trimmedInputMessage,
          token,
          newThread ? undefined : state.threadId,
          contextPayload,
          (chunk) => {
            const parsedChunk = parseStreamChunk(chunk, fullContentRef.current)

            if (!parsedChunk) return

            switch (parsedChunk.type) {
              case 'start':
                if (parsedChunk.data?.threadId) {
                  refs.pendingThreadId.current = parsedChunk.data.threadId
                  actions.setThreadId(parsedChunk.data.threadId)
                  actions.refetchThreads()
                }
                break

              case 'plan':
                if (parsedChunk.data?.plan) {
                  actions.setPlan(parsedChunk.data.plan)
                }
                break

              case 'step':
                if (parsedChunk.data?.loadingText) {
                  actions.setLoadingText(parsedChunk.data.loadingText)
                }
                break

              case 'step_plan_reset':
                actions.setPlan([])
                actions.setLoadingText('Generating a new plan...')
                break

              case 'step_plan':
                if (parsedChunk.data?.loadingText) {
                  actions.setLoadingText(parsedChunk.data.loadingText)
                }
                if (parsedChunk.data?.stepUpdate) {
                  const { description, status } = parsedChunk.data.stepUpdate
                  actions.setPlan((prev) =>
                    prev.map((step) =>
                      step.description.toLowerCase().includes(description.toLowerCase())
                        ? { ...step, status: status as PlanStep['status'] }
                        : step
                    )
                  )
                }
                break

              case 'content':
                if (parsedChunk.data?.content) {
                  fullContentRef.current = parsedChunk.data.content
                  actions.setStreamingMessage(parsedChunk.data.content)
                }
                break
            }
          },
          refs.controller.current.signal
        )

        lastSubmitResult.current = response
      } catch (error) {
        console.error('Error fetching response:', error)
      } finally {
        actions.setIsFinish(true)
      }
    },
    [
      state.inputMessage,
      state.thread,
      state.threadId,
      state.withContext,
      state.context,
      state.isReadOnly,
      state.userId,
      refs,
      actions,
    ]
  )

  return { handleSendMessage, lastSubmitResult }
}
