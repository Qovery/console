import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { ServiceTypeEnum, isApplication, isContainer } from '@qovery/shared/enums'
import { LoadingStatus } from '@qovery/shared/interfaces'
import { SETTINGS_CONTAINER_REGISTRIES_URL, SETTINGS_URL } from '@qovery/shared/routes'
import { BaseLink, Button, ButtonStyle, Icon, IconAwesomeEnum, Skeleton } from '@qovery/shared/ui'

export interface AboutProps {
  description: string
  link: BaseLink
  type?: ServiceTypeEnum
  buildMode?: BuildModeEnum
  gitProvider?: GitProviderEnum
  loadingStatus?: LoadingStatus
}

export function About(props: AboutProps) {
  const { description, buildMode, link, gitProvider, loadingStatus, type } = props
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div className="pt-2 pb-8 px-8 flex flex-col items-start border-b border-element-light-lighter-400">
      <div className="text-subtitle mb-3 text-text-600">About</div>
      <p className="text-text-500 mb-5">{description ? description : 'No description provided yet'}</p>
      {isContainer(type) && (
        <Skeleton height={36} width={70} show={!loadingStatus || loadingStatus === 'loading'}>
          <Button
            onClick={() => navigate(`${SETTINGS_URL(organizationId)}${SETTINGS_CONTAINER_REGISTRIES_URL}`)}
            style={ButtonStyle.STROKED}
            iconLeft={IconAwesomeEnum.SOURCETREE}
          >
            Source registry
          </Button>
        </Skeleton>
      )}
      {isApplication(type) && (
        <>
          <Skeleton height={24} width={70} show={!loadingStatus || loadingStatus === 'loading'} className="mb-5">
            <div className="flex gap-2 items-center px-2 h-6 capitalize border leading-0 rounded border-element-light-lighter-500 text-text-500 text-sm font-medium">
              <Icon name={buildMode || ''} className="w-4" />
              {buildMode && buildMode.toLowerCase()}
            </div>
          </Skeleton>

          <Skeleton height={36} width={70} show={!loadingStatus || loadingStatus === 'loading'}>
            <Button
              link={link.link}
              style={ButtonStyle.STROKED}
              external={link.external}
              iconRight={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE}
              className="capitalize"
            >
              {gitProvider && gitProvider.toLowerCase()}
            </Button>
          </Skeleton>
        </>
      )}
    </div>
  )
}

export default About
