import { Environment, Link, ServiceDeploymentStatusEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren, createContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { postApplicationActionsDeploy, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { selectClusterById } from '@qovery/domains/organization'
import { ApplicationButtonsActions, NeedRedeployFlag } from '@qovery/shared/console-shared'
import { IconEnum, getServiceType, isCronJob, isLifeCycleJob } from '@qovery/shared/enums'
import { ApplicationEntity, ClusterEntity } from '@qovery/shared/interfaces'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  Header,
  Icon,
  Menu,
  MenuData,
  MenuItemProps,
  Skeleton,
  Tag,
  TagMode,
  TagSize,
} from '@qovery/shared/ui'
import { AppDispatch, RootState } from '@qovery/state/store'
import TabsFeature from '../../feature/tabs-feature/tabs-feature'

export const ApplicationContext = createContext<{
  showHideAllEnvironmentVariablesValues: boolean
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => void
}>({
  showHideAllEnvironmentVariablesValues: false,
  setShowHideAllEnvironmentVariablesValues: (b: boolean) => {},
})

export interface ContainerProps {
  application?: ApplicationEntity
  environment?: Environment
}

export function Container(props: PropsWithChildren<ContainerProps>) {
  const { application, environment, children } = props
  const { environmentId = '', applicationId = '' } = useParams()
  const [showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues] = useState<boolean>(false)

  const cluster = useSelector<RootState, ClusterEntity | undefined>((state: RootState) =>
    selectClusterById(state, environment?.cluster_id || '')
  )

  const dispatch = useDispatch<AppDispatch>()

  const redeployApplication = () => {
    if (application) {
      if (application?.status?.service_deployment_status === ServiceDeploymentStatusEnum.NEVER_DEPLOYED) {
        dispatch(
          postApplicationActionsDeploy({ environmentId, applicationId, serviceType: getServiceType(application) })
        )
      } else {
        dispatch(
          postApplicationActionsRedeploy({ environmentId, applicationId, serviceType: getServiceType(application) })
        )
      }
    }
  }

  const menuLink: MenuData = []

  if (application && application.links && application.links.items) {
    const items: MenuItemProps[] = application.links.items
      // remove default Qovery links
      .filter((link: Link) => !(link.is_default && link.is_qovery_domain))
      .map((link) => {
        return {
          name: link.url || '',
          link: {
            url: link.url || '',
            external: true,
          },
          copy: link.url || undefined,
          copyTooltip: 'Copy the link',
        }
      })

    menuLink.push({
      title: 'Links',
      items,
    })
  }

  const headerButtons = (
    <div className="flex items-start gap-2">
      {application?.links && application.links.items && application.links.items.length > 0 && (
        <Menu
          menus={menuLink}
          trigger={
            <Button iconRight="icon-solid-link" style={ButtonStyle.STROKED} size={ButtonSize.SMALL}>
              Open links
            </Button>
          }
        />
      )}
    </div>
  )

  const headerActions = (
    <>
      <Skeleton width={150} height={32} show={!application?.status}>
        <div className="flex">
          {environment && application && application?.status && (
            <>
              <ApplicationButtonsActions
                application={application}
                environmentMode={environment.mode}
                clusterId={environment.cluster_id}
              />
              <span className="ml-4 mr-1 mt-2 h-4 w-[1px] bg-neutral-200"></span>
            </>
          )}
        </div>
      </Skeleton>
      {environment && (
        <Skeleton width={80} height={32} show={!environment?.mode}>
          <TagMode size={TagSize.BIG} status={environment?.mode} />
        </Skeleton>
      )}
      <Skeleton width={40} height={32} show={!environment?.cloud_provider}>
        <div className="border border-neutral-200 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
          {application && <Icon name={getServiceType(application)} width="16" height="16" />}
        </div>
      </Skeleton>
      <Skeleton width={120} height={32} show={!cluster}>
        <div className="border border-neutral-200 bg-white h-8 px-3 rounded text-xs items-center inline-flex font-medium gap-2">
          <Icon name={environment?.cloud_provider.provider as IconEnum} width="16" />
          <p className="max-w-[120px] truncate">{cluster?.name}</p>
        </div>
      </Skeleton>
      <Tag className="bg-neutral-150 gap-2 hidden">
        <span className="w-2 h-2 rounded-lg bg-orange-300"></span>
        <span className="w-2 h-2 rounded-lg bg-teal-500"></span>
      </Tag>
    </>
  )

  return (
    <ApplicationContext.Provider
      value={{ showHideAllEnvironmentVariablesValues, setShowHideAllEnvironmentVariablesValues }}
    >
      <Header
        title={application?.name}
        icon={
          isCronJob(application)
            ? IconEnum.CRON_JOB
            : isLifeCycleJob(application)
            ? IconEnum.LIFECYCLE_JOB
            : IconEnum.APPLICATION
        }
        buttons={headerButtons}
        actions={headerActions}
      />
      <TabsFeature />
      {application &&
        application.status &&
        application.status.service_deployment_status !== ServiceDeploymentStatusEnum.UP_TO_DATE && (
          <NeedRedeployFlag service={application} onClickCTA={redeployApplication} />
        )}
      {children}
    </ApplicationContext.Provider>
  )
}

export default Container
