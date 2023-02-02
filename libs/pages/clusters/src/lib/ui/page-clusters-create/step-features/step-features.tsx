import { CloudProvider } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { BannerBox, Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepFeaturesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders: CloudProvider[]
}

export function StepFeatures(props: StepFeaturesProps) {
  const { onSubmit } = props
  const { formState } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">Features</h3>
        <p className="text-text-500 text-sm mb-2">Additional features available on your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <BannerBox
          className="mb-4"
          title="Choose wisely"
          message="These features will not be modifiable after cluster creation."
        />
        <div className="mb-10">
          <div>hello</div>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={() => navigate(CLUSTERS_URL(organizationId))}
            type="button"
            className="btn--no-min-w"
            size={ButtonSize.XLARGE}
            style={ButtonStyle.STROKED}
          >
            Cancel
          </Button>
          <Button
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonSize.XLARGE}
            style={ButtonStyle.BASIC}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepFeatures
