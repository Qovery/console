import { useParams } from 'react-router-dom'
import { RunningStatus } from '@qovery/shared/enums'
import { EnvironmentEntity } from '@qovery/shared/interfaces'
import {
  ButtonIconAction,
  Icon,
  IconAwesomeEnum,
  Skeleton,
  StatusChip,
  StatusLabel,
  StatusMenuActions,
  TableFilterProps,
  TableHeadProps,
  TableRow,
  TagMode,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/utils'
import CreateCloneEnvironmentModalFeature from '../../feature/create-clone-environment-modal-feature/create-clone-environment-modal-feature'

export interface TableRowEnvironmentsProps {
  data: EnvironmentEntity
  filter: TableFilterProps
  dataHead: TableHeadProps[]
  link: string
  buttonActions: StatusMenuActions[]
  removeEnvironment?: (environmentId: string, name: string) => void
  columnsWidth?: string
}

export function TableRowEnvironments(props: TableRowEnvironmentsProps) {
  const { organizationId = '', projectId = '' } = useParams()

  const {
    data,
    filter,
    dataHead,
    columnsWidth = `repeat(${dataHead.length},minmax(0,1fr))`,
    link,
    buttonActions,
    removeEnvironment,
  } = props

  const { openModal, closeModal } = useModal()

  const buttonActionsDefault = [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
      statusActions: {
        status: data.status && data.status.state,
        actions: buttonActions,
      },
    },
    {
      ...(removeEnvironment && {
        iconLeft: <Icon name="icon-solid-ellipsis-vertical" />,
        menusClassName: 'border-l border-l-element-light-lighter-500',
        menus: [
          {
            items: [
              {
                name: 'Clone',
                contentLeft: <Icon name={IconAwesomeEnum.COPY} className="text-sm text-brand-400" />,
                onClick: () =>
                  openModal({
                    content: (
                      <CreateCloneEnvironmentModalFeature
                        onClose={closeModal}
                        projectId={projectId}
                        organizationId={organizationId}
                        environmentToClone={data}
                      />
                    ),
                  }),
              },
              {
                name: 'Remove',
                contentLeft: <Icon name="icon-solid-trash" className="text-sm text-brand-400" />,
                onClick: () => removeEnvironment(data.id, data.name),
              },
            ],
          },
        ],
      }),
    },
  ]

  const isLoading = !data.status?.id

  return (
    <TableRow data={data} filter={filter} columnsWidth={columnsWidth} link={link} disabled={isLoading}>
      <>
        <div className="flex items-center px-4">
          <Skeleton className="shrink-0" show={isLoading} width={16} height={16}>
            <StatusChip status={(data.running_status && data.running_status.state) || RunningStatus.STOPPED} />
          </Skeleton>
          <Tooltip
            content={
              <p className="flex">
                {data.cloud_provider.provider && (
                  <Icon className="mr-2" name={`${data.cloud_provider.provider}_GRAY`} width="16" />
                )}
                {data.cluster_name} ({data.cloud_provider.cluster})
              </p>
            }
          >
            <div className="ml-3 mr-3">
              <Skeleton show={isLoading} width={16} height={16}>
                <div className="cursor-pointer mt-0.5">
                  {data.cloud_provider.provider && <Icon name={`${data.cloud_provider.provider}_GRAY`} />}
                </div>
              </Skeleton>
            </div>
          </Tooltip>
          <Skeleton show={isLoading} width={400} height={16} truncate>
            <span className="text-sm text-text-500 font-medium truncate">{data.name}</span>
          </Skeleton>
        </div>
        <div className="flex justify-end justify-items-center px-3">
          <Skeleton show={isLoading} width={200} height={16}>
            <div className="flex items-center">
              <p className="flex items-center leading-7 text-text-400 text-sm">
                <StatusLabel status={data.status && data.status.state} />
                {data.status?.last_deployment_date && (
                  <span className="text-xs text-text-300 mx-3 font-medium">
                    {timeAgo(new Date(data.status.last_deployment_date))} ago
                  </span>
                )}
              </p>
              <ButtonIconAction
                actions={buttonActionsDefault}
                statusInformation={{
                  id: data.id,
                  name: data.name,
                  mode: data.mode,
                }}
              />
            </div>
          </Skeleton>
        </div>
        <div className="flex items-center px-4 border-b-element-light-lighter-400 border-l h-full">
          <Skeleton show={isLoading} width={30} height={16}>
            <TagMode status={data.mode} />
          </Skeleton>
        </div>
      </>
    </TableRow>
  )
}

export default TableRowEnvironments
