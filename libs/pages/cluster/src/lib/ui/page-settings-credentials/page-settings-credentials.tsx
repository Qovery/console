import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ClusterCredentialsSettingsFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { SETTINGS_CREDENTIALS_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { BlockContent, Button, Icon, Link, Section } from '@qovery/shared/ui'

export interface PageSettingsCredentialsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  loading?: boolean
}

export function PageSettingsCredentials(props: PageSettingsCredentialsProps) {
  const { organizationId = '' } = useParams()
  const { onSubmit, loading, cloudProvider } = props
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="Credentials"
          description={
            <Link
              color="current"
              to={`${SETTINGS_URL(organizationId)}${SETTINGS_CREDENTIALS_URL}`}
              className="flex gap-1 text-brand-500"
            >
              See all my cloud credentials
              <Icon iconName="key" iconStyle="regular" />
            </Link>
          }
        />
        <form onSubmit={onSubmit}>
          <BlockContent title="Configured credentials">
            <ClusterCredentialsSettingsFeature cloudProvider={cloudProvider} isSetting={true} />
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

export default PageSettingsCredentials
