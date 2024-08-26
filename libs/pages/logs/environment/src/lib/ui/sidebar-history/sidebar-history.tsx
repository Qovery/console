import { type DeploymentHistoryEnvironment, type StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { DEPLOYMENT_LOGS_VERSION_URL } from '@qovery/shared/routes'
import { Badge, Button, Icon, Link, Menu, MenuAlign, type MenuData, StatusChip, Tooltip } from '@qovery/shared/ui'
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
              className={`flex w-full justify-between py-2 text-xs ${
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

  const showNewTag = match(environmentState)
    .with(
      'DEPLOYING',
      'DELETING',
      'RESTARTING',
      'BUILDING',
      'STOP_QUEUED',
      'CANCELING',
      'QUEUED',
      'DELETE_QUEUED',
      'DEPLOYMENT_QUEUED',
      () => true
    )
    .otherwise(() => false)

  if (data.length === 0) return null

  const currentPosition = findPositionById(data, versionId)

  return (
    <div className="flex border-b border-neutral-500 px-4 py-3">
      <div className="flex">
        <Link
          as="button"
          data-testid="btn-back-logs"
          type="button"
          color="neutral"
          variant="surface"
          className="!rounded-r-none !border-r-0"
          to={pathLogs}
        >
          <Icon iconName="house" />
        </Link>
        <Menu
          width={300}
          menus={menuHistory}
          arrowAlign={MenuAlign.CENTER}
          trigger={
            <Button
              className="mr-1.5 w-[200px] justify-center gap-2 !rounded-l-none"
              type="button"
              color="neutral"
              variant="surface"
            >
              Deployment log history
              <Icon iconName="chevron-down" />
            </Button>
          }
        />
        {currentPosition > 0 && showNewTag && (
          <Tooltip content="New deployment available!" side="right" color="orange">
            <div>
              <Link
                as="button"
                className="w-[50px] !border-orange-500 bg-neutral-500 !text-orange-500"
                type="button"
                color="neutral"
                variant="surface"
                to={pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')}
              >
                <span className="inline-flex items-center">
                  New
                  <i className="relative top-[1px] ml-1 block h-2 w-2 before:absolute before:left-0.5 before:top-0.5 before:block before:h-1 before:w-1 before:rounded-full before:bg-orange-500 after:block after:h-2 after:w-2 after:rounded-full after:bg-orange-500/30 after:motion-safe:animate-pulse" />
                </span>
              </Link>
            </div>
          </Tooltip>
        )}
        {currentPosition === 0 && <Badge className="w-[50px] justify-center">Latest</Badge>}
        {environmentState && currentPosition > 0 && !showNewTag && (
          <Link
            as="button"
            className="w-[50px] justify-center gap-1"
            type="button"
            color="neutral"
            variant="surface"
            to={pathLogs + DEPLOYMENT_LOGS_VERSION_URL(serviceId, '')}
          >
            {currentPosition}
            <Icon iconName="chevrons-right" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default SidebarHistory
