import { CloudProvider } from 'qovery-typescript-axios'
import { FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import {
  BannerBox,
  BannerBoxEnum,
  Button,
  ButtonSize,
  ButtonStyle,
  IconAwesomeEnum,
  InputToggle,
  Link,
} from '@qovery/shared/ui'

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
          type={BannerBoxEnum.WARNING}
        />
        <div className="mb-10">
          <div className="flex justify-between p-5 rounded border border-element-light-lighter-500 bg-element-light-lighter-200">
            <div className="flex pr-8">
              <InputToggle className="relative top-[2px]" small value={true} />
              <div>
                <h4 className="text-ssm text-text-600 mb-1 font-medium">Static IP</h4>
                <p className="text-xs text-text-400">
                  Your cluster will only be visible from a fixed number of public IPs.
                </p>
                <Link
                  external
                  className="font-medium"
                  size="text-xs"
                  link="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features"
                  linkLabel="Documentation link"
                  iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
                  iconRightClassName="text-xxs relative top-[1px]"
                />
              </div>
            </div>
            <div className="shrink-0">
              <span className="text-ssm text-text-600 font-medium">$90/month billed by AWS</span>
            </div>
          </div>{' '}
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
