import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { type Application, type Container, type Job } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { ServiceTypeEnum, isContainerJob, isGitJob, isJobGitSource } from '@qovery/shared/enums'
// import { toastError } from '@qovery/shared/ui'
import { getGitTokenValue } from '@qovery/shared/util-git'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { type AppDispatch } from '@qovery/state/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleGitApplicationSubmit = (data: FieldValues, application: Application) => {
  let cloneApplication = Object.assign({}, application)
  cloneApplication.name = data['name']
  cloneApplication.description = data['description']
  cloneApplication.auto_deploy = data['auto_deploy']

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data['build_mode']

    if (data['build_mode'] === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data['dockerfile_path']
      cloneApplication.buildpack_language = null
    } else {
      cloneApplication.buildpack_language = data['buildpack_language']
      cloneApplication.dockerfile_path = null
    }

    const gitToken = getGitTokenValue(data['provider'])

    const git_repository = {
      url: buildGitRepoUrl(gitToken?.type ?? data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
      git_token_id: gitToken ? gitToken.id : application.git_repository?.git_token_id,
    }

    cloneApplication.git_repository = git_repository
  }

  cloneApplication = {
    ...cloneApplication,
    arguments: (data['cmd_arguments'] && data['cmd_arguments'].length && eval(data['cmd_arguments'])) || [],
    entrypoint: data['image_entry_point'] || '',
  }

  return cloneApplication
}

export const handleContainerSubmit = (data: FieldValues, container: Container) => {
  return {
    ...container,
    name: data['name'],
    description: data['description'] || '',
    auto_deploy: data['auto_deploy'],
    tag: data['image_tag'] || '',
    image_name: data['image_name'] || '',
    arguments: (data['cmd_arguments'] && data['cmd_arguments'].length && eval(data['cmd_arguments'])) || [],
    entrypoint: data['image_entry_point'] || '',
    registry: data['registry'] || '',
  }
}

