import { ScrollArea } from '@radix-ui/react-scroll-area'
import clsx from 'clsx'
import { type RefObject } from 'react'
import { match } from 'ts-pattern'
import { Button, Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { AssistantMessage } from '../assistant-message/assistant-message'
import { type Message, type PlanStep } from '../devops-copilot-panel'
import { EmptyState } from '../empty-state/empty-state'
import { LoadingIndicator } from '../loading-indicator/loading-indicator'
import { type renderStreamingMessageWithMermaid } from '../streaming-mermaid-renderer/streaming-mermaid-renderer'
import { StreamingMessage } from '../streaming-message/streaming-message'

export interface MessageListProps {
  scrollAreaRef: RefObject<HTMLDivElement>
  expand: boolean
  thread: Message[]
  docLinks: Array<{ label: string; link: string }>
  isCopilotEnabled: boolean
  onSuggestionClick: (label: string) => void
  isLoading: boolean
  streamingMessage: string
  displayedStreamingMessage: string
  loadingText: string
  plan: PlanStep[]
  showPlans: Record<string, boolean>
  setShowPlans: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  threadId?: string
  pendingThreadId?: string
  renderStreamingMessageWithMermaid: typeof renderStreamingMessageWithMermaid
  handleVote: (messageId: string, voteType: 'upvote' | 'downvote') => void
  isAtBottom: boolean
}

export function MessageList({
  scrollAreaRef,
  expand,
  thread,
  docLinks,
  isCopilotEnabled,
  onSuggestionClick,
  isLoading,
  streamingMessage,
  displayedStreamingMessage,
  loadingText,
  plan,
  showPlans,
  setShowPlans,
  threadId,
  pendingThreadId,
  renderStreamingMessageWithMermaid,
  handleVote,
  isAtBottom,
}: MessageListProps) {
  const handleScrollToBottom = () => {
    const node = scrollAreaRef.current
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={twMerge(
        clsx('relative flex grow flex-col gap-4 overflow-y-scroll p-4', {
          'h-[220px]': !expand && thread.length > 0,
          'h-[calc(100vh-316px)]': expand && thread.length > 0,
        })
      )}
    >
      <EmptyState
        docLinks={docLinks}
        expand={expand}
        onSuggestionClick={onSuggestionClick}
        threadLength={thread.length}
      />
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
        <LoadingIndicator
          loadingText={loadingText}
          plan={plan}
          showPlans={showPlans}
          onTogglePlans={(messageId) => setShowPlans((prev) => ({ ...prev, [messageId]: !prev[messageId] }))}
        />
      )}
      {isLoading && streamingMessage.length > 0 && pendingThreadId === threadId && (
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
            onClick={handleScrollToBottom}
            className="m-2 flex aspect-square items-center justify-center rounded-full"
          >
            <Icon iconName="arrow-down" iconStyle="light" />
          </Button>
        )}
      </div>
    </ScrollArea>
  )
}
