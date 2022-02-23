import { IconEnum } from '../../enums/icon.enum'
import GithubIcon from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import BitbucketIcon from './icons-git/bitbucket'
import IconFa from '../icon-fa/icon-fa'
export interface IconProps {
  name: IconEnum | string
  width?: string
  viewBox?: string
  className?: string
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
    default:
      return <IconFa name={props.name} />
  }
}

export default Icon
