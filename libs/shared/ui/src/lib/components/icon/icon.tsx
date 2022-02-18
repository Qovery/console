import { IconEnum } from '../../enums/icon.enum'
import GithubIcon from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import BitbucketIcon from './icons-git/bitbucket'
export interface IconProps {
  name: IconEnum
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
    default:
      return <BitbucketIcon {...formattedProps} />
  }
}

export default Icon
