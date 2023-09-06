import { type DeploymentHistoryEnvironment, StateEnum } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  Icon,
  IconAwesomeEnum,
  Menu,
  MenuAlign,
  type MenuData,
  StatusChip,
  Tag,
  Tooltip,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { trimId } from '@qovery/shared/util-js'

export interface SidebarHistoryProps {
  data: DeploymentHistoryEnvironment[]
  pathLogs: string
  serviceId: string
  versionId?: string
  environmentState?: StateEnum
}

export function SidebarHistory({ data, serviceId, versionId, pathLogs, environmentState }: SidebarHistoryProps) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const menuHistory: MenuData = [
    {
      items:
        data?.map((item, index) => ({
          name: item.id,
          itemContentCustom: (
            <div
              className={`flex justify-between w-full py-2 text-xs ${
                item.id === versionId || (!versionId && index === 0) ? 'text-brand-400' : 'text-neutral-300'
              }`}
            >
              <div className="flex">
                <StatusChip className="mr-3" status={item.status} />
                <Tooltip content={item.id}>
                  <p className="font-medium text-brand-300">{trimId(item.id)}</p>
                </Tooltip>
              </div>
              <div>{dateFullFormat(item.created_at)}</div>
            </div>
          ),
          link: {
            url: pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, item.id),
          },
        })) || [],
    },
  ]

  function findPositionById(data: DeploymentHistoryEnvironment[], versionId = '') {
    const index = data.findIndex((item) => item.id === versionId)
    return index !== -1 ? index : 0
  }

  function showNewTag(status?: StateEnum): boolean {
    switch (status) {
      case StateEnum.DEPLOYING:
      case StateEnum.DELETING:
      case StateEnum.RESTARTING:
      case StateEnum.BUILDING:
      case StateEnum.STOP_QUEUED:
      case StateEnum.CANCELING:
      case StateEnum.QUEUED:
      case StateEnum.DELETE_QUEUED:
      case StateEnum.DEPLOYMENT_QUEUED:
        return true
      default:
        return false
    }
  }

  if (data.length === 0) return null

  const currentPosition = findPositionById(data, versionId)

  return (
    <div className="flex border-b border-neutral-500 px-4 py-3">
      <div className="flex">
        <Button
          className="!border-r-0 !rounded-r-none"
          style={ButtonStyle.DARK}
          size={ButtonSize.TINY}
          link={ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}
        >
          <Icon name={IconAwesomeEnum.HOUSE} />
        </Button>
        <Menu
          width={300}
          menus={menuHistory}
          arrowAlign={MenuAlign.CENTER}
          trigger={
            <Button
              className="!rounded-l-none w-[199px] mr-1.5"
              style={ButtonStyle.DARK}
              size={ButtonSize.TINY}
              iconRight={IconAwesomeEnum.ANGLE_DOWN}
            >
              Deployment log history
            </Button>
          }
        />
        {showNewTag(environmentState) && (
          <Button
            className="!text-orange-500 !border-orange-500 !hover:bg-orange-500 w-[51px]"
            style={ButtonStyle.DARK}
            size={ButtonSize.TINY}
            link={
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
              DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')
            }
          >
            New
            <span className="inline-flex ml-1 w-1.5 h-1.5 bg-orange-500 border-2 border-orange-500/30 rounded-full"></span>
          </Button>
        )}
        {currentPosition === 0 && !showNewTag(environmentState) && (
          <Tag className="text-neutral-350 border border-neutral-350" fontWeight="font-medium">
            Latest
          </Tag>
        )}
        {currentPosition > 0 && !showNewTag(environmentState) && (
          <Button
            className="w-[51px]"
            style={ButtonStyle.DARK}
            size={ButtonSize.TINY}
            iconRight={IconAwesomeEnum.CHEVRONS_RIGHT}
            link={
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
              DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')
            }
          >
            {currentPosition}
          </Button>
        )}
      </div>
    </div>
  )
}

export default SidebarHistory
