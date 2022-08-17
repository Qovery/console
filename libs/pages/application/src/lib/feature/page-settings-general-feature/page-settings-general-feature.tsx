import equal from 'fast-deep-equal'
import {
  BuildModeEnum,
  BuildPackLanguageEnum,
  GitAuthProvider,
  GitRepository,
  GitRepositoryBranch,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { editApplication, getApplicationsState } from '@console/domains/application'
import {
  fetchAuthProvider,
  fetchBranches,
  fetchRepository,
  selectAllAuthProvider,
  selectAllBranch,
  selectAllRepository,
} from '@console/domains/organization'
import { ApplicationEntity } from '@console/shared/interfaces'
import { Icon } from '@console/shared/ui'
import { upperCaseFirstLetter } from '@console/shared/utils'
import { AppDispatch, RootState } from '@console/store/data'
import PageSettingsGeneral from '../../ui/page-settings-general/page-settings-general'

export const handleSubmit = (data: FieldValues, application: ApplicationEntity) => {
  const cloneApplication = Object.assign({}, application as ApplicationEntity)
  cloneApplication.name = data['name']
  cloneApplication.build_mode = data['build_mode']

  if (data['build_mode'] === BuildModeEnum.DOCKER) {
    cloneApplication.dockerfile_path = data['dockerfile_path']
    cloneApplication.buildpack_language = null
  } else {
    cloneApplication.buildpack_language = data['buildpack_language']
    cloneApplication.dockerfile_path = null
  }

  return cloneApplication
}

export function PageSettingsGeneralFeature() {
  const { organizationId = '', applicationId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => getApplicationsState(state).entities[applicationId],
    equal
  )
  const authProviders = useSelector<RootState, GitAuthProvider[]>(selectAllAuthProvider)
  const repositories = useSelector<RootState, GitRepository[]>(selectAllRepository)
  const branches = useSelector<RootState, GitRepositoryBranch[]>(selectAllBranch)

  const loadingStatus = useSelector((state: RootState) => getApplicationsState(state).loadingStatus)

  const [gitDisabled, setGitDisabled] = useState(true)

  const methods = useForm({
    mode: 'onChange',
  })

  const watchBuildMode = methods.watch('build_mode')
  const watchAuthProvider = methods.watch('provider')

  const onSubmit = methods.handleSubmit((data) => {
    if (data && application) {
      const cloneApplication = handleSubmit(data, application)

      dispatch(
        editApplication({
          applicationId: applicationId,
          data: cloneApplication,
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
    methods.setValue('provider', `${application?.git_repository?.provider} (${application?.git_repository?.owner})`)
    methods.setValue('repository', application?.git_repository?.name || undefined)
    methods.setValue('branch', application?.git_repository?.branch)
    methods.setValue('root_path', application?.git_repository?.root_path)
    methods.setValue('build_mode', application?.build_mode)
    methods.setValue(
      'buildpack_language',
      application?.buildpack_language ? application?.buildpack_language : BuildPackLanguageEnum.PYTHON
    )
    methods.setValue('dockerfile_path', application?.dockerfile_path ? application?.dockerfile_path : 'Dockerfile')
  }, [
    methods,
    application?.name,
    application?.build_mode,
    application?.buildpack_language,
    application?.dockerfile_path,
    application?.git_repository,
  ])

  useEffect(() => {
    dispatch(fetchAuthProvider({ organizationId }))
  }, [dispatch, organizationId])

  useEffect(() => {
    if (watchAuthProvider) {
      dispatch(fetchRepository({ organizationId, gitProvider: watchAuthProvider }))
      dispatch(fetchBranches({ organizationId, gitProvider: watchAuthProvider }))
      // methods.setValue('dockerfile_path', 'Dockerfile')
    }
  }, [dispatch, organizationId, watchAuthProvider, methods])

  const currentAuthProvider = `${upperCaseFirstLetter(application?.git_repository?.provider)} (${
    application?.git_repository?.owner
  })`

  return (
    <FormProvider {...methods}>
      <PageSettingsGeneral
        onSubmit={onSubmit}
        watchBuildMode={watchBuildMode}
        loading={loadingStatus === 'loading'}
        gitDisabled={gitDisabled}
        setGitDisabled={setGitDisabled}
        currentAuthProvider={currentAuthProvider}
        authProviders={
          !gitDisabled
            ? authProviders.map((provider: GitAuthProvider) => ({
                label: `${upperCaseFirstLetter(provider.name)} (${provider.owner})`,
                value: provider.name || '',
                icon: <Icon width="16px" height="16px" name={provider.name} />,
              }))
            : application && [
                {
                  label: currentAuthProvider,
                  value: `${application?.git_repository?.provider} (${application?.git_repository?.owner})`,
                  icon: <Icon width="16px" height="16px" name={application?.git_repository?.provider || ''} />,
                },
              ]
        }
        repositories={
          !gitDisabled
            ? repositories.map((repository: GitRepository) => ({
                label: upperCaseFirstLetter(repository.name) || '',
                value: repository.name || '',
              }))
            : application && [
                {
                  label: application?.git_repository?.name || '',
                  value: application?.git_repository?.name || '',
                },
              ]
        }
        branches={
          !gitDisabled
            ? branches.map((branch: GitRepositoryBranch) => ({
                label: upperCaseFirstLetter(branch.name) || '',
                value: branch.name || '',
              }))
            : application && [
                {
                  label: application?.git_repository?.branch || '',
                  value: application?.git_repository?.branch || '',
                },
              ]
        }
      />
    </FormProvider>
  )
}

export default PageSettingsGeneralFeature
