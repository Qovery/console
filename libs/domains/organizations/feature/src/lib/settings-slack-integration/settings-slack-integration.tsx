import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'
import { SlackInstallationList } from './slack-installation-list'

export function SettingsSlackIntegration() {
  useDocumentTitle('Slack integration - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const [hasInstallation, setHasInstallation] = useState(false)

  const addToSlack = () => {
    if (!SLACK_BOT_API_URL) return
    window.location.href = `${SLACK_BOT_API_URL}/slack/install-url?org_id=${organizationId}`
  }

  if (!SLACK_BOT_API_URL) {
    return (
      <div className="w-full">
        <Section className="px-8 pb-8 pt-6">
          <SettingsHeading
            title="Slack"
            description="Slack integration is not configured. Contact your administrator."
          />
        </Section>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Section className="px-8 pb-8 pt-6">
        <div className="relative">
          <SettingsHeading
            title="Slack"
            description="Get notified in Slack when deployments fail, detect failure loops, and know when environments recover."
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0" onClick={addToSlack}>
            <Icon iconName="slack" iconStyle="brands" />
            {hasInstallation ? 'Reconnect Slack' : 'Add to Slack'}
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <SlackInstallationList organizationId={organizationId} onInstallationsLoaded={setHasInstallation} />
        </div>
      </Section>
    </div>
  )
}
