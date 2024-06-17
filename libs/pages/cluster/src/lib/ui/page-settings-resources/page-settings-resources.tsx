import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterResourcesSettingsFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading } = props
  const { formState } = useFormContext()
  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Resources settings" />
        <form onSubmit={onSubmit}>
          <ClusterResourcesSettingsFeature
            cloudProvider={props.cloudProvider}
            clusterRegion={props.clusterRegion}
            fromDetail
          />
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

export default PageSettingsResources
