import { BuildModeEnum, TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  type DatabaseGeneralData,
  type HelmGeneralData,
  type TerraformGeneralData,
} from '@qovery/domains/services/feature'
import { isHelmGitSource, isHelmRepositorySource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'
import { type ApplicationGeneralData, type JobGeneralData } from '@qovery/shared/interfaces'
import { joinArgsWithQuotes } from '@qovery/shared/util-js'

export type ServiceGeneralData =
  | ApplicationGeneralData
  | JobGeneralData
  | HelmGeneralData
  | TerraformGeneralData
  | DatabaseGeneralData

export function getServiceGeneralDefaultValues(service: AnyService): Partial<ServiceGeneralData> {
  const helmRepository = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmRepositorySource) }, ({ source }) => source.repository)
    .otherwise(() => undefined)

  const helmGit = match(service)
    .with({ serviceType: 'HELM', source: P.when(isHelmGitSource) }, ({ source }) => source.git?.git_repository)
    .otherwise(() => undefined)

  return match(service)
    .with({ serviceType: 'APPLICATION' }, (application) => ({
      auto_deploy: application.auto_deploy,
      dockerfile_path: application.dockerfile_path ?? 'Dockerfile',
      docker_target_build_stage: application.docker_target_build_stage,
      build_mode: application.build_mode,
      image_entry_point: application.entrypoint,
      cmd_arguments: application.arguments?.length ? joinArgsWithQuotes(application.arguments) : '',
      labels_groups: application.labels_groups?.map((group) => group.id),
      annotations_groups: application.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'CONTAINER' }, (container) => ({
      registry: container.registry?.id,
      image_name: container.image_name,
      image_tag: container.tag,
      image_entry_point: container.entrypoint,
      auto_deploy: container.auto_deploy,
      cmd_arguments: container.arguments?.length ? joinArgsWithQuotes(container.arguments) : '',
      labels_groups: container.labels_groups?.map((group) => group.id),
      annotations_groups: container.annotations_groups?.map((group) => group.id),
    }))
    .with({ serviceType: 'JOB' }, (job) => {
      const jobContainerSource = isJobContainerSource(job.source) ? job.source.image : undefined
      const schedule = match(job)
        .with({ job_type: 'CRON' }, (cronJob) => {
          const { cronjob } = cronJob.schedule
          return {
            cmd_arguments: cronjob?.arguments?.length ? joinArgsWithQuotes(cronjob?.arguments) : '',
            image_entry_point: cronjob?.entrypoint,
          }
        })
        .with({ job_type: 'LIFECYCLE' }, (lifecycleJob) => ({
          template_type: lifecycleJob.schedule.lifecycle_type,
        }))
        .exhaustive()

      return {
        auto_deploy: job.auto_deploy,
        build_mode: BuildModeEnum.DOCKER,
        dockerfile_path: isJobGitSource(job.source) ? job.source.docker?.dockerfile_path : 'Dockerfile',
        docker_target_build_stage: isJobGitSource(job.source)
          ? job.source.docker?.docker_target_build_stage
          : undefined,
        registry: jobContainerSource?.registry_id,
        image_name: jobContainerSource?.image_name,
        image_tag: jobContainerSource?.tag,
        labels_groups: job.labels_groups?.map((group) => group.id),
        annotations_groups: job.annotations_groups?.map((group) => group.id),
        ...schedule,
      }
    })
    .with({ serviceType: 'HELM' }, (helm) => ({
      source_provider: isHelmRepositorySource(helm.source) ? 'HELM_REPOSITORY' : 'GIT',
      repository: helmRepository?.repository?.id ?? helmGit?.url,
      chart_name: helmRepository?.chart_name,
      chart_version: helmRepository?.chart_version,
      auto_deploy: helm.auto_deploy,
      auto_preview: helm.auto_preview,
      allow_cluster_wide_resources: helm.allow_cluster_wide_resources,
      timeout_sec: helm.timeout_sec,
      arguments: joinArgsWithQuotes(helm.arguments),
    }))
    .with({ serviceType: 'TERRAFORM' }, (terraform) => ({
      auto_deploy: terraform.auto_deploy_config?.auto_deploy ?? terraform.auto_deploy,
      terraform_action:
        terraform.auto_deploy_config?.terraform_action ?? TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
    }))
    .with({ serviceType: 'DATABASE' }, (database) => ({
      type: database.type,
      mode: database.mode,
      version: database.version,
      accessibility: database.accessibility,
      labels_groups: database.labels_groups?.map((group) => group.id),
      annotations_groups: database.annotations_groups?.map((group) => group.id),
    }))
    .exhaustive()
}
