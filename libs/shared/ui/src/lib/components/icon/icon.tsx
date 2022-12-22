import { IconEnum } from '@qovery/shared/enums'
import IconFa from '../icon-fa/icon-fa'
import { IconAwesomeEnum } from './icon-awesome.enum'
import BitbucketIcon from './icons-git/bitbucket'
import { GithubIcon, GithubWhiteIcon } from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import DeleteIcon from './icons-status/delete'
import ErrorIcon from './icons-status/error'
import PauseIcon from './icons-status/pause'
import ProgressIcon from './icons-status/progress'
import SuccessIcon from './icons-status/success'
import ApplicationIcon from './icons/application'
import AWSIcon from './icons/aws'
import AWSGrayIcon from './icons/aws-gray'
import BuildpacksIcon from './icons/buildpacks'
import ChildrenArrow from './icons/children-arrow'
import { ContainerIcon } from './icons/container'
import CronJobIcon from './icons/cron-job'
import CronJobStrokeIcon from './icons/cron-job-stroke-icon'
import DatabaseIcon from './icons/database'
import DOIcon from './icons/do'
import DOGrayIcon from './icons/do-gray'
import DockerIcon from './icons/docker'
import EnvironmentIcon from './icons/environment'
import GitIcon from './icons/git'
import InformationIcon from './icons/information'
import LifecycleJobIcon from './icons/lifecycle-job'
import LifecycleJobStrokeIcon from './icons/lifecycle-job-stroke-icon'
import MongoDBIcon from './icons/mongodb'
import MysqlIcon from './icons/mysql'
import PostgresqlIcon from './icons/postgresql'
import RedisIcon from './icons/redis'
import ScalewayIcon from './icons/scaleway'
import ScalewayGrayIcon from './icons/scaleway-gray'

export interface IconProps {
  name: IconEnum | IconAwesomeEnum | string
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
  formattedProps.className = 'shrink-0 ' + (formattedProps.className || '')

  switch (props.name) {
    case IconEnum.GITHUB:
      return <GithubIcon {...formattedProps} />
    case IconEnum.GITHUB_WHITE:
      return <GithubWhiteIcon {...formattedProps} />
    case IconEnum.CHILDREN_ARROW:
      return <ChildrenArrow {...formattedProps} />
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
    case IconEnum.SCW:
      return <ScalewayIcon {...formattedProps} />
    case IconEnum.SCW_GRAY:
      return <ScalewayGrayIcon {...formattedProps} />
    case IconEnum.DO:
      return <DOIcon {...formattedProps} />
    case IconEnum.DO_GRAY:
      return <DOGrayIcon {...formattedProps} />
    case IconEnum.APPLICATION:
      return <ApplicationIcon {...formattedProps} />
    case IconEnum.DATABASE:
      return <DatabaseIcon {...formattedProps} />
    case IconEnum.CONTAINER:
      return <ContainerIcon {...formattedProps} />
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
    case IconEnum.INFORMATION:
      return <InformationIcon {...formattedProps} />
    case IconEnum.GIT:
      return <GitIcon {...formattedProps} />
    case IconEnum.CRON_JOB:
      return <CronJobIcon {...formattedProps} />
    case IconEnum.CRON_JOB_STROKE:
      return <CronJobStrokeIcon {...formattedProps} />
    case IconEnum.LIFECYCLE_JOB:
      return <LifecycleJobIcon {...formattedProps} />
    case IconEnum.LIFECYCLE_JOB_STROKE:
      return <LifecycleJobStrokeIcon {...formattedProps} />
    default:
      return <IconFa {...formattedProps} />
  }
}

export default Icon
