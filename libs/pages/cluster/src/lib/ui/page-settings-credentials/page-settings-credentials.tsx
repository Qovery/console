import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterCredentialsSettingsFeature } from '@qovery/shared/console-shared'
import { BlockContent, Button, Heading, Section } from '@qovery/shared/ui'

export interface PageSettingsCredentialsProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  loading?: boolean
}

export function PageSettingsCredentials(props: PageSettingsCredentialsProps) {
  const { onSubmit, loading, cloudProvider } = props
  const { formState } = useFormContext()

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-8">Credentials</Heading>
        <form onSubmit={onSubmit}>
          <BlockContent title="Configured credentials">
            <ClusterCredentialsSettingsFeature cloudProvider={cloudProvider} />
          </BlockContent>
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsCredentials
