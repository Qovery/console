import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterCredentialsSettingsFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Button, Section } from '@qovery/shared/ui'

export interface PageSettingsCredentialsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  loading?: boolean
}

export function PageSettingsCredentials(props: PageSettingsCredentialsProps) {
  const { onSubmit, loading, cloudProvider } = props
  const { formState } = useFormContext()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Credentials" />
        <form onSubmit={onSubmit}>
          <BlockContent title="Configured credentials">
            <ClusterCredentialsSettingsFeature cloudProvider={cloudProvider} />
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
