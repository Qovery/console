import { DeploymentHistoryStatusEnum, StateEnum } from 'qovery-typescript-axios'
import { RunningStatus } from '@console/shared/enums'

export function renameStatus(value?: StateEnum | RunningStatus | DeploymentHistoryStatusEnum): string | undefined {
  if (value === StateEnum.RUNNING) {
    return 'Deployment OK'
  } else {
    return value
  }
}
