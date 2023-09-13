import { type DeploymentHistoryEnvironment, StateEnum } from 'qovery-typescript-axios'
import { DEPLOYMENT_LOGS_VERSION_URL } from '@qovery/shared/routes'
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

  const showNewTag = [
    StateEnum.DEPLOYING,
    StateEnum.DELETING,
    StateEnum.RESTARTING,
    StateEnum.BUILDING,
    StateEnum.STOP_QUEUED,
    StateEnum.CANCELING,
    StateEnum.QUEUED,
    StateEnum.DELETE_QUEUED,
    StateEnum.DEPLOYMENT_QUEUED,
  ].includes(environmentState as StateEnum)

  if (data.length === 0) return null

  const currentPosition = findPositionById(data, versionId)

  return (
    <div className="flex border-b border-neutral-500 px-4 py-3">
      <div className="flex">
        <Button
          dataTestId="btn-back-logs"
          className="!border-r-0 !rounded-r-none"
          style={ButtonStyle.DARK}
          size={ButtonSize.TINY}
          link={pathLogs}
        >
          <Icon name={IconAwesomeEnum.HOUSE} />
        </Button>
        <Menu
          width={300}
          menus={menuHistory}
          arrowAlign={MenuAlign.CENTER}
          trigger={
            <Button
              className="!rounded-l-none w-[200px] mr-1.5"
              style={ButtonStyle.DARK}
              size={ButtonSize.TINY}
              iconRight={IconAwesomeEnum.ANGLE_DOWN}
            >
              Deployment log history
            </Button>
          }
        />
        {currentPosition > 0 && showNewTag && (
          <Tooltip content="New deployment available!" side="right" color="orange">
            <div>
              <Button
                className="!text-orange-500 !border-orange-500 !bg-neutral-500 w-[50px]"
                style={ButtonStyle.DARK}
                size={ButtonSize.TINY}
                link={pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')}
              >
                <span className="inline-flex items-center">
                  New
                  <i className="relative top-[1px] block ml-1 w-2 h-2 before:block before:absolute before:top-0.5 before:left-0.5 before:bg-orange-500 before:w-1 before:h-1 before:rounded-full after:motion-safe:animate-pulse after:block after:bg-orange-500/30 after:w-2 after:h-2 after:rounded-full" />
                </span>
              </Button>
            </div>
          </Tooltip>
        )}
        {currentPosition === 0 && (
          <Tag className="text-neutral-350 border border-neutral-350" fontWeight="font-medium">
            Latest
          </Tag>
        )}
        {environmentState && currentPosition > 0 && !showNewTag && (
          <Button
            className="w-[50px]"
            style={ButtonStyle.DARK}
            size={ButtonSize.TINY}
            iconRight={IconAwesomeEnum.CHEVRONS_RIGHT}
            link={pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')}
          >
            {currentPosition}
          </Button>
        )}
      </div>
    </div>
  )
}

export default SidebarHistory
