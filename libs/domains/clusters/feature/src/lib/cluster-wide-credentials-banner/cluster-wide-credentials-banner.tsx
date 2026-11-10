import { Banner } from '@qovery/shared/ui'
import { useWideCredentialsInstructions } from '../hooks/use-wide-credentials-instructions/use-wide-credentials-instructions'

export function ClusterWideCredentialsBanner() {
  const { isRequired, openInstructions } = useWideCredentialsInstructions()

  if (!isRequired) return null

  return (
    <Banner
      data-wide-credentials-banner=""
      color="yellow"
      className="shrink-0"
      buttonLabel="View instructions"
      onClickButton={openInstructions}
    >
      Extended credentials required
    </Banner>
  )
}
