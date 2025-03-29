import { type Cluster } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { ClusterResourcesSettingsFeature, SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  cluster: Cluster
  loading?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function PageSettingsResources({ cluster, onSubmit, loading }: PageSettingsResourcesProps) {
  const { formState } = useFormContext()

  const hasAlreadyKarpenter = cluster.features?.some((f) => f.id === 'KARPENTER')

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Resources settings" />
        <form onSubmit={onSubmit}>
          <ClusterResourcesSettingsFeature
            cluster={cluster}
            cloudProvider={cluster.cloud_provider}
            clusterRegion={cluster.region}
            isProduction={cluster.production}
            hasAlreadyKarpenter={hasAlreadyKarpenter}
            fromDetail
          />
          <div className="mt-10 flex justify-end">
            {/* 
              Adding `hasAlreadyKarpenter` is an hotfix to avoid weird disabled button with all Karpenter fields
              TODO: This should be improved to handle the form validation in a cleaner way
              https://qovery.slack.com/archives/C02P2JB4SEM/p1743234920794219
            */}
            <Button
              data-testid="submit-button"
              type="submit"
              size="lg"
              loading={loading}
              disabled={hasAlreadyKarpenter && !formState.isValid}
            >
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsResources
