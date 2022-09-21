import { BuildModeEnum, BuildPackLanguageEnum } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState, postApplicationActionsRestart } from '@qovery/domains/application'
import { getServiceType } from '@qovery/shared/enums'
import { ApplicationEntity, GitApplicationEntity } from '@qovery/shared/interfaces'
import { buildGitRepoUrl } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store/data'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application)
  cloneApplication.name = data['name']

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

export function PageSettingsGeneralFeature() {
  const { applicationId = '', environmentId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    (a, b) =>
      a?.name === b?.name &&
      (a as GitApplicationEntity)?.build_mode === (b as GitApplicationEntity)?.build_mode &&
      (a as GitApplicationEntity)?.buildpack_language === (b as GitApplicationEntity)?.buildpack_language &&
      (a as GitApplicationEntity)?.dockerfile_path === (b as GitApplicationEntity)?.dockerfile_path
  )

  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)

  const methods = useForm({
    mode: 'onChange',
  })

  const watchBuildMode = methods.watch('build_mode')

  const toasterCallback = () => {
    dispatch(postApplicationActionsRestart({ applicationId, environmentId }))
  }

  const onSubmit = methods.handleSubmit((data) => {
    if (data && application) {
      const cloneApplication = handleSubmit(data, application)
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
    if (watchBuildMode === BuildModeEnum.DOCKER) {
      methods.setValue('dockerfile_path', 'Dockerfile')
    } else {
      methods.setValue('buildpack_language', BuildPackLanguageEnum.PYTHON)
    }
  }, [watchBuildMode, methods])

  useEffect(() => {
    methods.setValue('name', application?.name)
    if (application && 'build_mode' in application) {
      methods.setValue('build_mode', application?.build_mode)
      methods.setValue(
        'buildpack_language',
        application?.buildpack_language ? application?.buildpack_language : BuildPackLanguageEnum.PYTHON
      )
      methods.setValue('dockerfile_path', application?.dockerfile_path ? application?.dockerfile_path : 'Dockerfile')
    }
  }, [methods, application])

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        watchBuildMode={watchBuildMode}
        loading={loadingStatus === 'loading'}
        type={getServiceType(application)}
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
