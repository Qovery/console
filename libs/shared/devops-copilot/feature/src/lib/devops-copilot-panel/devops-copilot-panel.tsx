import { useAuth0 } from '@auth0/auth0-react'
import * as Dialog from '@radix-ui/react-dialog'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import mermaid from 'mermaid'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Cluster, type Environment, type Organization, type Project } from 'qovery-typescript-axios'
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { SETTINGS_AI_COPILOT_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { AnimatedGradientText, Button, Callout, Icon, Link, Tooltip } from '@qovery/shared/ui'
import { QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import { DotStatus } from '../dot-status/dot-status'
import { useAICopilotConfig } from '../hooks/use-ai-copilot-config/use-ai-copilot-config'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryContext } from '../hooks/use-qovery-context/use-qovery-context'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'
import { useThreadState } from '../hooks/use-thread-state/use-thread-state'
import { useThreads } from '../hooks/use-threads/use-threads'
import { getIconClass, getIconName } from '../utils/icon-utils/icon-utils'
import { AssistantMessage } from './assistant-message/assistant-message'
import DevopsCopilotHistory from './devops-copilot-history'
import { Header } from './header/header'
import { useMessageSubmission } from './hooks/use-message-submission/use-message-submission'
import { useVoteHandler } from './hooks/use-vote-handler/use-vote-handler'
import { Input } from './input/input'
import { renderStreamingMessageWithMermaid } from './streaming-mermaid-renderer/streaming-mermaid-renderer'
import { StreamingMessage } from './streaming-message/streaming-message'

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
  const isDevopsCopilotPanelFeatureFlag = useFeatureFlagVariantKey('devops-copilot-config-panel')

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

  useEffect(() => {
    if (streamingMessage.length === 0 || streamingMessage.length <= displayedStreamingMessage.length) {
      return
    }

    let animationFrameId: number
    let lastTimestamp = performance.now()
    let isPaused = false

    const animate = (timestamp: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const elapsed = timestamp - lastTimestamp

      setDisplayedStreamingMessage((prev) => {
        const remaining = streamingMessage.length - prev.length

        if (remaining <= 0) {
          return streamingMessage
        }

        let chunkSize = 1
        const currentLength = prev.length

        let baseChunkSize = 2
        if (currentLength > 6000) {
          baseChunkSize = 5
        } else if (currentLength > 4000) {
          baseChunkSize = 4
        } else if (currentLength > 2000) {
          baseChunkSize = 3
        }

        if (elapsed > 100) {
          chunkSize = Math.min(100, remaining)
        } else if (elapsed > 16) {
          chunkSize = Math.min(baseChunkSize * 2, remaining)
        } else {
          chunkSize = Math.min(baseChunkSize, remaining)
        }

        const nextContent = streamingMessage.slice(0, prev.length + chunkSize)

        if (!streamingMessage.startsWith(nextContent)) {
          return streamingMessage
        }

        return nextContent
      })

      lastTimestamp = timestamp

      if (displayedStreamingMessage.length < streamingMessage.length) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true
      } else {
        isPaused = false
        setDisplayedStreamingMessage(streamingMessage)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [streamingMessage, displayedStreamingMessage])

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

  useEffect(() => {
    const applyPanelSize = () => {
      const panel = panelRef.current
      if (!panel) return

      if (expand) {
        panel.style.width = 'calc(100vw - 32px)'
        panel.style.height = 'calc(100vh - 32px)'
        panel.style.top = '1rem'
        panel.style.left = '1rem'
        panel.style.bottom = ''
        panel.style.right = ''
      } else {
        const size = localStorage.getItem(STORAGE_KEY)
        if (size) {
          try {
            const { width, height } = JSON.parse(size)
            panel.style.width = `${Math.min(width, window.innerWidth * 0.9)}px`
            panel.style.height = `${Math.min(height, window.innerHeight * 0.9)}px`
          } catch (e) {
            console.error('Failed to apply panel size from localStorage', e)
            panel.style.width = `${Math.min(480, window.innerWidth * 0.9)}px`
            panel.style.height = `${Math.min(600, window.innerHeight * 0.9)}px`
          }
        } else {
          panel.style.width = `${Math.min(480, window.innerWidth * 0.9)}px`
          panel.style.height = `${Math.min(600, window.innerHeight * 0.9)}px`
        }
        panel.style.top = ''
        panel.style.left = ''
        panel.style.bottom = '8px'
        panel.style.right = '8px'
      }
    }

    applyPanelSize()
    window.addEventListener('resize', applyPanelSize)
    return () => window.removeEventListener('resize', applyPanelSize)
  }, [expand, style])

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const panel = panelRef.current
    if (!panel) return

    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = panel.offsetWidth
    const startHeight = panel.offsetHeight
    const startLeft = panel.getBoundingClientRect().left
    const startTop = panel.getBoundingClientRect().top

    const onMouseMove = (e: MouseEvent) => {
      const dx = startX - e.clientX
      const dy = startY - e.clientY
      const maxWidth = window.innerWidth * 0.9
      const maxHeight = window.innerHeight * 0.9
      const newWidth = Math.min(Math.max(startWidth + dx, 450), maxWidth)
      const newHeight = Math.min(Math.max(startHeight + dy, 600), maxHeight)
      panel.style.width = `${newWidth}px`
      panel.style.height = `${newHeight}px`
      panel.style.left = `${startLeft - (newWidth - startWidth)}px`
      panel.style.top = `${startTop - (newHeight - startHeight)}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: panel.offsetWidth, height: panel.offsetHeight }))
      setIsResizing(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const [isResizing, setIsResizing] = useState(false)

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
              'fixed bottom-2 right-2 z-[1] flex rounded-xl border border-neutral-200 bg-white shadow-[0_16px_70px_rgba(0,0,0,0.2)] dark:border-neutral-500 dark:bg-neutral-600',
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
              readOnlyConfig={readOnlyData?.org_config}
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
                  I'm your <span className="font-medium text-brand-500">DevOps AI Copilot</span> - I can help you to fix
                  your deployments, optimize your infrastructure costs, audit your security and do everything you would
                  expect from a complete DevOps Engineering team.
                  {isDevopsCopilotPanelFeatureFlag && !isCopilotEnabled && (
                    <span className="mt-4 block">
                      I'm not enabled yet,{' '}
                      <Link
                        to={`${SETTINGS_URL(context?.organization?.id)}${SETTINGS_AI_COPILOT_URL}`}
                        color="brand"
                        underline
                      >
                        configure me in your organization settings
                      </Link>{' '}
                      to get started.
                    </span>
                  )}
                </span>
              )}
              <ScrollArea
                ref={scrollAreaRef}
                className={twMerge(
                  clsx('relative flex grow flex-col gap-4 overflow-y-scroll p-4', {
                    'h-[220px]': !expand && thread.length > 0,
                    'h-[calc(100vh-316px)]': expand && thread.length > 0,
                  })
                )}
              >
                {thread.length === 0 && docLinks.length > 0 && expand && isCopilotEnabled && (
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 text-center">
                    <Icon
                      iconName="sparkles"
                      iconStyle="light"
                      className="mb-4 animate-[fadein_0.4s_ease-in-out_forwards_0.05s] text-[48px] text-brand-500 opacity-0"
                    />
                    <span className="animate-[fadein_0.4s_ease-in-out_forwards_0.22s] text-[11px] font-semibold text-neutral-400 opacity-0 dark:text-white">
                      Ask for a contextual suggestion:
                    </span>
                    <div className="flex max-w-[850px] animate-[fadein_0.4s_ease-in-out_forwards_0.15s] flex-wrap justify-center gap-3 opacity-0">
                      {docLinks.map(({ label, link }) => (
                        <Button
                          key={`${label}${link}`}
                          type="button"
                          variant="surface"
                          className="inline-flex max-w-max gap-2"
                          radius="full"
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
                {thread.map((message: Message) => {
                  return match(message.owner)
                    .with('user', () => (
                      <div
                        key={message.id}
                        className="ml-auto min-h-max max-w-[70%] overflow-hidden rounded-[1.5rem] bg-brand-50 px-5 py-2.5 text-sm dark:text-neutral-500"
                      >
                        <div className="whitespace-pre-wrap">{message.text}</div>
                      </div>
                    ))
                    .with('assistant', () => (
                      <AssistantMessage
                        key={message.id}
                        message={message}
                        plan={plan}
                        showPlans={showPlans}
                        setShowPlans={setShowPlans}
                        handleVote={handleVote}
                      />
                    ))
                    .exhaustive()
                })}
                {isLoading && streamingMessage.length === 0 && (
                  <div className="relative top-2 mt-auto">
                    <div
                      className="group flex cursor-pointer items-center gap-2"
                      onClick={() => setShowPlans((prev) => ({ ...prev, temp: !prev['temp'] }))}
                    >
                      <AnimatedGradientText className="w-fit text-ssm font-medium">{loadingText}</AnimatedGradientText>
                      {plan.filter((p) => p.messageId === 'temp').length > 0 && (
                        <Icon
                          iconName={showPlans['temp'] ? 'chevron-circle-up' : 'chevron-circle-down'}
                          iconStyle="regular"
                          className="transform transition-transform group-hover:scale-110"
                        />
                      )}
                    </div>
                    {showPlans['temp'] && plan.filter((p) => p.messageId === 'temp').length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {plan
                          .filter((p) => p.messageId === 'temp')
                          .map((step, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Icon iconName={getIconName(step.status)} className={getIconClass(step.status)} />
                              <div className="flex flex-col">
                                <span className={clsx({ 'text-neutral-400': step.status === 'completed' })}>
                                  {step.description}
                                </span>
                                <span className="text-2xs text-neutral-400">{step.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
                {isLoading && streamingMessage.length > 0 && pendingThreadId.current === threadId && (
                  <StreamingMessage
                    displayedStreamingMessage={displayedStreamingMessage}
                    plan={plan}
                    showPlans={showPlans}
                    setShowPlans={setShowPlans}
                    renderStreamingMessageWithMermaid={renderStreamingMessageWithMermaid}
                  />
                )}
                <div className="sticky bottom-0 left-full z-10 ml-[-40px] w-fit">
                  {!isAtBottom && (
                    <Button
                      onClick={() => {
                        const node = scrollAreaRef.current
                        if (node) {
                          node.scrollTo({
                            top: node.scrollHeight,
                            behavior: 'smooth',
                          })
                        }
                      }}
                      className="m-2 flex aspect-square items-center justify-center rounded-full"
                    >
                      <Icon iconName="arrow-down" iconStyle="light" />
                    </Button>
                  )}
                </div>
              </ScrollArea>
              <div
                className={clsx('relative mt-auto flex flex-col gap-2 px-4 pb-4', {
                  'shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.05)]': thread.length > 0,
                })}
              >
                {thread.length === 0 && docLinks.length > 0 && !expand && (
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
                    <div className="absolute top-2.5 flex w-full rounded-t-xl border border-neutral-250 bg-neutral-100 pb-4 pl-2 pr-4 pt-2 text-xs text-neutral-400 dark:border-neutral-500 dark:bg-neutral-700 dark:text-neutral-250">
                      <Tooltip content="Your message uses this current context" classNameContent="z-[1]">
                        <span className="flex items-center gap-2">
                          <Icon iconName="plug" iconStyle="regular" />
                          <span>
                            {upperCaseFirstLetter(String(current?.type))}:{' '}
                            <span className="font-medium">{String(current?.name ?? 'No context')}</span>
                          </span>
                        </span>
                      </Tooltip>
                      <Button
                        type="button"
                        variant="plain"
                        className="absolute right-2 top-0.5 text-neutral-500 dark:text-white"
                        onClick={() => setWithContext(false)}
                      >
                        <Icon iconName="xmark" />
                      </Button>
                    </div>
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
                <div className="flex w-full items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs text-neutral-350 dark:text-neutral-250">
                    <span>{isReadOnly ? 'Read-only mode' : 'Read-write mode'}</span>
                    <Tooltip
                      content={isReadOnly ? 'Your Copilot can’t make any changes' : 'It can perform actions'}
                      classNameContent="z-10"
                    >
                      <button type="button">
                        <Icon iconName="circle-info" className="text-neutral-350 dark:text-neutral-250" />
                      </button>
                    </Tooltip>
                  </div>
                  {appStatus && appStatus.status ? (
                    <a
                      className="inline-flex max-w-max animate-[fadein_0.22s_ease-in-out_forwards_0.20s] items-center gap-2 text-xs text-neutral-350 opacity-0 transition hover:text-neutral-600 dark:text-neutral-250"
                      href={QOVERY_STATUS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        {match(appStatus)
                          .with({ status: 'OPERATIONAL' }, () => 'All systems operational')
                          .with({ status: 'MAJOROUTAGE' }, () => 'Major outage ongoing')
                          .with({ status: 'MINOROUTAGE' }, () => 'Minor outage ongoing')
                          .with({ status: 'PARTIALOUTAGE' }, () => 'Partial outage ongoing')
                          .exhaustive()}
                      </span>
                      <DotStatus
                        color={match(appStatus)
                          .with({ status: 'OPERATIONAL' }, () => 'green' as const)
                          .with({ status: 'MAJOROUTAGE' }, () => 'red' as const)
                          .with({ status: 'MINOROUTAGE' }, () => 'yellow' as const)
                          .with({ status: 'PARTIALOUTAGE' }, () => 'yellow' as const)
                          .exhaustive()}
                      />
                    </a>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
