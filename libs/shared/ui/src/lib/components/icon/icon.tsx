import { IconEnum } from '@console/shared/enums'
import IconFa from '../icon-fa/icon-fa'
import GithubIcon from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import BitbucketIcon from './icons-git/bitbucket'
import EnvironmentIcon from './icons/environment'
import AWSIcon from './icons/aws'
import ApplicationIcon from './icons/application'
import SuccessIcon from './icons-status/success'
import ErrorIcon from './icons-status/error'
import PauseIcon from './icons-status/pause'
import DeleteIcon from './icons-status/delete'
import ProgressIcon from './icons-status/progress'
import ScalewayIcon from './icons/scaleway'
import DOIcon from './icons/do'
import DockerIcon from './icons/docker'
import PostgresqlIcon from './icons/postgresql'
import RedisIcon from './icons/redis'
import BuildpacksIcon from './icons/buildpacks'
import MongoDBIcon from './icons/mongodb'
import MysqlIcon from './icons/mysql'
import AWSGrayIcon from './icons/aws-gray'
import ScalewayGrayIcon from './icons/scaleway-gray'
import DOGrayIcon from './icons/do-gray'
import DatabaseIcon from './icons/database'

export interface IconProps {
  name: IconEnum | string
  width?: string
  height?: string
  viewBox?: string
  className?: string
  pathColor?: string
}

export function Icon(props: IconProps) {
  const formattedProps = { ...props }

  formattedProps.width = formattedProps.width || '1.5rem'
  formattedProps.viewBox = formattedProps.viewBox || '0 0 24 24'
  formattedProps.className = 'shrink-0 ' + formattedProps.className

  switch (props.name) {
    case IconEnum.GITHUB:
      return <GithubIcon {...formattedProps} />
    case IconEnum.GITLAB:
      return <GitlabIcon {...formattedProps} />
    case IconEnum.BITBUCKET:
      return <BitbucketIcon {...formattedProps} />
    case IconEnum.ENVIRONMENT:
      return <EnvironmentIcon {...formattedProps} />
    case IconEnum.AWS:
      return <AWSIcon {...formattedProps} />
    case IconEnum.AWS_GRAY:
      return <AWSGrayIcon {...formattedProps} />
    case IconEnum.SCALEWAY:
      return <ScalewayIcon {...formattedProps} />
    case IconEnum.SCALEWAY_GRAY:
      return <ScalewayGrayIcon {...formattedProps} />
    case IconEnum.DO:
      return <DOIcon {...formattedProps} />
    case IconEnum.DO_GRAY:
      return <DOGrayIcon {...formattedProps} />
    case IconEnum.APPLICATION:
      return <ApplicationIcon {...formattedProps} />
    case IconEnum.DATABASE:
      return <DatabaseIcon {...formattedProps} />
    case IconEnum.SUCCESS:
      return <SuccessIcon {...formattedProps} />
    case IconEnum.ERROR:
      return <ErrorIcon {...formattedProps} />
    case IconEnum.PAUSE:
      return <PauseIcon {...formattedProps} />
    case IconEnum.DELETE:
      return <DeleteIcon {...formattedProps} />
    case IconEnum.PROGRESS:
      return <ProgressIcon {...formattedProps} />
    case IconEnum.DOCKER:
      return <DockerIcon {...formattedProps} />
    case IconEnum.POSTGRESQL:
      return <PostgresqlIcon {...formattedProps} />
    case IconEnum.REDIS:
      return <RedisIcon {...formattedProps} />
    case IconEnum.BUILDPACKS:
      return <BuildpacksIcon {...formattedProps} />
    case IconEnum.MONGODB:
      return <MongoDBIcon {...formattedProps} />
    case IconEnum.MYSQL:
      return <MysqlIcon {...formattedProps} />
    default:
      return <IconFa {...formattedProps} />
  }
}

export default Icon
