import { Link, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { Suspense, useCallback } from 'react'
import { SpotlightTrigger } from '@qovery/pages/layout'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { DevopsCopilotButton } from '@qovery/shared/devops-copilot/feature'
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

export function Header({ assistantPanelTopOffset }: { assistantPanelTopOffset?: number }) {
  const { organizationId = '' } = useParams({ strict: false })
  const isDevopsCopilotEnabled = useFeatureFlagVariantKey('devops-copilot')
  const handleFeedbackClick = useCallback(() => {
    posthog.capture('feedback_button_clicked_new_navigation')
  }, [])

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
              <Button onClick={handleFeedbackClick} variant="outline">
                Feedback
              </Button>
              <AssistantTrigger panelTopOffset={assistantPanelTopOffset} />
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
