import { StateEnum } from 'qovery-typescript-axios'

export const hasPublicPort = (ingressDeploymentStatus?: StateEnum) => {
  return ingressDeploymentStatus && ['RUNNING', StateEnum.WAITING_RUNNING].includes(ingressDeploymentStatus)
}
