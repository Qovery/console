import { StateEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

export const hasPublicPort = (ingressDeploymentStatus?: StateEnum) => {
  return match(ingressDeploymentStatus)
    .with(StateEnum.DEPLOYED, () => true)
    .with(StateEnum.WAITING_RUNNING, () => true)
    .otherwise(() => false)
}
