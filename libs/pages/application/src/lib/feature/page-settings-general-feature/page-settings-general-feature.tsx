import { useQueryClient } from '@tanstack/react-query'
import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { editApplication, postApplicationActionsRedeploy } from '@qovery/domains/application'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { type AnyService, type Application, type Container, type Job } from '@qovery/domains/services/data-access'
import { useService } from '@qovery/domains/services/feature'
import {
  ServiceTypeEnum,
  isApplication,
  isContainer,
  isContainerJob,
  isGitJob,
  isJob,
  isJobGitSource,
} from '@qovery/shared/enums'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { toastError } from '@qovery/shared/ui'
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
    registry: { id: data['registry'] || '' },
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
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const queryClient = useQueryClient()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { data: service, isLoading: isLoadingService } = useService({ environmentId, serviceId: applicationId })
  const { data: organization } = useOrganization({ organizationId })

  const methods = useForm({
    mode: 'onChange',
  })

  const watchBuildMode = methods.watch('build_mode')

  const toasterCallback = () => {
    if (service) {
      dispatch(
        postApplicationActionsRedeploy({
          applicationId,
          environmentId,
          serviceType: service.serviceType,
          callback: () =>
            navigate(
              ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) + DEPLOYMENT_LOGS_URL(applicationId)
            ),
          queryClient,
        })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (data && service) {
      let cloneApplication: Omit<AnyService, 'registry'> & { registry?: { id?: string } }

      if (service?.serviceType === ServiceTypeEnum.APPLICATION) {
        cloneApplication = handleGitApplicationSubmit(data, service)
      }

      if (service?.serviceType === ServiceTypeEnum.APPLICATION) {
        cloneApplication = handleGitApplicationSubmit(data, service)
      }

      if (service?.serviceType === ServiceTypeEnum.JOB) {
        cloneApplication = handleJobSubmit(data, service)
      } else {
        try {
          cloneApplication = handleContainerSubmit(data, service)
        } catch (e: unknown) {
          toastError(e as Error, 'Invalid CMD array')
          return
        }
      }

      if (service?.serviceType) {
        dispatch(
          editApplication({
            applicationId: applicationId,
            data: cloneApplication,
            serviceType: service.serviceType as ServiceTypeEnum,
            toasterCallback,
            queryClient,
          })
        )
      }
    }
  })

  useEffect(() => {
    if (!application) return

    if (isApplication(application)) {
      if (watchBuildMode === BuildModeEnum.DOCKER) {
        methods.setValue('dockerfile_path', application.dockerfile_path ? application.dockerfile_path : 'Dockerfile')
      } else {
        methods.setValue(
          'buildpack_language',
          application.buildpack_language ? application.buildpack_language : BuildPackLanguageEnum.PYTHON
        )
      }
    }
  }, [watchBuildMode, methods, application])

  useEffect(() => {
    methods.setValue('name', application?.name)
    methods.setValue('description', application?.description)
    methods.setValue('auto_deploy', application?.auto_deploy)

    if (application) {
      if (isApplication(application)) {
        methods.setValue('build_mode', application.build_mode)
        methods.setValue(
          'buildpack_language',
          application.buildpack_language ? application.buildpack_language : BuildPackLanguageEnum.PYTHON
        )
        methods.setValue('dockerfile_path', application.dockerfile_path ? application.dockerfile_path : 'Dockerfile')
      }

      if (isContainer(application)) {
        methods.setValue('registry', application.registry?.id)
        methods.setValue('image_name', application.image_name)
        methods.setValue('image_tag', application.tag)
        methods.unregister('buildpack_language')
        methods.unregister('dockerfile_path')

        methods.unregister('build_mode')
      }

      methods.setValue('image_entry_point', application.entrypoint)
      methods.setValue(
        'cmd_arguments',
        application.arguments && application.arguments?.length ? JSON.stringify(application.arguments) : ''
      )
    }

    if (isJob(application)) {
      methods.setValue('description', application?.description)

      const serviceType = isJobGitSource(application?.source) ? ServiceTypeEnum.APPLICATION : ServiceTypeEnum.CONTAINER
      methods.setValue('serviceType', serviceType)

      if (serviceType === ServiceTypeEnum.CONTAINER) {
        if (application && isContainerJob(application)) {
          methods.setValue('registry', application.source.image.registry_id)
          methods.setValue('image_name', application.source.image.image_name)
          methods.setValue('image_tag', application.source.image.tag)
        }
      } else if (application && isGitJob(application)) {
        methods.setValue('build_mode', BuildModeEnum.DOCKER)
        methods.setValue('dockerfile_path', application.source.docker.dockerfile_path)
      }
    }
  }, [methods, application, dispatch, organizationId])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        watchBuildMode={watchBuildMode}
        loading={isLoadingService}
        type={service?.serviceType}
        organization={organization}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
