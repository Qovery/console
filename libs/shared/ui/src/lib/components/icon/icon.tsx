import { IconEnum } from '@console/shared/enums'
import IconFa from '../icon-fa/icon-fa'
import GithubIcon from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import BitbucketIcon from './icons-git/bitbucket'
import EnvironmentIcon from './icons/environment'
import ApplicationsIcon from './icons/applications'
import AWSIcon from './icons/aws'
import ApplicationIcon from './icons/application'
import SuccessIcon from './icons-status/success'
import ErrorIcon from './icons-status/error'
import PauseIcon from './icons-status/pause'
import DeleteIcon from './icons-status/delete'
export interface IconProps {
  name: IconEnum | string
  width?: string
  viewBox?: string
  className?: string
  pathColor?: string
}

export function Icon(props: IconProps) {
  const formattedProps = { ...props }

  formattedProps.width = formattedProps.width || '1.5rem'
  formattedProps.viewBox = formattedProps.viewBox || '0 0 24 24'

  switch (props.name) {
    case IconEnum.GITHUB:
      return <GithubIcon {...formattedProps} />
    case IconEnum.GITLAB:
      return <GitlabIcon {...formattedProps} />
    case IconEnum.BITBUCKET:
      return <BitbucketIcon {...formattedProps} />
    case IconEnum.ENVIRONMENT:
      return <EnvironmentIcon {...formattedProps} />
    case IconEnum.APPLICATIONS:
      return <ApplicationsIcon {...formattedProps} />
    case IconEnum.AWS:
      return <AWSIcon {...formattedProps} />
    case IconEnum.APPLICATION:
      return <ApplicationIcon {...formattedProps} />
    case IconEnum.SUCCESS:
      return <SuccessIcon {...formattedProps} />
    case IconEnum.ERROR:
      return <ErrorIcon {...formattedProps} />
    case IconEnum.PAUSE:
      return <PauseIcon {...formattedProps} />
    case IconEnum.DELETE:
      return <DeleteIcon {...formattedProps} />
    default:
      return <IconFa {...formattedProps} />
  }
}

export default Icon