export const handleJobSubmit = (data: FieldValues, job: Job) => {
  if (isJobGitSource(job.source)) {
    const gitToken = getGitTokenValue(data['provider'])

    const git_repository = {
      url: buildGitRepoUrl(gitToken?.type ?? data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
      git_token_id: gitToken ? gitToken.id : undefined,
    }

    return {
      ...job,
      name: data['name'],
      description: data['description'],
      auto_deploy: data['auto_deploy'],
      source: {
        docker: {
          git_repository,
          dockerfile_path: data['dockerfile_path'],
        },
      },
    }
  } else {
    return {
      ...job,
      name: data['name'],
      description: data['description'],
      auto_deploy: data['auto_deploy'],
      source: {
        image: {
          tag: data['image_tag'] || '',
          image_name: data['image_name'] || '',
          registry_id: data['registry'] || '',
        },
      },
    }
  }
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', environmentId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()

  const { data: organization } = useOrganization({ organizationId })
  const { data: service, isLoading: isLoadingService } = useService({ environmentId, serviceId: applicationId })
  const { mutate: editService } = useEditService({ environmentId })

  console.log('service: ', service?.serviceType)

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: service?.name,
      description: service?.description,
      auto_deploy: (service as Application)?.auto_deploy,
      build_mode: (service as Application)?.build_mode,
      buildpack_language: (service as Application)?.buildpack_language ?? BuildPackLanguageEnum.PYTHON,
      dockerfile_path: (service as Application)?.dockerfile_path ?? 'Dockerfile',
      registry: (service as Container)?.registry?.id,
      image_name: (service as Container)?.image_name,
      image_tag: (service as Container)?.tag,
      image_entry_point: (service as Application)?.entrypoint,
      cmd_arguments:
        (service as Application)?.arguments && (service as Application)?.arguments?.length
          ? JSON.stringify((service as Application).arguments)
          : '',
      // provider: service?.git_repository?.git_token_id,
      // repository: service?.git_repository?.url,
      // branch: service?.git_repository?.branch,
    },
  })

  const watchBuildMode = methods.watch('build_mode')

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) return

    return match(service)
      .with({ serviceType: ServiceTypeEnum.APPLICATION }, (service) => {
        const application = handleGitApplicationSubmit(data, service)
        editService({
          serviceId: applicationId,
          payload: application,
        })
      })
      .with({ serviceType: ServiceTypeEnum.JOB }, (service) => {
        const job = handleJobSubmit(data, service)
        editService({
          serviceId: applicationId,
          payload: job,
        })
      })
      .with({ serviceType: ServiceTypeEnum.CONTAINER }, (service) => {
        const container = handleContainerSubmit(data, service)
        editService({
          serviceId: applicationId,
          payload: container,
        })
      })
      .with({ serviceType: ServiceTypeEnum.HELM }, (service) => {
        editService({
          serviceId: applicationId,
          payload: service,
        })
      })
      .run()

    // if (data && service) {
    // let cloneApplication: Omit<AnyService, 'registry'> & { registry?: { id?: string } }
    // let cloneApplication: AnyService
    // if (service?.serviceType === ServiceTypeEnum.APPLICATION) {
    //   cloneApplication = handleGitApplicationSubmit(data, service)
    // }
    // if (service?.serviceType === ServiceTypeEnum.APPLICATION) {
    //   cloneApplication = handleGitApplicationSubmit(data, service)
    // }
    // if (service?.serviceType === ServiceTypeEnum.JOB) {
    //   cloneApplication = handleJobSubmit(data, service)
    // }
    // if (service?.serviceType === ServiceTypeEnum.CONTAINER) {
    //   try {
    //     cloneApplication = handleContainerSubmit(data, service)
    //   } catch (e: unknown) {
    //     toastError(e as Error, 'Invalid CMD array')
    //     return
    //   }
    // }
    // if (service?.serviceType) {
    // editService({
    //   serviceId: applicationId,
    //   payload: cloneApplication,
    // })
    // }
    // }
  })

  //  useEffect(() => {
  //     if (!service) return

  //     if (service.serviceType === ServiceTypeEnum.APPLICATION) {
  //       if (watchBuildMode === BuildModeEnum.DOCKER) {
  //         methods.setValue('dockerfile_path', service.dockerfile_path ? service.dockerfile_path : 'Dockerfile')
  //       } else {
  //         methods.setValue(
  //           'buildpack_language',
  //           service.buildpack_language ? service.buildpack_language : BuildPackLanguageEnum.PYTHON
  //         )
  //       }
  //     }
  //   }, [watchBuildMode, methods, service])>

  useEffect(() => {
    // methods.setValue('name', service?.name)
    // methods.setValue('description', service?.description)
    // methods.setValue('auto_deploy', (service as Application)?.auto_deploy)

    if (service) {
      // if (service.serviceType === ServiceTypeEnum.APPLICATION) {
      // methods.setValue('build_mode', service.build_mode)
      // methods.setValue(
      //   'buildpack_language',
      //   service.buildpack_language ? service.buildpack_language : BuildPackLanguageEnum.PYTHON
      // )
      // methods.setValue('dockerfile_path', service.dockerfile_path ? service.dockerfile_path : 'Dockerfile')
      // }

      if (service.serviceType === ServiceTypeEnum.CONTAINER) {
        // methods.setValue('registry', service.registry?.id)
        // methods.setValue('image_name', service.image_name)
        // methods.setValue('image_tag', service.tag)
        methods.unregister('buildpack_language')
        methods.unregister('dockerfile_path')
        methods.unregister('build_mode')
      }

      // methods.setValue('image_entry_point', (service as Application).entrypoint)
      // methods.setValue(
      //   'cmd_arguments',
      //   (service as Application).arguments && (service as Application).arguments?.length
      //     ? JSON.stringify((service as Application).arguments)
      //     : ''
      // )
    }

    if (service?.serviceType === ServiceTypeEnum.JOB) {
      // methods.setValue('description', service?.description)

      const serviceType = isJobGitSource(service?.source) ? ServiceTypeEnum.APPLICATION : ServiceTypeEnum.CONTAINER
      // methods.setValue('serviceType', serviceType)

      if (serviceType === ServiceTypeEnum.CONTAINER) {
        if (service && isContainerJob(service)) {
          // methods.setValue('registry', service.source.image.registry_id)
          methods.setValue('image_name', service.source.image.image_name)
          methods.setValue('image_tag', service.source.image.tag)
        }
      } else if (service && isGitJob(service)) {
        methods.setValue('build_mode', BuildModeEnum.DOCKER)
        // methods.setValue('dockerfile_path', service.source.docker.dockerfile_path)
      }
    }
  }, [methods, service, dispatch, organizationId])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        type={service?.serviceType}
        onSubmit={onSubmit}
        watchBuildMode={watchBuildMode}
        loading={isLoadingService}
        organization={organization}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
