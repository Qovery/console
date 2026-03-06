import { BuildModeEnum, TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { P, match } from 'ts-pattern'
import { useAnnotationsGroups, useLabelsGroups, useOrganization } from '@qovery/domains/organizations/feature'
import { type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { type HelmGeneralData } from '@qovery/pages/services'
import { isHelmGitSource, isHelmRepositorySource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { joinArgsWithQuotes } from '@qovery/shared/util-js'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'
import {
  handleContainerSubmit,
  handleGitApplicationSubmit,
  handleHelmSubmit,
  handleJobSubmit,
  handleTerraformSubmit,
} from './page-settings-general-payloads'

export function PageSettingsGeneralFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()

  const { data: organization } = useOrganization({ organizationId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })
  const { data: labelsGroups = [] } = useLabelsGroups({ organizationId })
  const { data: annotationsGroups = [] } = useAnnotationsGroups({ organizationId })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const helmRepository = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmRepositorySource) }, ({ source }) => source.repository)
    .otherwise(() => undefined)
  const helmGit = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmGitSource) }, ({ source }) => source.git?.git_repository)
    .otherwise(() => undefined)

  const defaultValues = match(service)
    .with({ serviceType: 'APPLICATION' }, (service) => ({
      auto_deploy: service.auto_deploy,
      dockerfile_path: service.dockerfile_path ?? 'Dockerfile',
      docker_target_build_stage: service.docker_target_build_stage,
      build_mode: service.build_mode,
      image_entry_point: service.entrypoint,
      cmd_arguments: service.arguments?.length ? joinArgsWithQuotes(service.arguments) : '',
      labels_groups: service.labels_groups?.map((group) => group.id),
      annotations_groups: service.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'CONTAINER' }, (service) => ({
      registry: service.registry?.id,
      image_name: service.image_name,
      image_tag: service.tag,
      image_entry_point: service.entrypoint,
      auto_deploy: service.auto_deploy,
      cmd_arguments: service.arguments?.length ? joinArgsWithQuotes(service.arguments) : '',
      labels_groups: service.labels_groups?.map((group) => group.id),
      annotations_groups: service.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'JOB' }, (service) => {
      const jobContainerSource = isJobContainerSource(service.source) ? service.source.image : undefined

      const schedule = match(service)
        .with({ job_type: 'CRON' }, (s) => {
          const { cronjob } = s.schedule
          return {
            cmd_arguments: cronjob?.arguments?.length ? joinArgsWithQuotes(cronjob?.arguments) : '',
            image_entry_point: cronjob?.entrypoint,
          }
        })
        .with({ job_type: 'LIFECYCLE' }, (s) => ({
          template_type: s.schedule.lifecycle_type,
        }))
        .exhaustive()

      return {
        auto_deploy: service.auto_deploy,
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: isJobGitSource(service.source) ? service.source.docker?.dockerfile_path : 'Dockerfile',
        docker_target_build_stage: isJobGitSource(service.source)
          ? service.source.docker?.docker_target_build_stage
          : undefined,
        registry: jobContainerSource?.registry_id,
        image_name: jobContainerSource?.image_name,
        image_tag: jobContainerSource?.tag,
        labels_groups: service.labels_groups?.map((group) => group.id),
        annotations_groups: service.annotations_groups?.map((group) => group.id),
        ...schedule,
      }
    })
    .with({ serviceType: 'HELM' }, (service) => ({
      source_provider: isHelmRepositorySource(service.source) ? 'HELM_REPOSITORY' : 'GIT',
      repository: helmRepository?.repository?.id ?? helmGit?.url,
      chart_name: helmRepository?.chart_name,
      chart_version: helmRepository?.chart_version,
      auto_deploy: service.auto_deploy,
      auto_preview: service.auto_preview,
      allow_cluster_wide_resources: service.allow_cluster_wide_resources,
      timeout_sec: service.timeout_sec,
      arguments: joinArgsWithQuotes(service.arguments),
    }))
    .with({ serviceType: 'TERRAFORM' }, (service) => ({
      auto_deploy: service.auto_deploy_config?.auto_deploy ?? service.auto_deploy,
      terraform_action:
        service.auto_deploy_config?.terraform_action ?? TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
    }))
    .otherwise(() => undefined)

  const methods = useForm<ApplicationGeneralData | JobGeneralData | HelmGeneralData | TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      icon_uri: service?.icon_uri,
      ...defaultValues,
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    const payload = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => {
        return {
          ...handleGitApplicationSubmit(data as ApplicationGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'JOB' }, (s) => {
        return {
          ...handleJobSubmit(data as JobGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'CONTAINER' }, (s) => {
        return {
          ...handleContainerSubmit(data as ApplicationGeneralData, s, labelsGroups, annotationsGroups),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'HELM' }, (s) => {
        return {
          ...handleHelmSubmit(data as HelmGeneralData, s),
          serviceType: s.serviceType,
        }
      })
      .with({ serviceType: 'TERRAFORM' }, (s) => {
        return {
          ...handleTerraformSubmit(data as TerraformGeneralData, s),
          serviceType: s.serviceType,
        }
      })
      .otherwise(() => undefined)

    if (!payload) return null

    if (data.is_public_repository) {
      if ('auto_deploy_config' in payload) {
        payload.auto_deploy_config = {
          ...payload.auto_deploy_config,
          auto_deploy: false,
        }
      } else if ('auto_deploy' in payload) {
        payload.auto_deploy = false
      }
    }

    editService({
      serviceId: applicationId,
      payload,
    })

    return
  })

  return (
    <FormProvider {...methods}>
      {service && (
        <PageSettingsGeneral
          service={service}
          isLoadingEditService={isLoadingEditService}
          onSubmit={onSubmit}
          organization={organization}
        />
      )}
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
