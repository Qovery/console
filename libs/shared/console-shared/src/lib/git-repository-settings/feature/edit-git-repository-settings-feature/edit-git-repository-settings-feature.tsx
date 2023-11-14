import { useCallback, useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { selectApplicationById } from '@qovery/domains/application'
import { isJob, isJobGitSource } from '@qovery/shared/enums'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type RootState } from '@qovery/state/store'
import GitRepositorySettings from '../../ui/git-repository-settings/git-repository-settings'

export function EditGitRepositorySettingsFeature() {
  const { applicationId = '' } = useParams()

  const application = useSelector<RootState, ApplicationEntity | undefined>(
    (state) => selectApplicationById(state, applicationId),
    (a, b) =>
      JSON.stringify(a?.git_repository) === JSON.stringify(b?.git_repository) ||
      (isJobGitSource(a?.source) &&
        isJobGitSource(b?.source) &&
        JSON.stringify(a?.source?.docker?.git_repository) === JSON.stringify(b?.source?.docker?.git_repository))
  )

  const getGitRepositoryFromApplication = useCallback(() => {
    return isJob(application) && isJobGitSource(application?.source)
      ? application?.source?.docker?.git_repository
      : application?.git_repository
  }, [application])

  const { setValue } = useFormContext<{
    provider: string
    repository: string | undefined
    branch: string | undefined
    root_path: string | undefined
  }>()

  const [gitDisabled, setGitDisabled] = useState(true)

  useEffect(() => {
    // Set default disabled values
    const gitRepository = getGitRepositoryFromApplication()
    if (gitDisabled) {
      setValue('provider', upperCaseFirstLetter(gitRepository?.provider))
      setValue('repository', gitRepository?.name ?? '')
      setValue('branch', gitRepository?.branch ?? '')
      setValue('root_path', undefined)
    }
  }, [gitDisabled, getGitRepositoryFromApplication, setValue])

  // Submit for modal with the dispatchs authProvider
  const editGitSettings = () => {
    setGitDisabled(false)
    // Reset fields except provider
    setValue('provider', getGitRepositoryFromApplication()?.provider ?? '')
    setValue('repository', undefined)
  }

  return (
    <GitRepositorySettings
      gitDisabled={gitDisabled}
      editGitSettings={editGitSettings}
      currentProvider={getGitRepositoryFromApplication()?.provider}
      currentRepository={getGitRepositoryFromApplication()?.name}
    />
  )
}

export default EditGitRepositorySettingsFeature
