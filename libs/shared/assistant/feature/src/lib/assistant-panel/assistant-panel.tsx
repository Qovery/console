import { useAuth0 } from '@auth0/auth0-react'
import * as Dialog from '@radix-ui/react-dialog'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import { type ComponentProps, forwardRef, useContext, useEffect, useRef, useState } from 'react'
import React from 'react'
import Markdown from 'react-markdown'
import { useMatch, useParams } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import remarkGfm from 'remark-gfm'
import { match } from 'ts-pattern'
import { useCluster } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { AnimatedGradientText, Button, DropdownMenu, Icon, Tooltip } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL, QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import AssistantContext from '../assistant-context/assistant-context'
import { DotStatus } from '../dot-status/dot-status'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'
import AssistantHistory from './assistant-history'
import { submitMessage } from './submit-message'
import { submitVote } from './submit-vote'
import { useThread } from './use-thread'
import { useThreads } from './use-threads'
import { toast, ToastEnum } from '@qovery/shared/ui'

interface InputProps extends ComponentProps<'textarea'> {
  loading: boolean
  onClick?: () => void
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
  node?: any
}

const Input = forwardRef<HTMLTextAreaElement, InputProps>(({ onClick, loading, ...props }, ref) => {
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
        className="w-full resize-none rounded-xl px-4 py-[13px] text-sm leading-[22px] text-neutral-400 transition-[height] placeholder:text-neutral-350 focus-visible:outline-none dark:border-neutral-350 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-250"
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        {...props}
      />
      <div className="flex items-end justify-end p-2">
        <Tooltip content="Send now" delayDuration={400} classNameContent="z-10">
          <Button
            type="button"
            variant="surface"
            radius="full"
            className="relative bottom-0.5 h-7 w-7 min-w-7 justify-center text-neutral-500 dark:text-white"
            onClick={onClick}
            loading={loading}
          >
            <Icon iconName="arrow-up" className={loading ? 'opacity-0' : ''} />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
})

const Loading = ({ loadingText }: { loadingText: string }) => {
  return (
    <AnimatedGradientText className="relative top-2 mt-auto w-fit text-ssm font-medium">
      {loadingText}
    </AnimatedGradientText>
  )
}

export type Message = {
  id: number
  text: string
  owner: 'user' | 'assistant'
  timestamp: number
  vote?: 'upvote' | 'downvote'
}

export type Thread = Message[]

export interface AssistantPanelProps {
  onClose: () => void
  smaller?: boolean
  style?: React.CSSProperties
}

function useQoveryContext() {
  const { organizationId, clusterId, projectId, environmentId, databaseId, applicationId, serviceId } = useParams()

  const matchServiceLogs = useMatch({ path: ENVIRONMENT_LOGS_URL() + SERVICE_LOGS_URL(), end: false })?.params
  const matchDeploymentLogs = useMatch({
    path: ENVIRONMENT_LOGS_URL() + DEPLOYMENT_LOGS_VERSION_URL(),
    end: false,
  })?.params

  const _serviceId =
    applicationId || serviceId || databaseId || matchServiceLogs?.['serviceId'] || matchDeploymentLogs?.['serviceId']

  const { data: organization } = useOrganization({ organizationId })
  const { data: project } = useProject({ organizationId, projectId })
  const { data: environment } = useEnvironment({ environmentId })
  const { data: cluster } = useCluster({ organizationId, clusterId: clusterId ?? environment?.cluster_id })
  const { data: service } = useService({ environmentId, serviceId: _serviceId })

  const entityMap = [
    [service, 'service'],
    [environment, 'environment'],
    [project, 'project'],
    [cluster, 'cluster'],
    [organization, 'organization'],
  ]

  const current = entityMap.find(([entity]) => entity !== undefined)

  return {
    context: {
      organization,
      cluster,
      project,
      environment,
      service,
      deployment: service && {
        execution_id: matchDeploymentLogs?.['versionId'],
      },
    },
    current: current && typeof current[0] === 'object' ? { ...current[0], type: current[1] } : undefined,
  }
}

