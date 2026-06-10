import { Link, useParams } from '@tanstack/react-router'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { Suspense, useCallback } from 'react'
import { AssistantTrigger, useConversationsUnreadCount, useSetConversationsOpen } from '@qovery/shared/assistant/feature'
import { DevopsCopilotButton } from '@qovery/shared/devops-copilot/feature'
import { SpotlightTrigger } from '@qovery/shared/spotlight/feature'
import { Button, LogoIcon } from '@qovery/shared/ui'
import { Breadcrumbs } from './breadcrumbs/breadcrumbs'
import { UserMenu } from './user-menu/user-menu'

export function Separator() {
  return (
    <div className="text-surface-neutral-componentActive">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" fill="none" viewBox="0 0 14 15">
        <path
          fill="currentColor"
          d="M10.049.05a.656.656 0 0 1 .358.855l-5.6 13.6a.656.656 0 0 1-1.213-.498l5.6-13.6a.654.654 0 0 1 .855-.357"
        />
      </svg>
    </div>
  )
}

export function Header() {
  const { organizationId = '' } = useParams({ strict: false })
  const isDevopsCopilotEnabled = useFeatureFlagVariantKey('devops-copilot')
  const setConversationsOpen = useSetConversationsOpen()
  const unreadCount = useConversationsUnreadCount()
  const handleFeedbackClick = useCallback(() => {
    setConversationsOpen(true)
  }, [setConversationsOpen])

  return (
    <header className="relative z-header w-full bg-background-secondary py-4 pl-3 pr-4">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex shrink-0 items-center gap-4">
          <Link to="/organization/$organizationId/overview" params={{ organizationId }}>
            <LogoIcon />
          </Link>
          <Separator />
        </div>
        <Suspense fallback={<div className="h-8 flex-1" />}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <Breadcrumbs />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className="hidden md:block">
                <SpotlightTrigger />
              </div>
              <div className="relative">
                <Button onClick={handleFeedbackClick} variant="outline">
                  Feedback
                </Button>
                {unreadCount > 0 && (
                  <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-brand-solid px-1 text-[10px] font-medium text-neutralInvert">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <AssistantTrigger />
              {isDevopsCopilotEnabled && <DevopsCopilotButton />}
              <UserMenu />
            </div>
          </div>
        </Suspense>
      </div>
    </header>
  )
}

export default Header
