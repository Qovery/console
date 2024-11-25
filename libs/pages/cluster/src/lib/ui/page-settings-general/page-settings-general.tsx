import { type Cluster } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterGeneralSettings, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Callout, ExternalLink, Icon, Section } from '@qovery/shared/ui'

export interface PageSettingsGeneralProps {
  cluster: Cluster
  onSubmit: FormEventHandler<HTMLFormElement>
  loading?: boolean
}

export function PageSettingsGeneral({ onSubmit, loading, cluster }: PageSettingsGeneralProps) {
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="General settings" />
        {cluster.cloud_provider !== 'ON_PREMISE' && (
          <Callout.Root color="sky" className="mb-4">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Qovery manages this resource for you</Callout.TextHeading>
              <Callout.TextDescription>
                Use exclusively the Qovery console to update the resources managed by Qovery on your cloud account.
                <br /> Do not manually update or upgrade them on the cloud provider console, otherwise you will risk a
                drift in the configuration.
                <br />
                <ExternalLink
                  size="sm"
                  href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#how-does-qovery-handle-cluster-updates-and-upgrades"
                >
                  Click here for more details
                </ExternalLink>
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
        )}
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
