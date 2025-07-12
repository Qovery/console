import { useAuth0 } from '@auth0/auth0-react'
import * as Dialog from '@radix-ui/react-dialog'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import mermaid from 'mermaid'
import { type ComponentProps, forwardRef, useEffect, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import { AnimatedGradientText, Button, DropdownMenu, Icon, LoaderSpinner, Tooltip } from '@qovery/shared/ui'
import { ToastEnum, toast } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL, QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import { RenderMarkdown } from '../devops-render-markdown/devops-render-markdown'
import { normalizeMermaid } from '../devops-render-markdown/devops-render-markdown'
import { DotStatus } from '../dot-status/dot-status'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryContext } from '../hooks/use-qovery-context/use-qovery-context'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'
import { useThreadState } from '../hooks/use-thread-state/use-thread-state'
import { useThreads } from '../hooks/use-threads/use-threads'
import { MermaidChart } from '../mermaid-chart/mermaid-chart'
import { getIconClass, getIconName } from '../utils/icon-utils/icon-utils'
import DevopsCopilotHistory from './devops-copilot-history'
import { submitMessage } from './submit-message'
import { submitVote } from './submit-vote'

interface InputProps extends ComponentProps<'textarea'> {
  loading: boolean
  onClick?: () => void
  stop?: () => void
}

