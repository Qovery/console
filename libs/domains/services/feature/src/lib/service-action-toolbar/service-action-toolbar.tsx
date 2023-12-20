import { useNavigate, useParams } from 'react-router-dom'
import { useEnvironment } from '@qovery/domains/environments/feature'
import {
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_URL,
  AUDIT_LOGS_PARAMS_URL,
  ENVIRONMENT_LOGS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_URL,
  SERVICE_LOGS_URL,
} from '@qovery/shared/routes'
import {
  ActionToolbar,
  DropdownMenu,
  Icon,
  IconAwesomeEnum,
  Skeleton,
  Tooltip,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { isDeleteAvailable, isDeployAvailable, isRedeployAvailable, isStopAvailable } from '@qovery/shared/util-js'
import { useDeleteService } from '../hooks/use-delete-service/use-delete-service'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'
import { useDeploymentStatus } from '../hooks/use-deployment-status/use-deployment-status'
import { useRedeployService } from '../hooks/use-redeploy-service/use-redeploy-service'
import { useService } from '../hooks/use-service/use-service'
import { useStopService } from '../hooks/use-stop-service/use-stop-service'

export function ServiceActionToolbar({ serviceId }: { serviceId: string }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()
  const { openModalConfirmation } = useModalConfirmation()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })

  const { mutate: deployService } = useDeployService({ environmentId })
  const { mutate: redeployService } = useRedeployService({ environmentId })
  const { mutate: stopService } = useStopService({ environmentId })
  const { mutateAsync: deleteService } = useDeleteService({ environmentId })

  const [, copyToClipboard] = useCopyToClipboard()
  const copyContent = `Organization ID: ${organizationId}\nProject ID: ${projectId}\nEnvironment ID: ${environmentId}\nService ID: ${serviceId}`

  if (!service || !deploymentStatus) return <Skeleton height={32} width={115} />

  const mutationDelete = async () => {
    openModalConfirmation({
      title: 'Delete service',
      name: service.name,
      isDelete: true,
      action: async () => {
        try {
          await deleteService({ serviceId, serviceType: service.serviceType })
          navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const mutationDeploy = () => deployService({ serviceId, serviceType: service.serviceType })

  const mutationRedeploy = async () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm redeploy',
      description: 'To confirm the redeploy of your service, please type the name:',
      name: service.name,
      action: () => redeployService({ serviceId, serviceType: service.serviceType }),
    })
  }

  const mutationStop = async () => {
    openModalConfirmation({
      mode: environment?.mode,
      title: 'Confirm stop',
      description: 'To confirm the stopping of your service, please type the name:',
      name: service.name,
      action: () => stopService({ serviceId, serviceType: service.serviceType }),
    })
  }

  const menuManageDeployment = (
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
        {isDeployAvailable(deploymentStatus.state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.PLAY} />} onClick={mutationDeploy}>
            Deploy
          </DropdownMenu.Item>
        )}
        {isRedeployAvailable(deploymentStatus.state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.ROTATE_RIGHT} />} onClick={mutationRedeploy}>
            Redeploy
          </DropdownMenu.Item>
        )}
        {isStopAvailable(deploymentStatus.state) && (
          <DropdownMenu.Item icon={<Icon name={IconAwesomeEnum.CIRCLE_STOP} />} onClick={mutationStop}>
            Stop
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  const menuOtherActions = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <ActionToolbar.Button aria-label="Other actions">
          <Tooltip content="Other actions">
            <div className="flex items-center w-full h-full">
              <Icon name={IconAwesomeEnum.ELLIPSIS_V} />
            </div>
          </Tooltip>
        </ActionToolbar.Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.SCROLL} />}
          onClick={() =>
            navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId))
          }
        >
          Logs
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.COPY} />}
          onClick={() =>
            navigate(
              AUDIT_LOGS_PARAMS_URL(organizationId, {
                targetId: serviceId,
                targetType: service.serviceType,
                projectId,
                environmentId,
              })
            )
          }
        >
          See audit logs
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.CLOCK_ROTATE_LEFT} />}
          onClick={() => copyToClipboard(copyContent)}
        >
          Copy identifiers
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Icon name={IconAwesomeEnum.WHEEL} />}
          onClick={() =>
            navigate(
              `${APPLICATION_URL(organizationId, projectId, environmentId, serviceId)}${APPLICATION_SETTINGS_URL}`
            ) + APPLICATION_SETTINGS_GENERAL_URL
          }
        >
          Open settings
        </DropdownMenu.Item>
        {isDeleteAvailable(deploymentStatus.state) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red" icon={<Icon name={IconAwesomeEnum.TRASH} />} onClick={mutationDelete}>
              Delete service
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <ActionToolbar.Root>
      {menuManageDeployment}
      <Tooltip content="Logs">
        <ActionToolbar.Button
          onClick={() =>
            navigate(ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + SERVICE_LOGS_URL(serviceId))
          }
        >
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ActionToolbar.Button>
      </Tooltip>
      {menuOtherActions}
    </ActionToolbar.Root>
  )
}

export default ServiceActionToolbar
