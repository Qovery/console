import { type CloudProviderEnum } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterResourcesSettingsFeature } from '@qovery/shared/console-shared'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { ButtonLegacy, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProvider?: CloudProviderEnum
  clusterRegion?: string
}

export function StepResources(props: StepResourcesProps) {
  const { formState } = useFormContext<ApplicationGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">Set resources</h3>
      </div>

      <form onSubmit={props.onSubmit}>
        <ClusterResourcesSettingsFeature
          cloudProvider={props.cloudProvider}
          clusterRegion={props.clusterRegion}
          fromDetail={false}
        />

        <div className="flex justify-between">
          <ButtonLegacy
            onClick={() =>
              navigate(`${CLUSTERS_URL(organizationId)}${CLUSTERS_CREATION_URL}${CLUSTERS_CREATION_GENERAL_URL}`)
            }
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </div>
  )
}

export default StepResources
