/* eslint-disable-next-line */
import { useNavigate } from 'react-router-dom'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { Button, ButtonStyle, IconAwesomeEnum, Skeleton } from '@qovery/shared/ui'

export interface AboutContainerProps {
  loadingStatus?: LoadingStatus
  organizationId?: string
}

export function AboutContainer(props: AboutContainerProps) {
  const { loadingStatus, organizationId = '' } = props
  const navigate = useNavigate()

  return (
    <Skeleton height={36} width={70} show={!loadingStatus || loadingStatus === 'loading'}>
      <Button
        onClick={() => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_CONTAINER_REGISTRIES_URL}`)}
        style={ButtonStyle.STROKED}
        iconLeft={IconAwesomeEnum.SOURCETREE}
      >
        Source registry
      </Button>
    </Skeleton>
  )
}

export default AboutContainer
