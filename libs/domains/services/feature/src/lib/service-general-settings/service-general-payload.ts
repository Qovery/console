import {
  type OrganizationAnnotationsGroupResponse,
  type OrganizationLabelsGroupEnrichedResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  type DatabaseGeneralData,
  type HelmGeneralData,
  type TerraformGeneralData,
  handleContainerSubmit,
  handleGitApplicationSubmit,
  handleHelmSubmit,
  handleJobSubmit,
  handleTerraformSubmit,
} from '@qovery/domains/services/feature'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { type ServiceGeneralData } from './service-general-default-values'

export function buildServiceGeneralPayload({
  service,
  data,
  labelsGroups,
  annotationsGroups,
}: {
  service: AnyService
  data: ServiceGeneralData
  labelsGroups: OrganizationLabelsGroupEnrichedResponse[]
  annotationsGroups: OrganizationAnnotationsGroupResponse[]
}) {
  const payload = match(service)
    .with({ serviceType: 'APPLICATION' }, (application) => ({
      ...handleGitApplicationSubmit(data as ApplicationGeneralData, application, labelsGroups, annotationsGroups),
      serviceType: application.serviceType,
    }))
    .with({ serviceType: 'JOB' }, (job) => ({
      ...handleJobSubmit(data as JobGeneralData, job, labelsGroups, annotationsGroups),
      serviceType: job.serviceType,
    }))
    .with({ serviceType: 'CONTAINER' }, (container) => ({
      ...handleContainerSubmit(data as ApplicationGeneralData, container, labelsGroups, annotationsGroups),
      serviceType: container.serviceType,
    }))
    .with({ serviceType: 'HELM' }, (helm) => ({
      ...handleHelmSubmit(data as HelmGeneralData, helm),
      serviceType: helm.serviceType,
    }))
    .with({ serviceType: 'TERRAFORM' }, (terraform) => ({
      ...handleTerraformSubmit(data as TerraformGeneralData, terraform),
      serviceType: terraform.serviceType,
    }))
    .with({ serviceType: 'DATABASE' }, (database) => {
      const { annotations_groups, labels_groups, ...request } = data as DatabaseGeneralData
      return buildEditServicePayload({
        service: database,
        request: {
          ...request,
          labels_groups: labelsGroups.filter((group) => labels_groups?.includes(group.id)),
          annotations_groups: annotationsGroups.filter((group) => annotations_groups?.includes(group.id)),
        },
      })
    })
    .exhaustive()

  if ('is_public_repository' in data && data.is_public_repository) {
    if ('auto_deploy_config' in payload) {
      payload.auto_deploy_config = {
        ...payload.auto_deploy_config,
        auto_deploy: false,
      }
    } else if ('auto_deploy' in payload) {
      payload.auto_deploy = false
    }
  }

  return payload
}
