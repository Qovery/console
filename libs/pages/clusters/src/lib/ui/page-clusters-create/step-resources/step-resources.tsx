import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterResourcesSettingsFeature } from '@qovery/shared/console-shared'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, Heading, Section } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
  isProduction?: boolean
}

export function StepResources(props: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <Section>
      <div className="mb-10 flex flex-col gap-2">
        <Heading>Resources</Heading>
        <p className="text-sm text-neutral-350">
          Customize the resources allocated to the cluster. You can adjust cluster resources anytime later from the
          settings panel.
        </p>
      </div>

      <form onSubmit={props.onSubmit}>
        <ClusterResourcesSettingsFeature
          cloudProvider={props.cloudProvider}
          clusterRegion={props.clusterRegion}
          fromDetail={false}
          isProduction={props.isProduction}
        />

        <div className="mt-10 flex justify-between">
          <Button
            onClick={() =>
              navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_GENERAL_URL}`)
            }
            type="button"
            variant="plain"
            size="lg"
          >
            Back
          </Button>
          <Button data-testid="button-submit" type="submit" disabled={!formState.isValid} size="lg">
            Continue
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepResources
