import { type StateEnum } from 'qovery-typescript-axios'
import { useNavigate, useParams } from 'react-router-dom'
import { ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { ActionToolbar, DropdownMenu, Icon, IconAwesomeEnum, Tooltip, useModalConfirmation } from '@qovery/shared/ui'
import {
  isDeleteAvailable,
  isDeployAvailable,
  isRedeployAvailable,
  isStopAvailable,
  isUpdateAvailable,
} from '@qovery/shared/util-js'
import { useDeployEnvironment } from '../hooks/use-deploy-environment/use-deploy-environment'
import { useEnvironment } from '../hooks/use-environment/use-environment'
import { useStopEnvironment } from '../hooks/use-stop-environment/use-stop-environment'

function MenuManageDeployment({
  state,
  environmentId,
  projectId,
}: {
  state: StateEnum
  environmentId: string
  projectId: string
}) {
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deployCluster } = useDeployEnvironment({ projectId })
  const { mutate: stopCluster } = useStopEnvironment({ projectId })

  const mutationDeploy = () =>
    deployCluster({
      environmentId,
    })

  // const mutationUpdate = () =>
  //   openModalConfirmation({
  //     mode: EnvironmentModeEnum.PRODUCTION,
  //     title: 'Confirm update',
  //     description: 'To confirm the update of your cluster, please type the name:',
  //     name: cluster.name,
  //     action: () =>
  //       deployCluster({
  //         organizationId,
  //         clusterId: cluster.id,
  //       }),
  //   })

  // const mutationStop = () =>
  //   openModalConfirmation({
  //     mode: EnvironmentModeEnum.PRODUCTION,
  //     title: 'Confirm stop',
  //     description: 'To confirm the stop of your cluster, please type the name:',
  //     warning:
  //       'Please note that by stopping your cluster, some resources will still be used on your cloud provider account and still be added to your bill. To completely remove them, please use the “Remove” feature.',
  //     name: cluster.name,
  //     action: () =>
  //       stopCluster({
  //         organizationId,
  //         clusterId: cluster.id,
  //       }),
  //   })

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Manage Deployment">
          <Tooltip content="Manage Deployment">
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
              <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {isDeployAvailable(state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.PLAY} />} onClick={mutationDeploy}>
            Deploy
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

// function MenuOtherActions({
//   cluster,
//   clusterStatus,
//   organizationId,
// }: {
//   cluster: Cluster
//   clusterStatus: ClusterStatusGet
//   organizationId: string
// }) {
//   const navigate = useNavigate()
//   const { openModal } = useModal()
//   const [, copyToClipboard] = useCopyToClipboard()
//   const { mutate: downloadKubeconfig } = useDownloadKubeconfig()

//   const removeCluster = (id: string, name: string) => {
//     openModal({
//       content: <ClusterDeleteModal organizationId={organizationId} clusterId={id} name={name} />,
//     })
//   }

//   const canDelete = clusterStatus.status && isDeleteAvailable(clusterStatus.status)

//   return (
//     <DropdownMenu.Root>
//       <DropdownMenu.Trigger asChild>
//         <ActionToolbar.Button aria-label="Other actions">
//           <Tooltip content="Other actions">
//             <div className="flex items-center w-full h-full">
//               <Icon name={IconAwesomeEnum.ELLIPSIS_V} />
//             </div>
//           </Tooltip>
//         </ActionToolbar.Button>
//       </DropdownMenu.Trigger>
//       <DropdownMenu.Content>
//         <DropdownMenu.Item
//           icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
//           onClick={() =>
//             navigate(
//               AUDIT_LOGS_PARAMS_URL(organizationId, {
//                 targetType: OrganizationEventTargetType.CLUSTER,
//                 targetId: cluster.id,
//               })
//             )
//           }
//         >
//           See audit logs
//         </DropdownMenu.Item>
//         <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.COPY} />} onClick={() => copyToClipboard(cluster.id)}>
//           Copy identifier
//         </DropdownMenu.Item>
//         <DropdownMenu.Item
//           icon={<Icon name={IconAwesomeEnum.DOWNLOAD} />}
//           onClick={() => downloadKubeconfig({ organizationId, clusterId: cluster.id })}
//         >
//           Get Kubeconfig
//         </DropdownMenu.Item>
//         {canDelete && (
//           <>
//             <DropdownMenu.Separator />
//             <DropdownMenu.Item
//               color="red"
//               icon={<Icon name={IconAwesomeEnum.TRASH} />}
//               onClick={() => removeCluster(cluster.id, cluster.name)}
//             >
//               Delete cluster
//             </DropdownMenu.Item>
//           </>
//         )}
//       </DropdownMenu.Content>
//     </DropdownMenu.Root>
//   )
// }

export interface EnvironmentActionToolbarProps {
  environmentId: string
}

export function EnvironmentActionToolbar({ environmentId }: EnvironmentActionToolbarProps) {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '' } = useParams()
  const { data: environment } = useEnvironment({ environmentId })

  return (
    <ActionToolbar.Root>
      <MenuManageDeployment projectId={projectId} environmentId={environmentId} />
      <Tooltip content="Logs">
        <ActionToolbar.Button onClick={() => navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId))}>
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ActionToolbar.Button>
      </Tooltip>
      {/* <MenuOtherActions organizationId={organizationId} cluster={cluster} clusterStatus={clusterStatus} /> */}
    </ActionToolbar.Root>
  )
}

export default EnvironmentActionToolbar
