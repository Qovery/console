import { useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { SLACK_BOT_API_URL } from '@qovery/shared/util-node-env'
import { SlackInstallationList } from './slack-installation-list'

export function SettingsSlackIntegration() {
  useDocumentTitle('Slack integration - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })

  const addToSlack = () => {
    if (!SLACK_BOT_API_URL) return
    posthog.capture('slack-workspace-connect-clicked', { organization_id: organizationId })
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
        <SlackInstallationList organizationId={organizationId} onConnectSlack={addToSlack}>
          {(hasInstallation, onAddRule) => (
            <div className="relative">
              <SettingsHeading
                title="Slack"
                description="Get notified in Slack when deployments fail, detect failure loops, and know when environments recover."
              />
              {hasInstallation && (
                <Button className="absolute right-0 top-0" size="md" onClick={onAddRule}>
                  <Icon iconName="circle-plus" iconStyle="regular" />
                  Add rule
                </Button>
              )}
            </div>
          )}
        </SlackInstallationList>
      </Section>
    </div>
  )
}
