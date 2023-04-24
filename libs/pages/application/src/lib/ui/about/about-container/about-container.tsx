import { ContainerRegistryResponse } from 'qovery-typescript-axios'
import { useCallback } from 'react'
import { IconEnum, isContainerJob } from '@qovery/shared/enums'
import { ApplicationEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { Button, ButtonStyle, Skeleton, Truncate } from '@qovery/shared/ui'

export interface AboutContainerProps {
  loadingStatus?: LoadingStatus
  organizationId?: string
  container: ApplicationEntity
  currentRegistry?: ContainerRegistryResponse
}

export function AboutContainer(props: AboutContainerProps) {
  const getContainer = useCallback(() => {
    if (props.container) {
      if (isContainerJob(props.container)) {
        return props.container.source?.image
      } else {
        return {
          image_name: props.container.image_name,
          tag: props.container.tag,
        }
      }
    }
    return undefined
  }, [props.container])

  return (
    <div className="p-8 flex flex-col items-start border-b border-element-light-lighter-400 text-text-500">
      <div className="font-bold mb-3 text-text-600">Source</div>

      <div className="mb-3 flex gap-3">
        Image name: <strong className="font-medium text-text-500">{getContainer()?.image_name}</strong>
      </div>
      <div className="mb-3 flex gap-3">
        Image tag:{' '}
        <strong className="font-medium text-text-500">
          <Truncate truncateLimit={20} text={getContainer()?.tag || ''} />
        </strong>
      </div>
      <div className="flex gap-3 items-center">
        Registry:{' '}
        <Skeleton height={36} width={100} show={!props.currentRegistry}>
          <Button external link={props.currentRegistry?.url} style={ButtonStyle.STROKED} iconLeft={IconEnum.CONTAINER}>
            {props.currentRegistry?.name}
          </Button>
        </Skeleton>
      </div>
    </div>
  )
}

export default AboutContainer
