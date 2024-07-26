import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterGeneralSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Callout, ExternalLink, Icon, Section } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

export function PageSettingsGeneral(props: PageSettingsGeneralProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General settings" />
        <Callout.Root color="sky" className="mb-4">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="light" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
            <Callout.TextDescription className="text-xs">
              Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
              <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
              drift in the configuration.
              <br />
              <ExternalLink
                href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#how-does-qovery-handle-cluster-updates-and-upgrades"
                size="xs"
              >
                Click here for more details
              </ExternalLink>
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <ClusterGeneralSettings fromDetail />
          </BlockContent>
          <div className="flex justify-end">
            <Button data-testid="submit-button" type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsGeneral
