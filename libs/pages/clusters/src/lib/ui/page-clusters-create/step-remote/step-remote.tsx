import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterRemoteSettings } from '@qovery/shared/console-shared'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { CLUSTERS_CREATION_RESOURCES_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { ButtonLegacy, ButtonLegacySize, ButtonLegacyStyle, ExternalLink, Heading, Section } from '@qovery/shared/ui'

export interface StepRemoteProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function StepRemote(props: StepRemoteProps) {
  const { onSubmit } = props
  const { formState } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Set SSH Key</Heading>
        <p className="text-neutral-400 text-sm mb-2">
          Specify an SSH key to access your EC2 instance remotely. You can also do this later in the cluster settings,
          but we recommend doing it now to avoid downtime.
        </p>
        <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/clusters/#generating-an-ssh-key-for-your-cluster">
          How to generate an SSH Key
        </ExternalLink>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          <ClusterRemoteSettings />
        </div>

        <div className="flex justify-between">
          <ButtonLegacy
            onClick={() =>
              navigate(CLUSTERS_URL(organizationId) + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_RESOURCES_URL)
            }
            type="button"
            className="btn--no-min-w"
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.STROKED}
          >
            Back
          </ButtonLegacy>
          <ButtonLegacy
            dataTestId="button-submit"
            type="submit"
            disabled={!formState.isValid}
            size={ButtonLegacySize.XLARGE}
            style={ButtonLegacyStyle.BASIC}
          >
            Continue
          </ButtonLegacy>
        </div>
      </form>
    </Section>
  )
}

export default StepRemote
