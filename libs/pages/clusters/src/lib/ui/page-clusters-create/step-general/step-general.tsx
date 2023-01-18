import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { ApplicationGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, ButtonSize, ButtonStyle } from '@qovery/shared/ui'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepGeneral(props: StepGeneralProps) {
  const { formState } = useFormContext<ApplicationGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-text-700 text-lg mb-2">General informations</h3>
        <p className="text-text-500 text-sm mb-2">Provide here some general information for your cluster.</p>
      </div>

      <form onSubmit={props.onSubmit}>
        <ClusterGeneralSettings />
        {/* <div className="border-b border-b-element-light-lighter-400 mb-6"></div> */}

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

export default StepGeneral
