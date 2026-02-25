import { useAuth0 } from '@auth0/auth0-react'
import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import mermaid from 'mermaid'
import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type CSSProperties, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Button, Callout, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import { DevopsCopilotContext } from '../devops-copilot-context/devops-copilot-context'
import { useAICopilotConfig } from '../hooks/use-ai-copilot-config/use-ai-copilot-config'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryContext } from '../hooks/use-qovery-context/use-qovery-context'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'
import { useThreadState } from '../hooks/use-thread-state/use-thread-state'
import { useThreads } from '../hooks/use-threads/use-threads'
import { ContextBanner } from './context-banner/context-banner'
import DevopsCopilotHistory from './devops-copilot-history'
import { EnableCopilotScreen } from './enable-copilot-screen/enable-copilot-screen'
import { Header } from './header/header'
import { useMessageSubmission } from './hooks/use-message-submission/use-message-submission'
import { usePanelResize } from './hooks/use-panel-resize/use-panel-resize'
import { useStreamingAnimation } from './hooks/use-streaming-animation/use-streaming-animation'
import { useVoteHandler } from './hooks/use-vote-handler/use-vote-handler'
import { Input } from './input/input'
import { MessageList } from './message-list/message-list'
import { StatusFooter } from './status-footer/status-footer'
import { renderStreamingMessageWithMermaid } from './streaming-mermaid-renderer/streaming-mermaid-renderer'

export type Message = {
  id: string
  text: string
  owner: 'user' | 'assistant'
  timestamp: number
  vote?: 'upvote' | 'downvote'
}

export type Thread = Message[]

export interface DevopsCopilotPanelProps {
  onClose: () => void
  smaller?: boolean
  style?: CSSProperties
}

export type PlanStep = {
  messageId: string
  description: string
  toolName: string
  status: 'not_started' | 'in_progress' | 'completed' | 'waiting' | 'error'
}

export type CopilotContextData = {
  organization?: Organization
  cluster?: Cluster
  project?: Project
  environment?: Environment
  service?: AnyService
  deployment?:
    | {
        execution_id?: string
      }
    | undefined
  readOnly?: boolean
}

export function DevopsCopilotPanel({ onClose, style }: DevopsCopilotPanelProps) {
  const controllerRef = useRef<AbortController | null>(null)
  const STORAGE_KEY = 'assistant-panel-size'
  const { data } = useQoveryStatus()
  const docLinks = useContextualDocLinks()
  const { context, current } = useQoveryContext()
  const { user, getAccessTokenSilently } = useAuth0()
  const { sendMessageRef } = useContext(DevopsCopilotContext)

  const organizationId = context?.organization?.id ?? ''

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [expand, setExpand] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [withContext, setWithContext] = useState(true)
  const [threadId, setThreadId] = useState<string | undefined>()

  const [streamingMessage, setStreamingMessage] = useState('')
  const [displayedStreamingMessage, setDisplayedStreamingMessage] = useState('')
  const [isFinish, setIsFinish] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [loadingText, setLoadingText] = useState('Loading...')
  const { data: readOnlyData } = useAICopilotConfig({
    organizationId,
  })

  const [isReadOnly, setIsReadOnly] = useState(true)
  const isCopilotEnabled = readOnlyData?.org_config?.enabled ?? false

  const [plan, setPlan] = useState<PlanStep[]>([])
  const [showPlans, setShowPlans] = useState<Record<string, boolean>>({})

  const pendingThreadId = useRef<string>()

  const {
    threads = [],
    error: errorThreads,
    isLoading: isLoadingThreads,
    refetchThreads,
  } = useThreads({ organizationId, owner: user?.sub ?? '' })

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const currentThread = threads.find((t) => t.id === threadId)
      if (currentThread && currentThread.read_only !== undefined) {
        setIsReadOnly(currentThread.read_only)
      }
    }
  }, [threadId, threads])

  const { thread, setThread } = useThreadState({
    organizationId,
    threadId,
  })

  const handleVote = useVoteHandler({
    thread,
    setThread,
    userId: user?.sub ?? '',
    withContext,
    context,
  })

  const { handleSendMessage, lastSubmitResult } = useMessageSubmission({
    refs: {
      controller: controllerRef,
      scrollArea: scrollAreaRef,
      input: inputRef,
      pendingThreadId,
    },
    state: {
      inputMessage,
      thread,
      threadId,
      withContext,
      context,
      isReadOnly,
      userId: user?.sub ?? '',
    },
    actions: {
      setIsFinish,
      setStreamingMessage,
      setDisplayedStreamingMessage,
      setIsStopped,
      setLoadingText,
      setInputMessage,
      setIsLoading,
      setThreadId,
      setPlan,
      setThread,
      refetchThreads,
      getAccessTokenSilently,
    },
  })

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  const handleOnClose = useCallback(() => {
    onClose()
    setInputMessage('')
  }, [onClose])

  const adjustTextareaHeight = useCallback(
    (element: HTMLTextAreaElement) => {
      element.style.height = 'auto'

      if (thread.length > 0) return

      if (element.scrollHeight < 240) {
        element.style.height = `${element.scrollHeight}px`
      } else {
        element.style.height = '240px'
      }
    },
    [thread.length]
  )

  const hasMermaidChart = (messages: Message[], streamingText?: string) =>
    messages.some((msg) => msg.text.includes('```mermaid')) || (streamingText?.includes('```mermaid') ?? false)

  useEffect(() => {
    if (hasMermaidChart(thread, displayedStreamingMessage)) {
      mermaid.initialize({ startOnLoad: true })
    }
  }, [thread, displayedStreamingMessage])

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        adjustTextareaHeight(inputRef.current)
        inputRef.current.scrollTop = inputRef.current.scrollHeight
      }
    }, 50)
  }, [adjustTextareaHeight])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOnClose()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [handleOnClose])

  useEffect(() => {
    if (!sendMessageRef) return

    sendMessageRef.current = (message: string) => {
      controllerRef.current?.abort()

      setThread([])
      setThreadId(undefined)
      setPlan([])
      setIsReadOnly(true)
      setStreamingMessage('')
      setDisplayedStreamingMessage('')
      setIsFinish(false)
      setIsStopped(false)
      setIsLoading(false)

      setTimeout(() => {
        handleSendMessage(message, true)
      }, 0)
    }

    return () => {
      if (sendMessageRef) {
        sendMessageRef.current = null
      }
    }
  }, [sendMessageRef, handleSendMessage, setThread])

  const currentThreadHistoryTitle = threads.find((t) => t.id === threadId)?.title ?? 'No title'

  const [isAtBottom, setIsAtBottom] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      (isLoading && isFinish && displayedStreamingMessage.length >= streamingMessage.length) ||
      (isStopped && isLoading && isFinish)
    ) {
      controllerRef.current?.abort()
      if (pendingThreadId.current && lastSubmitResult.current?.messageId) {
        const newAssistantMessageId = lastSubmitResult.current.messageId

        setThread([
          ...thread,
          {
            id: newAssistantMessageId,
            text: streamingMessage,
            owner: 'assistant',
            timestamp: Date.now(),
          },
        ])

        setPlan((prev) =>
          prev.map((step) => (step.messageId === 'temp' ? { ...step, messageId: newAssistantMessageId } : step))
        )
      } else {
        setThread([
          ...thread,
          {
            id: (Date.now() + 1).toString(),
            text: streamingMessage,
            owner: 'assistant',
            timestamp: Date.now(),
          },
        ])
      }
      setIsLoading(false)
      setStreamingMessage('')
    }
    if (!streamingMessage || displayedStreamingMessage === streamingMessage) return
  }, [streamingMessage, displayedStreamingMessage, isStopped, isFinish, isLoading, lastSubmitResult, setThread, thread])

  useStreamingAnimation({
    streamingMessage,
    displayedStreamingMessage,
    setDisplayedStreamingMessage,
  })

  useEffect(() => {
    const node = scrollAreaRef.current

    if (!node) return

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = node
      const atBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 2
      setIsAtBottom(atBottom)
    }

    node.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      node.removeEventListener('scroll', handleScroll)
    }
  }, [threadId, displayedStreamingMessage])

  const { isResizing, startResize } = usePanelResize({
    panelRef,
    expand,
    storageKey: STORAGE_KEY,
    style,
  })

  return (
    <Dialog.Root
      open={true}
      modal={true}
      onOpenChange={() => {
        document.body.style.pointerEvents = 'initial'
      }}
    >
      <Dialog.Portal>
        {expand && (
          <Dialog.Overlay
            style={style}
            className="absolute left-0 top-0 z-0 h-screen w-screen animate-[fadein_0.22s_ease-in-out_forwards_0.05s] bg-black/50 opacity-0 backdrop-blur-[2px] "
            onClick={handleOnClose}
          />
        )}
        <Dialog.Content
          ref={panelRef}
          className={twMerge(
            clsx(
              'fixed bottom-2 right-2 z-10 flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_70px_rgba(0,0,0,0.2)] dark:border-neutral-500 dark:bg-neutral-600',
              {
                'left-4 top-4 animate-[scalein_0.22s_ease_both] opacity-0': expand,
                'animate-slidein-up-sm-faded': !expand,
                'border-2 border-brand-500': !expand && isResizing,
              }
            )
          )}
          style={style}
        >
          {!expand && <div className="absolute left-1 top-1 z-10 cursor-nw-resize p-1" onMouseDown={startResize} />}
          {expand && (
            <DevopsCopilotHistory
              data={{
                threads,
                error: errorThreads,
                isLoading: isLoadingThreads,
              }}
              threadId={threadId}
              setThreadId={setThreadId}
              organizationId={organizationId}
            />
          )}
          <div className="flex h-full w-full flex-col justify-between">
            <Header
              threadId={threadId}
              threads={threads}
              currentThreadHistoryTitle={currentThreadHistoryTitle}
              userAccess={readOnlyData?.user_access}
              isReadOnly={isReadOnly}
              setIsReadOnly={setIsReadOnly}
              threadLength={thread.length}
              expand={expand}
              setExpand={setExpand}
              handleOnClose={handleOnClose}
              controllerRef={controllerRef}
              setThread={setThread}
              setThreadId={setThreadId}
              setIsLoading={setIsLoading}
              setPlan={setPlan}
            />
            {isCopilotEnabled ? (
              <div className="flex grow flex-col">
                {!isReadOnly && (
                  <div className="animate-[fadein_0.22s_ease-in-out_forwards] px-4 pb-2 pt-4 opacity-0">
                    <Callout.Root color="yellow">
                      <Callout.Icon>
                        <Icon iconName="triangle-exclamation" />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>Read-write mode enabled</Callout.TextHeading>
                        <Callout.TextDescription>
                          The copilot can perform actions on your infrastructure.
                          {thread.length === 0 && ' Mode cannot be changed after the conversation has started.'}
                        </Callout.TextDescription>
                      </Callout.Text>
                    </Callout.Root>
                  </div>
                )}
                {thread.length === 0 && (
                  <span className="mx-auto w-full max-w-[430px] animate-[fadein_0.22s_ease-in-out_forwards_0.05s] py-4 text-center text-ssm opacity-0">
                    I'm your <span className="font-medium text-brand-500">DevOps AI Copilot</span> - I can help you to
                    fix your deployments, optimize your infrastructure costs, audit your security and do everything you
                    would expect from a complete DevOps Engineering team.
                  </span>
                )}
                <MessageList
                  scrollAreaRef={scrollAreaRef}
                  expand={expand}
                  thread={thread}
                  docLinks={docLinks}
                  isCopilotEnabled={isCopilotEnabled}
                  onSuggestionClick={(label) => {
                    setInputMessage(label)
                    handleSendMessage(label)
                  }}
                  isLoading={isLoading}
                  streamingMessage={streamingMessage}
                  displayedStreamingMessage={displayedStreamingMessage}
                  loadingText={loadingText}
                  plan={plan}
                  showPlans={showPlans}
                  setShowPlans={setShowPlans}
                  threadId={threadId}
                  pendingThreadId={pendingThreadId.current}
                  renderStreamingMessageWithMermaid={renderStreamingMessageWithMermaid}
                  handleVote={handleVote}
                  isAtBottom={isAtBottom}
                />
                <div
                  className={clsx('relative mt-auto flex flex-col gap-2 px-4 pb-4', {
                    'shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.05)]': thread.length > 0,
                  })}
                >
                  {thread.length === 0 && docLinks.length > 0 && !expand && isCopilotEnabled && (
                    <div className="flex animate-[fadein_0.22s_ease-in-out_forwards_0.10s] flex-col gap-2 opacity-0">
                      <span className="text-[11px] font-semibold text-neutral-400 dark:text-white">
                        Ask for a contextual suggestion:
                      </span>
                      <div className="flex flex-col gap-2 text-neutral-400">
                        {docLinks.map(({ label, link }) => (
                          <Button
                            key={`${label}${link}`}
                            type="button"
                            variant="surface"
                            className="inline-flex max-w-max gap-2 truncate"
                            onClick={() => {
                              setInputMessage(label)
                              handleSendMessage(label)
                            }}
                          >
                            <Icon iconName="arrow-right" />
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className={twMerge(
                      clsx('relative animate-[fadein_0.22s_ease-in-out_forwards_0.15s] pt-3 opacity-0', {
                        'pt-[42px]': withContext,
                      })
                    )}
                  >
                    {withContext && (
                      <ContextBanner
                        currentType={String(current?.type)}
                        currentName={String(current?.name ?? 'No context')}
                        onClose={() => setWithContext(false)}
                      />
                    )}
                    <Input
                      disabled={!isCopilotEnabled}
                      ref={inputRef}
                      value={inputMessage}
                      rows={1}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onClick={handleSendMessage}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                          e.preventDefault()
                          handleSendMessage()
                        } else {
                          if (inputRef.current) adjustTextareaHeight(inputRef.current)
                        }
                      }}
                      onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
                      loading={isLoading}
                      stop={() => {
                        setIsStopped(true)
                        setIsFinish(true)
                      }}
                    />
                  </div>
                  <StatusFooter isReadOnly={isReadOnly} appStatus={appStatus} />
                </div>
              </div>
            ) : (
              <EnableCopilotScreen organizationId={context?.organization?.id} onClose={handleOnClose} />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
