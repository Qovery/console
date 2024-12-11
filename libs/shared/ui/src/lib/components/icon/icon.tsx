import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { type ComponentPropsWithoutRef, type SVGAttributes } from 'react'
import { IconEnum } from '@qovery/shared/enums'
import IconFa from '../icon-fa/icon-fa'
import { type IconAwesomeEnum } from './icon-awesome.enum'
import BitbucketIcon from './icons-git/bitbucket'
import { GithubIcon, GithubWhiteIcon } from './icons-git/github'
import GitlabIcon from './icons-git/gitlab'
import ApplicationIcon from './icons/application'
import AWSIcon from './icons/aws'
import AWSGrayIcon from './icons/aws-gray'
import AzureIcon from './icons/azure'
import ChildrenArrow from './icons/children-arrow'
import CivoIcon from './icons/civo'
import CloudformationIcon from './icons/cloudformationIcon'
import { ContainerIcon } from './icons/container'
import CronJobIcon from './icons/cron-job'
import CronJobStrokeIcon from './icons/cron-job-stroke-icon'
import DatabaseIcon from './icons/database'
import DOIcon from './icons/do'
import DockerIcon from './icons/docker'
import DopplerIcon from './icons/doppler'
import EKSIcon from './icons/eks'
import EnvironmentIcon from './icons/environment'
import GCPIcon from './icons/gcp'
import GcpArtifactRegistryIcon from './icons/gcp-artifact-registry'
import GCPGrayIcon from './icons/gcp-gray'
import GenericRegistryIcon from './icons/generic-registry'
import GitIcon from './icons/git'
import GoogleIcon from './icons/google'
import HelmOfficialIcon from './icons/helm-official'
import HelmServiceIcon from './icons/helm-service'
import HetznerIcon from './icons/hetzner'
import IbmCloudIcon from './icons/ibm-cloud'
import InformationIcon from './icons/information'
import KubernetesIcon from './icons/kubernetes'
import LifecycleJobIcon from './icons/lifecycle-job'
import LifecycleJobStrokeIcon from './icons/lifecycle-job-stroke-icon'
import MicrosoftIcon from './icons/microsoft'
import MongoDBIcon from './icons/mongodb'
import MysqlIcon from './icons/mysql'
import OracleCloudIcon from './icons/oracle-cloud'
import OvhCloudIcon from './icons/ovh-cloud'
import PostgresqlIcon from './icons/postgresql'
import QoveryIcon from './icons/qovery'
import RedisIcon from './icons/redis'
import ScalewayIcon from './icons/scaleway'
import ScalewayGrayIcon from './icons/scaleway-gray'
import ServicesIcon from './icons/services'
import SlackIcon from './icons/slack'
import TerraformIcon from './icons/terraform'

export interface IconProps extends SVGAttributes<SVGElement> {
  name?: IconEnum | IconAwesomeEnum | string
  pathColor?: string
}

interface FontAwesomeIconProps extends Omit<ComponentPropsWithoutRef<'i'>, 'icon'> {
  iconStyle?: IconStyle
  iconName: IconName
}

export interface IconSVGProps extends SVGAttributes<SVGElement> {
  children?: never
}

export function Icon(props: IconProps | FontAwesomeIconProps) {
  if ('iconName' in props) {
    const { iconStyle = 'solid', iconName, className, ...rest } = props
    return <i aria-hidden className={`fa-${iconStyle} fa-${iconName} ${className ? className : ''}`} {...rest} />
  }

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
    case IconEnum.GOOGLE:
      return <GoogleIcon {...formattedProps} />
    case IconEnum.BITBUCKET:
      return <BitbucketIcon {...formattedProps} />
    case IconEnum.ENVIRONMENT:
      return <EnvironmentIcon {...formattedProps} />
    case IconEnum.AWS:
      return <AWSIcon {...formattedProps} />
    case IconEnum.AWS_GRAY:
      return <AWSGrayIcon {...formattedProps} />
    case IconEnum.DO:
      return <DOIcon {...formattedProps} />
    case IconEnum.SCW:
      return <ScalewayIcon {...formattedProps} />
    case IconEnum.SCW_GRAY:
      return <ScalewayGrayIcon {...formattedProps} />
    case IconEnum.GCP:
      return <GCPIcon {...formattedProps} />
    case IconEnum.GCP_GRAY:
      return <GCPGrayIcon {...formattedProps} />
    case IconEnum.APPLICATION:
      return <ApplicationIcon {...formattedProps} />
    case IconEnum.AZURE:
      return <AzureIcon {...formattedProps} />
    case IconEnum.DATABASE:
      return <DatabaseIcon {...formattedProps} />
    case IconEnum.CONTAINER:
      return <ContainerIcon {...formattedProps} />
    case IconEnum.QOVERY:
      return <QoveryIcon {...formattedProps} />
    case IconEnum.SLACK:
      return <SlackIcon {...formattedProps} />
    case IconEnum.DOCKER:
      return <DockerIcon {...formattedProps} />
    case IconEnum.POSTGRESQL:
      return <PostgresqlIcon {...formattedProps} />
    case IconEnum.REDIS:
      return <RedisIcon {...formattedProps} />
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
    case IconEnum.DOPPLER:
      return <DopplerIcon {...formattedProps} />
    case IconEnum.TERRAFORM:
      return <TerraformIcon {...formattedProps} />
    case IconEnum.SERVICES:
      return <ServicesIcon {...formattedProps} />
    case IconEnum.GENERIC_REGISTRY:
      return <GenericRegistryIcon {...formattedProps} />
    case IconEnum.GCP_ARTIFACT_REGISTRY:
      return <GcpArtifactRegistryIcon {...formattedProps} />
    case IconEnum.HELM:
      return <HelmServiceIcon {...formattedProps} />
    case IconEnum.HELM_OFFICIAL:
      return <HelmOfficialIcon {...formattedProps} />
    case IconEnum.KUBERNETES:
      return <KubernetesIcon {...formattedProps} />
    case IconEnum.MICROSOFT:
      return <MicrosoftIcon {...formattedProps} />
    case IconEnum.EKS:
      return <EKSIcon {...formattedProps} />
    case IconEnum.ON_PREMISE:
    case IconEnum.ON_PREMISE_GRAY:
      return <KubernetesIcon {...formattedProps} />
    case IconEnum.CLOUDFORMATION:
      return <CloudformationIcon {...formattedProps} />
    case IconEnum.IBM_CLOUD:
      return <IbmCloudIcon {...formattedProps} />
    case IconEnum.HETZNER:
      return <HetznerIcon {...formattedProps} />
    case IconEnum.OVH_CLOUD:
      return <OvhCloudIcon {...formattedProps} />
    case IconEnum.ORACLE_CLOUD:
      return <OracleCloudIcon {...formattedProps} />
    case IconEnum.CIVO:
      return <CivoIcon {...formattedProps} />
    default:
      return <IconFa {...formattedProps} />
  }
}

export default Icon
