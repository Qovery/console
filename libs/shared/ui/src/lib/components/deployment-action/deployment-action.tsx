import {
  type DeploymentHistoryTriggerAction,
  ServiceActionStatusEnum,
  type ServiceSubActionEnum,
  StateEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import Icon from '../icon/icon'

export const getDeploymentAction = (
  status: StateEnum | ServiceActionStatusEnum | DeploymentHistoryTriggerAction | ServiceSubActionEnum | undefined
) => {
  return match(status)
    .with(
      StateEnum.QUEUED,
      StateEnum.WAITING_RUNNING,
      StateEnum.DEPLOYING,
      StateEnum.DEPLOYED,
      StateEnum.DEPLOYMENT_ERROR,
      StateEnum.DEPLOYMENT_QUEUED,
      // Other states categorized as "deploy"
      StateEnum.BUILDING,
      StateEnum.BUILD_ERROR,
      StateEnum.CANCELING,
      StateEnum.CANCELED,
      StateEnum.EXECUTING,
      StateEnum.READY,
      StateEnum.RECAP,
      undefined,
      () => ({
        status: 'Deploy',
        icon: <Icon iconStyle="regular" iconName="rocket" />,
      })
    )
    .with(
      StateEnum.RESTARTED,
      StateEnum.RESTARTING,
      StateEnum.RESTART_ERROR,
      StateEnum.RESTART_QUEUED,
      StateEnum.WAITING_RESTARTING,
      () => ({
        status: 'Restart',
        icon: <Icon iconStyle="regular" iconName="arrow-rotate-right" />,
      })
    )
    .with(
      StateEnum.DELETED,
      StateEnum.DELETE_ERROR,
      StateEnum.DELETE_QUEUED,
      StateEnum.DELETING,
      StateEnum.WAITING_DELETING,
      () => ({
        status: 'Delete',
        icon: <Icon iconStyle="regular" iconName="trash-can" />,
      })
    )
    .with(
      StateEnum.STOPPED,
      StateEnum.STOPPING,
      StateEnum.STOP_ERROR,
      StateEnum.STOP_QUEUED,
      StateEnum.WAITING_STOPPING,
      () => ({
        status: 'Stop',
        icon: <Icon iconStyle="regular" iconName="circle-stop" />,
      })
    )
    .with(
      ServiceActionStatusEnum.ONGOING,
      ServiceActionStatusEnum.SUCCESS,
      ServiceActionStatusEnum.ERROR,
      ServiceActionStatusEnum.NEVER,
      () => ({
        status: 'Deploy',
        icon: <Icon iconStyle="regular" iconName="rocket" />,
      })
    )
    .with('DELETE', 'UNINSTALL', 'DELETE_RESOURCES_ONLY', () => ({
      status: 'Delete',
      icon: <Icon iconStyle="regular" iconName="trash-can" />,
    }))
    .with('RESTART', () => ({
      status: 'Restart',
      icon: <Icon iconStyle="regular" iconName="arrow-rotate-right" />,
    }))
    .with('STOP', () => ({
      status: 'Stop',
      icon: <Icon iconStyle="regular" iconName="circle-stop" />,
    }))
    .with('UNKNOWN', 'NONE', 'DEPLOY', 'DEPLOY_DRY_RUN', 'TERRAFORM_PLAN_ONLY', 'TERRAFORM_PLAN_AND_APPLY', () => ({
      status: 'Deploy',
      icon: <Icon iconStyle="regular" iconName="rocket" />,
    }))
    .with('TERRAFORM_MIGRATE_STATE', () => ({
      status: 'Migrate state',
      icon: <Icon iconStyle="regular" iconName="file-export" />,
    }))
    .with('TERRAFORM_DESTROY', () => ({
      status: 'Destroy',
      icon: <Icon iconStyle="regular" iconName="fire" />,
    }))
    .with('TERRAFORM_FORCE_UNLOCK_STATE', 'TERRAFORM_FORCE_UNLOCK', () => ({
      status: 'Force unlock',
      icon: <Icon iconStyle="regular" iconName="unlock" />,
    }))
    .exhaustive()
}

export const DeploymentAction = ({
  status,
}: {
  status: StateEnum | ServiceActionStatusEnum | DeploymentHistoryTriggerAction | ServiceSubActionEnum | undefined
}) => {
  const action = getDeploymentAction(status)
  if (!status || !action) return null

  return (
    <div className="flex items-center gap-2">
      {action.icon}
      <span className="text-sm text-neutral">{action.status}</span>
    </div>
  )
}