export function AssistantPanel({ onClose, style }: AssistantPanelProps) {
  const STORAGE_KEY = 'assistant-panel-size'
  const { message: inputExplainMessage, setMessage: setInputExplainMessage } = useContext(AssistantContext)
  const { data } = useQoveryStatus()
  const { showMessages: showIntercomMessenger } = useIntercom()
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
  const [isScrollFocus, setIsScrollFocus] = useState(false)
  const [isFinish, setIsFinish] = useState(false)
  const [loadingText, setLoadingText] = useState('Loading...')

  const pendingThreadId = useRef<string>()

  const {
    threads = [],
    error: errorThreads,
    isLoading: isLoadingThreads,
  } = useThreads(context?.organization?.id ?? '', threadId)
  const { thread, setThread } = useThread({
    organizationId: context?.organization?.id ?? '',
    threadId,
  })

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  const handleOnClose = () => {
    onClose()
    setInputMessage('')
    setInputExplainMessage('')
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

  useEffect(() => {
    if (inputExplainMessage.length > 0) {
      setInputMessage(inputExplainMessage)
      setTimeout(() => {
        if (inputRef.current) {
          adjustTextareaHeight(inputRef.current)
          inputRef.current.scrollTop = inputRef.current.scrollHeight
        }
      }, 50)
    }
  }, [inputExplainMessage])

  const isProgrammaticScroll = useRef(false)

  useEffect(() => {
    const node = scrollAreaRef.current
    if (!node) return

    const handleScroll = () => {
      if (isProgrammaticScroll.current) {

        isProgrammaticScroll.current = false
        return
      }

      const { scrollTop, clientHeight, scrollHeight } = node
      const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 2

      setIsScrollFocus(!isAtBottom)
    }

    node.addEventListener('scroll', handleScroll)
    return () => node.removeEventListener('scroll', handleScroll)
  }, [scrollAreaRef, scrollAreaRef.current])

  useEffect(() => {
    const node = scrollAreaRef.current
    if (!node || isScrollFocus) return

    isProgrammaticScroll.current = true
    node.scrollTo({
      top: node.scrollHeight,
      behavior: 'auto',
    })
  }, [thread, isScrollFocus, displayedStreamingMessage])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOnClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleVote = async (messageId: number, vote: 'upvote' | 'downvote') => {
    const currentMessage = thread.find((msg) => msg.id === messageId)
    const currentVote = currentMessage?.vote
    const nextVote = currentVote === vote ? undefined : vote

    const updatedThread = thread.map((msg) =>
      msg.id === messageId ? { ...msg, vote: nextVote } : msg
    )
    setThread(updatedThread)

    try {

      const token = await getAccessTokenSilently()
      const response = await submitVote(
        user?.sub ?? '',
        messageId,
        vote,
        token,
        withContext ? context : { organization: context.organization }
      )

      if (!response) {
        const updatedThread = thread.map((msg) =>
          msg.id === messageId ? { ...msg, vote: currentVote } : msg
        )
        setThread(updatedThread)
      } else {
        console.log(nextVote);

        if (nextVote) {
          toast(ToastEnum.SUCCESS, `Message successfully ${nextVote === 'upvote' ? 'upvoted' : 'downvoted'}`)
        }
      }
    } catch (error) {
      console.error('Erro r sending vote:', error)
      const updatedThread = thread.map((msg) =>
        msg.id === messageId ? { ...msg, vote: currentVote } : msg
      )
      setThread(updatedThread)
    }
  }

  const handleSendMessage = async (value?: string) => {
    setIsScrollFocus(false)
    setIsFinish(false)
    setStreamingMessage('')
    setDisplayedStreamingMessage('')
    setLoadingText("Loading...")
    let fullContent = ''
    const trimmedInputMessage = typeof value === 'string' ? value.trim() : inputMessage.trim()

    if (trimmedInputMessage) {
      const newMessage: Message = {
        id: Date.now(),
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
              if (parsed.type === 'chunk' && parsed.content) {
                if (parsed.content.includes('__step__:')) {
                  const step = parsed.content.replace('__step__:', '').replaceAll('_', ' ')
                  setLoadingText(step.charAt(0).toUpperCase() + step.slice(1))
                } else {
                  fullContent += parsed.content
                  setStreamingMessage(fullContent)
                }
              }
            } catch (error) {
              console.error('Erreur parsing chunk:', error)
            }
          }
        )

        if (response) {
          pendingThreadId.current = response.id
        }
      } catch (error) {
        console.error('Error fetching response:', error)
      } finally {
        setIsFinish(true)
      }
    }
  }

  useEffect(() => {
    if (isLoading && isFinish && displayedStreamingMessage.length >= streamingMessage.length) {
      setThread([
        ...thread,
        {
          id: Date.now() + 1,
          text: streamingMessage,
          owner: 'assistant',
          timestamp: Date.now(),
        },
      ])
      setThreadId(pendingThreadId.current)
      setIsLoading(false)
      setStreamingMessage('')
    }
    if (!streamingMessage || displayedStreamingMessage === streamingMessage) return

    let i = displayedStreamingMessage.length
    let interval: NodeJS.Timeout

    interval = setInterval(() => {

      setDisplayedStreamingMessage((prev) => {
        const nextChar = streamingMessage[i]
        i++
        return prev + nextChar
      })
    }, 5)

    return () => clearInterval(interval)
  }, [streamingMessage, displayedStreamingMessage])

  const currentThreadHistoryTitle = threads.find((t) => t.id === threadId)?.title ?? 'No title'

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    if (expand) {
      panel.style.width = 'calc(100vw - 32px)'
      panel.style.height = 'calc(100vh - 32px)'
      panel.style.top = '1rem'
      panel.style.left = '1rem'
    } else {
      const size = localStorage.getItem(STORAGE_KEY)
      if (size) {
        try {
          const { width, height } = JSON.parse(size)
          panel.style.width = `${width}px`
          panel.style.height = `${height}px`
          panel.style.bottom = '8px'
          panel.style.right = '8px'
          panel.style.top = ''
          panel.style.left = ''
        } catch (e) {
          console.error('Failed to apply panel size from localStorage', e)
        }
      } else {
        panel.style.top = ''
        panel.style.left = ''
        panel.style.bottom = '8px'
        panel.style.right = '8px'
        panel.style.width = `480px`
        panel.style.height = `600px`
      }
    }
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
      const newWidth = Math.max(startWidth + dx, 450)
      const newHeight = Math.max(startHeight + dy, 450)
      panel.style.width = `${newWidth}px`
      panel.style.height = `${newHeight}px`
      panel.style.left = `${startLeft - (newWidth - startWidth)}px`
      panel.style.top = `${startTop - (newHeight - startHeight)}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ width: panel.offsetWidth, height: panel.offsetHeight })
      )
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
                'border-2 border-brand-500': !expand && isResizing
              }
            )
          )}
          style={style}
        >
          {!expand && (
            <div
              className="absolute left-1 top-1 z-10 cursor-nw-resize p-1"
              onMouseDown={startResize}
            />
          )}
          {expand && (
            <AssistantHistory
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
                        onClick={() => setThreadId(undefined)}
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
                      <button
                        className="flex h-11 w-full items-center gap-2 text-sm"
                        type="button"
                        onClick={() => {
                          showIntercomMessenger()
                          handleOnClose()
                        }}
                      >
                        <span className="w-4">
                          <Icon iconName="robot" className="text-brand-500" />
                        </span>
                        <span>Contact support</span>
                      </button>
                    </DropdownMenu.Item>
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
                      <div key={thread.id} className="text-sm group">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="my-3 text-2xl font-bold" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="my-3 text-xl font-semibold" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="my-2 text-lg font-medium" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="my-2 text-base font-medium" {...props} />,
                            p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
                            ol: ({ node, ...props }) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
                            li: ({ node, ...props }) => <li className="my-1" {...props} />,
                            a: ({ node, ...props }) => (
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                                {...props}
                              />
                            ),
                            pre: ({ node, children, ...props }) => {
                              const codeContent = React.isValidElement(children)
                                ? (children.props as { children?: string })?.children
                                : null

                              return (
                                <div className="relative my-4">
                                  <pre
                                    className="w-full whitespace-pre-wrap rounded bg-neutral-100 p-4 font-code text-ssm dark:bg-neutral-800"
                                    {...props}
                                  >
                                    {children}
                                  </pre>
                                  {typeof codeContent === 'string' && (
                                    <Button
                                      variant={'surface'}
                                      className="absolute right-2 top-2"
                                      onClick={() => navigator.clipboard.writeText(codeContent)}
                                    >
                                      <Icon iconName="copy" />
                                    </Button>
                                  )}
                                </div>
                              )
                            },
                            code: ({ node, inline, className, children, ...props }: CodeProps) => {
                              const isInline = inline ?? false
                              return isInline ? (
                                <code
                                  className={`rounded px-1.5 py-0.5 font-mono text-sm dark:bg-gray-700 ${className || ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className={`my-2 block overflow-x-auto rounded-lg p-3 font-mono text-sm dark:bg-gray-800 ${className || ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            },
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="my-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-600"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {thread.text}
                        </Markdown>
                        <div className="mt-2 flex gap-2 text-xs text-neutral-400 invisible group-hover:visible">
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
                            onClick={() => handleVote(thread.id, 'downvote')}>
                            <Icon iconName="thumbs-down" />
                          </Button>
                        </div>
                      </div>
                    ))
                    .exhaustive()
                })}
                {isLoading && streamingMessage.length === 0 && <Loading loadingText={loadingText} />}
                {isLoading && (
                  <div className="streaming text-sm">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h1 className="my-3 text-2xl font-bold" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="my-3 text-xl font-semibold" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="my-2 text-lg font-medium" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="my-2 text-base font-medium" {...props} />,
                        p: ({ node, ...props }) => <p className="my-3 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
                        ol: ({ node, ...props }) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
                        li: ({ node, ...props }) => <li className="my-1" {...props} />,
                        a: ({ node, ...props }) => (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                            {...props}
                          />
                        ),
                        pre: ({ node, children, ...props }) => {
                          const codeContent = React.isValidElement(children)
                            ? (children.props as { children?: string })?.children
                            : null

                          return (
                            <div className="relative my-4">
                              <pre
                                className="w-full whitespace-pre-wrap rounded bg-neutral-100 p-4 font-code text-ssm dark:bg-neutral-800"
                                {...props}
                              >
                                {children}
                              </pre>
                              {typeof codeContent === 'string' && (
                                <Button
                                  variant={'surface'}
                                  className="absolute right-2 top-2"
                                  onClick={() => navigator.clipboard.writeText(codeContent)}
                                >
                                  <Icon iconName="copy" />
                                </Button>
                              )}
                            </div>
                          )
                        },
                        code: ({ node, inline, className, children, ...props }: CodeProps) => {
                          const isInline = inline ?? false
                          return isInline ? (
                            <code
                              className={`rounded px-1.5 py-0.5 font-mono text-sm dark:bg-gray-700 ${className || ''}`}
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              className={`my-2 block overflow-x-auto rounded-lg p-3 font-mono text-sm dark:bg-gray-800 ${className || ''}`}
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="my-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-600"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {displayedStreamingMessage}
                    </Markdown>
                  </div>
                )}
                <div className="sticky bottom-0 left-full z-10 ml-[-40px] w-fit">
                  {isScrollFocus && (
                    <Button
                      onClick={() => setIsScrollFocus(false)}
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
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      } else {
                        if (inputRef.current) adjustTextareaHeight(inputRef.current)
                      }
                    }}
                    onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
                    loading={isLoading}
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