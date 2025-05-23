import {
  type CustomDomain,
  type HelmPortRequestPortsInner,
  type HelmResponseAllOfPorts,
  type ServicePort,
  ServiceTypeEnum,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type PortData } from '@qovery/shared/interfaces'

export const isTryingToRemoveLastPublicPort = (
  serviceType: ServiceTypeEnum,
  ports: ServicePort[] | HelmResponseAllOfPorts[] | HelmPortRequestPortsInner[] | undefined,
  currentPort: ServicePort | PortData | HelmPortRequestPortsInner,
  domains: CustomDomain[] | undefined
) => {
  // If no domains are associated with the service
  if (!domains || domains.length === 0) {
    return false
  }

  return match(serviceType)
    .with(ServiceTypeEnum.HELM, () => {
      return (
        ports?.filter((p) => currentPort && 'id' in currentPort && 'id' in p && p.id !== currentPort.id).length === 0
      )
    })
    .otherwise(() => {
      return (
        ports?.filter((p) => {
          return (
            currentPort &&
            'id' in currentPort &&
            'id' in p &&
            (('publicly_accessible' in p && p.publicly_accessible) || ('public' in p && p.public)) &&
            p.id !== currentPort.id
          )
        }).length === 0
      )
    })
}