const Input = forwardRef<HTMLTextAreaElement, InputProps>(({ onClick, stop, loading, ...props }, ref) => {
  const [isFocus, setIsFocus] = useState(false)

  return (
    <div
      className={twMerge(
        clsx(
          'relative z-[1] flex rounded-xl border border-neutral-250 bg-white dark:border-neutral-500 dark:bg-neutral-550',
          {
            'border-brand-500 outline outline-[3px] outline-brand-100 dark:outline-1 dark:outline-brand-500': isFocus,
          }
        )
      )}
    >
      <textarea
        ref={ref}
        placeholder="Ask Qovery Copilot"
        autoFocus
        className="min-h-12 w-full resize-none rounded-xl px-4 py-[13px] text-sm leading-[22px] text-neutral-400 transition-[height] placeholder:text-neutral-350 focus-visible:outline-none dark:border-neutral-350 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-250"
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        {...props}
      />
      <div className="flex items-end justify-end p-2">
        <Tooltip content={loading ? 'Stop generation' : 'Send now'} delayDuration={400} classNameContent="z-10">
          <Button
            type="button"
            variant="surface"
            radius="full"
            className="group relative bottom-0.5 h-7 w-7 min-w-7 justify-center text-neutral-500 transition-colors dark:text-white"
            onClick={() => {
              if (loading) {
                stop?.()
              } else {
                onClick?.()
              }
            }}
          >
            {!loading ? (
              <Icon iconName="arrow-up" className={loading ? 'opacity-0' : ''} />
            ) : (
              <>
                <LoaderSpinner className="absolute left-0 right-0 m-auto group-hover:opacity-0" theme="dark" />
                <Icon
                  className="absolute left-0 right-0 m-auto opacity-0 group-hover:opacity-100"
                  iconName="stop"
                  iconStyle="light"
                />
              </>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
})

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
  style?: React.CSSProperties
}

const renderStreamingMessageWithMermaid = (input: string) => {
  const parts = []
  let lastIndex = 0
  const regex = /\[start mermaid block\]([\s\S]*?)\[end mermaid block\]/g
  let match

  while ((match = regex.exec(input)) !== null) {
    const start = match.index
    const end = regex.lastIndex
    const mermaidCode = match[1].trim()

    if (start > lastIndex) {
      const textPart = input.slice(lastIndex, start)
      if (textPart) {
        parts.push(<RenderMarkdown key={'md-' + lastIndex}>{normalizeMermaid(textPart)}</RenderMarkdown>)
      }
    }
    parts.push(<MermaidChart key={'mermaid-' + start} code={mermaidCode} />)
    lastIndex = end
  }

  if (lastIndex < input.length) {
    const textPart = input.slice(lastIndex)
    if (textPart) {
      parts.push(<RenderMarkdown key={'md-' + lastIndex}>{normalizeMermaid(textPart)}</RenderMarkdown>)
    }
  }
  return parts
}

export function DevopsCopilotPanel({ onClose, style }: DevopsCopilotPanelProps) {
  const controllerRef = useRef<AbortController | null>(null)
  const STORAGE_KEY = 'assistant-panel-size'
  const { data } = useQoveryStatus()
  const docLinks = useContextualDocLinks()
  const { context, current } = useQoveryContext()
  const { user, getAccessTokenSilently } = useAuth0()

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

  const [plan, setPlan] = useState<
    {
      messageId: string
      description: string
      toolName: string
      status: 'not_started' | 'in_progress' | 'completed' | 'waiting' | 'error'
    }[]
  >([])
  const [showPlans, setShowPlans] = useState<Record<string, boolean>>({})

  const pendingThreadId = useRef<string>()

  const {
    threads = [],
    error: errorThreads,
    isLoading: isLoadingThreads,
  } = useThreads({ organizationId: context?.organization?.id ?? '', owner: user?.sub ?? '' })

  const { thread, setThread } = useThreadState({
    organizationId: context?.organization?.id ?? '',
    threadId,
  })

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  const handleOnClose = () => {
    onClose()
    setInputMessage('')
  }

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'

    if (thread.length > 0) return

    if (element.scrollHeight < 240) {
      element.style.height = `${element.scrollHeight}px`
    } else {
      element.style.height = '240px'
    }
  }

  const hasMermaidChart = (messages: Message[], streamingText?: string) =>
    messages.some((msg) => msg.text.includes('[start mermaid block]')) ||
    (streamingText?.includes('[start mermaid block]') ?? false)

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
  }, [])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOnClose()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [thread])

  const handleVote = async (messageId: string, vote: 'upvote' | 'downvote') => {
    const currentMessage = thread.find((msg) => msg.id === messageId)
    const currentVote = currentMessage?.vote
    const nextVote = currentVote === vote ? undefined : vote

    const updatedThread = thread.map((msg) => (msg.id === messageId ? { ...msg, vote: nextVote } : msg))
    setThread(updatedThread)

    try {
      const response = await submitVote(
        user?.sub ?? '',
        messageId,
        vote,
        withContext ? context : { organization: context.organization }
      )

      if (!response) {
        const updatedThread = thread.map((msg) => (msg.id === messageId ? { ...msg, vote: currentVote } : msg))
        setThread(updatedThread)
      } else {
        if (nextVote) {
          toast(ToastEnum.SUCCESS, `Message successfully ${nextVote === 'upvote' ? 'upvoted' : 'downvoted'}`)
        }
      }
    } catch (error) {
      console.error('Erro r sending vote:', error)
      const updatedThread = thread.map((msg) => (msg.id === messageId ? { ...msg, vote: currentVote } : msg))
      setThread(updatedThread)
    }
  }

  const lastSubmitResult = useRef<{ id: string; messageId: string } | null>(null)
  const handleSendMessage = async (value?: string) => {
    controllerRef.current = new AbortController()
    lastSubmitResult.current = null
    const node = scrollAreaRef.current
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: 'smooth',
      })
    }
    setIsFinish(false)
    setStreamingMessage('')
    setDisplayedStreamingMessage('')
    setIsStopped(false)
    setLoadingText('Loading...')
    let fullContent = ''
    const trimmedInputMessage = typeof value === 'string' ? value.trim() : inputMessage.trim()

    if (trimmedInputMessage) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: trimmedInputMessage,
        owner: 'user',
        timestamp: Date.now(),
      }
      const updatedThread = [...thread, newMessage]
      setThread(updatedThread)

      setInputMessage('')
      setIsLoading(true)
      setStreamingMessage('')
      if (inputRef.current) {
        inputRef.current.style.height = 'initial'
      }

      try {
        const token = await getAccessTokenSilently()
        const response = await submitMessage(
          user?.sub ?? '',
          trimmedInputMessage,
          token,
          threadId,
          withContext ? context : { organization: context.organization },
          (chunk) => {
            try {
              const parsed = JSON.parse(chunk.replace(/^data: /, ''))
              if (parsed.type === 'start' && parsed.content.thread_id) {
                pendingThreadId.current = parsed.content.thread_id
                setThreadId(parsed.content.thread_id)
                return
              }
              if (parsed.type === 'chunk' && parsed.content) {
                if (parsed.content.includes('__plan__:')) {
                  try {
                    const planArray = JSON.parse(parsed.content.replace('__plan__:', ''))
                    setPlan((prev) => [
                      ...prev,
                      ...planArray.map((step: { description: string; tool_name: string }) => ({
                        messageId: 'temp',
                        description: step.description,
                        toolName: step.tool_name,
                        status: 'not_started',
                      })),
                    ])
                  } catch (e) {
                    console.error(e)
                  }
                } else if (parsed.content.includes('__step__:')) {
                  const stepDescription = parsed.content.replace('__step__:', '').replaceAll('_', ' ')
                  setLoadingText(stepDescription.charAt(0).toUpperCase() + stepDescription.slice(1))
                } else if (parsed.content.includes('__stepPlan__:')) {
                  try {
                    const stepObj = JSON.parse(parsed.content.replace('__stepPlan__:', ''))
                    const { description, status } = stepObj
                    setLoadingText(description.charAt(0).toUpperCase() + description.slice(1))
                    setPlan((prev) =>
                      prev.map((step) =>
                        step.description.toLowerCase().includes(description.toLowerCase()) ? { ...step, status } : step
                      )
                    )
                  } catch (e) {
                    console.error('Failed to parse stepPlan object', e)
                  }
                } else {
                  fullContent += parsed.content
                  setStreamingMessage(fullContent)
                }
              }
            } catch (error) {
              console.error('Erreur parsing chunk:', error)
            }
          },
          controllerRef.current.signal
        )
        lastSubmitResult.current = response
      } catch (error) {
        console.error('Error fetching response:', error)
      } finally {
        setIsFinish(true)
      }
    }
  }

  const currentThreadHistoryTitle = threads.find((t) => t.id === threadId)?.title ?? 'No title'

  const [isAtBottom, setIsAtBottom] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  const mermaidRenderCache = useRef<Map<string, JSX.Element>>(new Map())

  useEffect(() => {
    // Once the animation is finished, we can stop the loading and set the message
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
  }, [streamingMessage, displayedStreamingMessage, isStopped, isFinish])

  useEffect(() => {
    if (streamingMessage.length === 0 || streamingMessage.length <= displayedStreamingMessage.length) {
      return
    }
    let currentIndex = displayedStreamingMessage.length

    const typingInterval = setInterval(() => {
      const nextChar = streamingMessage[currentIndex]

      if (nextChar === undefined) {
        clearInterval(typingInterval)
        return
      }

      setDisplayedStreamingMessage((prev) => {
        if (!streamingMessage.startsWith(prev + nextChar)) {
          clearInterval(typingInterval)
          return streamingMessage
        }
        currentIndex++
        return prev + nextChar
      })
    }, 1)

    return () => clearInterval(typingInterval)
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
              organizationId={context?.organization?.id ?? ''}
            />
          )}
          <div className="flex h-full w-full flex-col justify-between">
            <div className="flex animate-[fadein_0.22s_ease-in-out_forwards] justify-between border-b border-neutral-200 py-2 pl-4 pr-2 opacity-0 dark:border-neutral-500">
              <div className="flex items-center font-bold">
                <span className="text-sm text-neutral-500 dark:text-white">
                  {!threadId || threads.length === 0
                    ? 'New conversation'
                    : currentThreadHistoryTitle.length >= 45
                      ? currentThreadHistoryTitle + '...'
                      : currentThreadHistoryTitle}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <span>
                      <Tooltip content="Options" delayDuration={400} classNameContent="z-10">
                        <Button type="button" variant="plain" className="text-neutral-500 dark:text-white">
                          <Icon iconName="ellipsis" />
                        </Button>
                      </Tooltip>
                    </span>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content className="z-10 mr-10">
                    <DropdownMenu.Item asChild>
                      <button
                        className="flex h-11 w-full items-center gap-2 text-sm"
                        type="button"
                        onClick={() => {
                          controllerRef.current?.abort()
                          setThread([])
                          setThreadId(undefined)
                          setIsLoading(false)
                          setPlan([])
                        }}
                      >
                        <span className="w-4">
                          <Icon iconName="pen-to-square" className="text-brand-500" />
                        </span>
                        <span>New chat</span>
                      </button>
                    </DropdownMenu.Item>
                    {!expand && (
                      <DropdownMenu.Item asChild>
                        <button
                          className="flex h-11 w-full items-center gap-2 text-sm"
                          type="button"
                          onClick={() => setExpand(true)}
                        >
                          <span className="w-4">
                            <Icon iconName="file-archive" className="text-brand-500" />
                          </span>
                          <span>Show history</span>
                        </button>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item asChild>
                      <a
                        className="flex h-11 w-full items-center gap-2 text-sm"
                        href={QOVERY_FORUM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="w-4">
                          <Icon iconName="user-group" className="text-brand-500" />
                        </span>
                        <span>Community forum</span>
                      </a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a
                        className="flex h-11 w-full items-center gap-2 text-sm"
                        href={QOVERY_FEEDBACK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="w-4">
                          <Icon iconName="comment-lines" className="text-brand-500" />
                        </span>
                        <span>Feedback</span>
                      </a>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                <div className="mx-1 h-5 w-[1px] bg-neutral-200 dark:bg-neutral-500"></div>
                <Tooltip
                  content={expand ? 'Collapse modal' : 'Take conversation to immersive'}
                  delayDuration={400}
                  classNameContent="z-10"
                >
                  <Button
                    type="button"
                    variant="plain"
                    className="text-neutral-500 dark:text-white"
                    onClick={() => setExpand(!expand)}
                  >
                    <Icon iconName={expand ? 'compress' : 'expand'} />
                  </Button>
                </Tooltip>
                <Tooltip content="Close" delayDuration={400} classNameContent="z-10">
                  <Button
                    type="button"
                    variant="plain"
                    onClick={handleOnClose}
                    className="text-neutral-500 dark:text-white"
                  >
                    <Icon iconName="xmark" />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="flex grow flex-col">
              {thread.length === 0 && (
                <span className="mx-auto w-full max-w-[430px] animate-[fadein_0.22s_ease-in-out_forwards_0.05s] py-4 text-center text-ssm opacity-0">
                  I'm your <span className="font-medium text-brand-500">DevOps AI Copilot</span> - I can help you to fix
                  your deployments, optimize your infrastructure costs, audit your security and do everything you would
                  expect from a complete DevOps Engineering team.
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
                {thread.length === 0 && docLinks.length > 0 && expand && (
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
                {thread.map((thread) => {
                  return match(thread.owner)
                    .with('user', () => (
                      <div
                        key={thread.id}
                        className="ml-auto min-h-max max-w-[70%] overflow-hidden rounded-[1.5rem] bg-brand-50 px-5 py-2.5 text-sm dark:text-neutral-500"
                      >
                        <div className="whitespace-pre-wrap">{thread.text}</div>
                      </div>
                    ))
                    .with('assistant', () => (
                      <div key={thread.id} className="group text-sm">
                        {plan.filter((p) => p.messageId === thread.id).length > 0 && (
                          <div
                            className="plan-toggle group mt-2 flex cursor-pointer items-center gap-2"
                            onClick={() => setShowPlans((prev) => ({ ...prev, [thread.id]: !prev[thread.id] }))}
                          >
                            <div className="w-fit text-ssm font-medium italic text-gray-600">Plan steps</div>
                            <div className="">
                              <Icon
                                iconName={showPlans[thread.id] ? 'chevron-circle-up' : 'chevron-circle-down'}
                                iconStyle="regular"
                                className="transform transition-transform group-hover:scale-110"
                              />
                            </div>
                          </div>
                        )}
                        {plan.filter((p) => p.messageId === thread.id).length > 0 && showPlans[thread.id] && (
                          <div className="mt-2 flex flex-col gap-2">
                            {plan
                              .filter((p) => p.messageId === thread.id)
                              .map((step, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <Icon iconName={getIconName(step.status)} className={getIconClass(step.status)} />
                                  <div className="flex flex-col">
                                    <span className={step.status === 'completed' ? 'text-neutral-400' : ''}>
                                      {step.description}
                                    </span>
                                    <span className="text-2xs text-neutral-400">{step.status.replace('_', ' ')}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        {(() => {
                          if (!mermaidRenderCache.current.has(thread.id)) {
                            const { RenderMarkdown, normalizeMermaid } = require('../devops-render-markdown/devops-render-markdown')
                            mermaidRenderCache.current.set(
                              thread.id,
                              <RenderMarkdown>{normalizeMermaid(thread.text)}</RenderMarkdown>
                            )
                          }
                          return mermaidRenderCache.current.get(thread.id)
                        })()}                        <div className="invisible mt-2 flex gap-2 text-xs text-neutral-400 group-hover:visible">
                          <Button
                            type="button"
                            variant="surface"
                            className={clsx('flex items-center gap-1 px-2 py-1', {
                              'text-brand-500': thread.vote === 'upvote',
                            })}
                            onClick={() => handleVote(thread.id, 'upvote')}
                          >
                            <Icon iconName="thumbs-up" />
                          </Button>
                          <Button
                            type="button"
                            variant="surface"
                            className={clsx('flex items-center gap-1 px-2 py-1', {
                              'text-brand-500': thread.vote === 'downvote',
                            })}
                            onClick={() => handleVote(thread.id, 'downvote')}
                          >
                            <Icon iconName="thumbs-down" />
                          </Button>
                        </div>
                      </div>
                    ))
                    .exhaustive()
                })}
                {isLoading && streamingMessage.length === 0 && (
                  <div className="relative top-2 mt-auto">
                    <div
                      className="group flex cursor-pointer items-center gap-2"
                      onClick={() => setShowPlans((prev) => ({ ...prev, ['temp']: !prev['temp'] }))}
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
                {isLoading && streamingMessage.length > 0 && (
                  <div className="streaming text-sm">
                    {plan.filter((p) => p.messageId === 'temp').length > 0 && (
                      <div
                        className="plan-toggle group mt-2 flex cursor-pointer items-center gap-2"
                        onClick={() => setShowPlans((prev) => ({ ...prev, ['temp']: !prev['temp'] }))}
                      >
                        <div className="w-fit text-ssm font-medium italic text-gray-600">Plan steps</div>
                        <Icon
                          iconName={
                            showPlans['temp'] !== undefined && showPlans['temp']
                              ? 'chevron-circle-up'
                              : 'chevron-circle-down'
                          }
                          iconStyle="regular"
                          className="transform transition-transform group-hover:scale-110"
                        />
                      </div>
                    )}
                    {plan.filter((p) => p.messageId === 'temp').length > 0 &&
                      showPlans['temp'] !== undefined &&
                      showPlans['temp'] && (
                        <div className="mt-2 flex flex-col gap-2">
                          {plan
                            .filter((p) => p.messageId === 'temp')
                            .map((step, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <Icon iconName={getIconName(step.status)} className={getIconClass(step.status)} />
                                <div className="flex flex-col">
                                  <span className={step.status === 'completed' ? 'text-neutral-400' : ''}>
                                    {step.description}
                                  </span>
                                  <span className="text-2xs text-neutral-400">{step.status.replace('_', ' ')}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    {(() => {
                      const input = displayedStreamingMessage
                      const startMatches = [...input.matchAll(/\[start mermaid block\]/g)]
                      const endMatches = [...input.matchAll(/\[end mermaid block\]/g)]
                      let renderInput = input
                      if (startMatches.length > endMatches.length) {
                        const lastStart = startMatches.at(-1)
                        if (lastStart) {
                          const cutoffIndex = lastStart.index ?? input.length
                          renderInput = input.slice(0, cutoffIndex) + 'Generating charts…'
                        }
                      }
                      return renderStreamingMessageWithMermaid(renderInput)
                    })()}
                  </div>
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
                {appStatus && appStatus.status ? (
                  <a
                    className="ml-auto inline-flex max-w-max animate-[fadein_0.22s_ease-in-out_forwards_0.20s] items-center gap-2 text-xs text-neutral-350 opacity-0 transition hover:text-neutral-600 dark:text-neutral-250"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
