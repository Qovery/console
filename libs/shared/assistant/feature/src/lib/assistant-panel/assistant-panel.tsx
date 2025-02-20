import { useAuth0 } from '@auth0/auth0-react'
import * as Dialog from '@radix-ui/react-dialog'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import { type ComponentProps, forwardRef, useContext, useEffect, useRef, useState } from 'react'
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
import { Button, DropdownMenu, Icon, Tooltip } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL, QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import AssistantContext from '../assistant-context/assistant-context'
import { DotStatus } from '../dot-status/dot-status'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'

interface InputProps extends ComponentProps<'textarea'> {
  loading: boolean
  onClick?: () => void
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
        className="w-full resize-none rounded-xl px-4 py-[13px] text-sm leading-[22px] text-neutral-400 placeholder:text-neutral-350 focus-visible:outline-none dark:border-neutral-350 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-250"
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

const apiCalls = async (message: string, token: string, context?: any): Promise<string> => {
  console.log(token)
  const title = message.substring(0, 12) + '...'
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return `
# Thank you for your message

Here's how I can help:

1. First, let's break down your question
2. Then, we'll explore possible solutions
3. Finally, we'll implement the best approach

## Key points to consider:

- Complexity of the task
- Available resources
- Time constraints

\`\`\`javascript
// Here's a simple example:
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

For more information, check out [our documentation](https://example.com).

How else can I assist you today?
`
}

type Message = {
  id: number
  text: string
  sender: 'user' | 'support'
  timestamp: number
}

export interface AssistantPanelProps {
  onClose: () => void
  smaller?: boolean
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

export function AssistantPanel({ onClose }: AssistantPanelProps) {
  const { message: explainMessage, setMessage: setExplainMessage } = useContext(AssistantContext)
  const { data } = useQoveryStatus()
  const { showMessages: showIntercomMessenger } = useIntercom()
  const docLinks = useContextualDocLinks()
  const { context, current } = useQoveryContext()
  const { getAccessTokenSilently } = useAuth0()

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [expand, setExpand] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [withContext, setWithContext] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  const handleOnClose = () => {
    onClose()
    setInputMessage('')
    setExplainMessage('')
  }

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    if (element.scrollHeight < 240) {
      element.style.height = `${element.scrollHeight}px`
    } else {
      element.style.height = '240px'
    }
  }

  useEffect(() => {
    if (explainMessage.length > 0) {
      setInputMessage('Explain this message from my logs:\n' + explainMessage)
      setTimeout(() => {
        if (inputRef.current) {
          adjustTextareaHeight(inputRef.current)
          inputRef.current.scrollTop = inputRef.current.scrollHeight
        }
      }, 50)
    }
  }, [explainMessage])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOnClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSendMessage = async () => {
    const trimmedInputMessage = inputMessage.trim()

    if (trimmedInputMessage) {
      const newMessage: Message = {
        id: Date.now(),
        text: trimmedInputMessage,
        sender: 'user',
        timestamp: Date.now(),
      }
      const updatedMessages = [...messages, newMessage]
      setMessages(updatedMessages)

      setInputMessage('')
      setIsLoading(true)
      setTimeout(() => {
        if (inputRef.current) {
          adjustTextareaHeight(inputRef.current)
        }
      }, 50)
      try {
        const token = await getAccessTokenSilently()
        const apiResponse = await apiCalls(trimmedInputMessage, token, withContext ? context : null)
        const supportMessage: Message = {
          id: Date.now(),
          text: apiResponse,
          sender: 'support',
          timestamp: Date.now(),
        }
        const updatedMessagesWithSupport = [...updatedMessages, supportMessage]
        setMessages(updatedMessagesWithSupport)
      } catch (error) {
        console.error('Error fetching response:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

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
            className="absolute left-0 top-0 z-0 h-screen w-screen bg-black/50 backdrop-blur-[2px]"
            onClick={handleOnClose}
          />
        )}
        <Dialog.Content
          className={twMerge(
            clsx(
              'fixed bottom-2 right-2 z-[1] flex h-[600px] w-[480px] max-w-[480px] animate-slidein-up-sm-faded flex-col rounded-xl border border-neutral-200 bg-white shadow-[0_16px_70px_rgba(0,0,0,0.2)] dark:border-neutral-500 dark:bg-neutral-600',
              {
                'left-4 top-4 h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[calc(100vw-32px)]': expand,
              }
            )
          )}
        >
          <div className="flex justify-between border-b border-neutral-200 py-2 pl-4 pr-2 dark:border-neutral-500">
            <div className="flex items-center font-bold">
              <span className="text-sm text-neutral-500 dark:text-white">New conversation</span>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <span>
                    <Tooltip content="Options" delayDuration={400}>
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
              <Tooltip content="Take conversation to immersive" delayDuration={400} classNameContent="z-10">
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
            {messages.length === 0 && (
              <span className="w-full py-4 text-center text-xs">Find everything you need with AI Copilot.</span>
            )}
            <ScrollArea
              ref={scrollAreaRef}
              className={twMerge(
                clsx('relative flex grow flex-col gap-4 overflow-y-scroll p-4', {
                  'h-[420px]': !expand && messages.length > 0,
                  'h-[calc(100vh-316px)]': expand && messages.length > 0,
                })
              )}
            >
              {messages.map((message) => {
                return match(message.sender)
                  .with('user', () => (
                    <div className="ml-auto min-h-max max-w-[70%] overflow-hidden rounded-[1.5rem] bg-brand-50 px-5 py-2.5 text-sm dark:text-neutral-500">
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>
                  ))
                  .with('support', () => (
                    <div className="text-sm">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="mb-2 text-lg font-bold" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="mb-2 text-base font-semibold" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-4" {...props} />,
                          ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-4" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          a: ({ node, ...props }) => <a className="text-sky-500 hover:underline" {...props} />,
                          code: ({ node, inline, ...props }: { inline?: boolean; [key: string]: any }) =>
                            inline ? (
                              <code className="rounded bg-gray-200 px-1 dark:bg-gray-800" {...props} />
                            ) : (
                              <code
                                className="mb-2 block overflow-x-auto rounded bg-gray-200 p-2 dark:bg-gray-800"
                                {...props}
                              />
                            ),
                        }}
                      >
                        {message.text}
                      </Markdown>
                    </div>
                  ))
                  .exhaustive()
              })}
            </ScrollArea>
            <div
              className={clsx('relative mt-auto flex flex-col gap-2 px-4 pb-4', {
                'shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.05)]': messages.length > 0,
              })}
            >
              {messages.length === 0 && docLinks.length > 0 && (
                <div className="flex flex-col gap-2">
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
                          handleSendMessage()
                        }}
                      >
                        <Icon iconName="arrow-right" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="relative pt-[42px]">
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
                    }
                  }}
                  onInput={(e) => adjustTextareaHeight(e.target as HTMLTextAreaElement)}
                  loading={isLoading}
                />
              </div>
              {appStatus && appStatus.status ? (
                <a
                  className="ml-auto inline-flex max-w-max animate-fadein items-center gap-2 text-xs text-neutral-350 transition hover:text-neutral-600 dark:text-neutral-250"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AssistantPanel
