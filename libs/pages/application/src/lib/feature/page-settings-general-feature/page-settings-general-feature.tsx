import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRestart } from '@qovery/domains/application'
import { fetchOrganizationContainerRegistries, selectOrganizationById } from '@qovery/domains/organization'
import { ServiceTypeEnum, getServiceType, isApplication, isContainer, isJob } from '@qovery/shared/enums'
import { ApplicationEntity, OrganizationEntity } from '@qovery/shared/interfaces'
import { toastError } from '@qovery/shared/ui'
import { buildGitRepoUrl } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleGitApplicationSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application)
  cloneApplication.name = data['name']
  cloneApplication.description = data['description']

  if ('build_mode' in cloneApplication) {
    cloneApplication.build_mode = data['build_mode']

    if (data['build_mode'] === BuildModeEnum.DOCKER) {
      cloneApplication.dockerfile_path = data['dockerfile_path']
      cloneApplication.buildpack_language = null
    } else {
      cloneApplication.buildpack_language = data['buildpack_language']
      cloneApplication.dockerfile_path = null
    }

    const git_repository = {
      url: buildGitRepoUrl(data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
    }

    cloneApplication.git_repository = git_repository
  }

  return cloneApplication
}

export const handleContainerSubmit = (data: FieldValues, application: ApplicationEntity) => {
  return {
    ...application,
    name: data['name'],
    description: data['description'] || '',
    tag: data['image_tag'] || '',
    image_name: data['image_name'] || '',
    arguments: (data['cmd_arguments'] && data['cmd_arguments'].length && eval(data['cmd_arguments'])) || [],
    entrypoint: data['image_entry_point'] || '',
    registry_id: data['registry'] || '',
  }
}

export const handleJobSubmit = (data: FieldValues, application: ApplicationEntity): ApplicationEntity => {
  if (application.source?.docker) {
    const git_repository = {
      url: buildGitRepoUrl(data['provider'], data['repository']),
      branch: data['branch'],
      root_path: data['root_path'],
    }

    return {
      ...application,
      name: data['name'],
      description: data['description'],
      source: {
        docker: {
          git_repository,
          dockerfile_path: data['dockerfile_path'],
        },
      },
    }
  } else {
    return {
      ...application,
      name: data['name'],
      description: data['description'],
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
  const { applicationId = '', environmentId = '', organizationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    (a, b) =>
      a?.name === b?.name &&
      a?.description === b?.description &&
      a?.build_mode === b?.build_mode &&
      a?.buildpack_language === b?.buildpack_language &&
      a?.dockerfile_path === b?.dockerfile_path
  )
  const organization = useSelector<RootState, OrganizationEntity | undefined>((state) =>
    selectOrganizationById(state, organizationId)
  )
  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)

  const methods = useForm({
    mode: 'onChange',
  })

  const watchBuildMode = methods.watch('build_mode')

  const toasterCallback = () => {
    if (application) {
      dispatch(
        postApplicationActionsRestart({ applicationId, environmentId, serviceType: getServiceType(application) })
      )
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (data && application) {
      let cloneApplication: ApplicationEntity
      if (isApplication(application)) {
        cloneApplication = handleGitApplicationSubmit(data, application)
      } else if (isJob(application)) {
        cloneApplication = handleJobSubmit(data, application)
      } else {
        try {
          cloneApplication = handleContainerSubmit(data, application)
        } catch (e: any) {
          toastError(e, 'Invalid CMD array')
          return
        }
      }

      dispatch(
        editApplication({
          applicationId: applicationId,
          data: cloneApplication,
          serviceType: getServiceType(application),
          toasterCallback,
        })
      )
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
        methods.setValue('image_entry_point', application.entrypoint)
        methods.setValue(
          'cmd_arguments',
          application.arguments && application.arguments?.length ? JSON.stringify(application.arguments) : ''
        )
        methods.unregister('buildpack_language')
        methods.unregister('dockerfile_path')

        methods.unregister('build_mode')

        dispatch(fetchOrganizationContainerRegistries({ organizationId }))
      }
    }

    if (isJob(application)) {
      methods.setValue('description', application?.description)

      const serviceType = application?.source?.docker ? ServiceTypeEnum.APPLICATION : ServiceTypeEnum.CONTAINER
      methods.setValue('serviceType', serviceType)

      if (serviceType === ServiceTypeEnum.CONTAINER) {
        dispatch(fetchOrganizationContainerRegistries({ organizationId }))

        methods.setValue('registry', application?.source?.image?.registry_id)
        methods.setValue('image_name', application?.source?.image?.image_name)
        methods.setValue('image_tag', application?.source?.image?.tag)
      } else {
        methods.setValue('build_mode', BuildModeEnum.DOCKER)
        methods.setValue('dockerfile_path', application?.source?.docker?.dockerfile_path)
      }
    }
  }, [methods, application, dispatch, organizationId])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        watchBuildMode={watchBuildMode}
        loading={loadingStatus === 'loading'}
        type={application && getServiceType(application)}
        organization={organization}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
