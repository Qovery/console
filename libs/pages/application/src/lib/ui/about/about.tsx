/* eslint-disable-next-line */
import { BuildModeEnum, GitProviderEnum } from 'qovery-typescript-axios'
import { ServicesEnum } from '@console/shared/enums'
import { LoadingStatus } from '@console/shared/interfaces'
import { BaseLink, Button, ButtonStyle, Icon, Skeleton } from '@console/shared/ui'

export interface AboutProps {
  description: string
  link: BaseLink
  type: ServicesEnum
  buildMode?: BuildModeEnum
  gitProvider?: GitProviderEnum
  loadingStatus?: LoadingStatus
}

export function About(props: AboutProps) {
  const { description, buildMode, link, gitProvider, loadingStatus, type } = props
  return (
    <div className="pt-2 pb-8 px-8 flex flex-col items-start border-b border-element-light-lighter-400">
      <div className="text-subtitle mb-3 text-text-600">About</div>
      <p className="text-text-500 mb-5">{description ? description : 'No description provided yet'}</p>
      {type === ServicesEnum.APPLICATION ? (
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
              iconRight="icon-solid-arrow-up-right-from-square"
              className="capitalize"
            >
              {gitProvider && gitProvider.toLowerCase()}
            </Button>
          </Skeleton>
        </>
      ) : (
        <Button
          link={link.link}
          style={ButtonStyle.STROKED}
          external={link.external}
          iconRight="icon-solid-arrow-up-right-from-square"
          className="capitalize"
        >
          Source registry
        </Button>
      )}
    </div>
  )
}

export default About
