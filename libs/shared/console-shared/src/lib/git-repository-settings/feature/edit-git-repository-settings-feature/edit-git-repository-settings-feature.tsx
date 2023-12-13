import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useService } from '@qovery/domains/services/feature'
import { isHelmGitSource, isJobGitSource } from '@qovery/shared/enums'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import GitRepositorySettings from '../../ui/git-repository-settings/git-repository-settings'

export interface EditGitRepositorySettingsFeatureProps {
  withBlockWrapper?: boolean
}

export function EditGitRepositorySettingsFeature({ withBlockWrapper = true }: EditGitRepositorySettingsFeatureProps) {
  const { applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId })

  const gitRepository = match(service)
    .with({ serviceType: 'JOB' }, (job) => (isJobGitSource(job.source) ? job.source.docker?.git_repository : undefined))
    .with({ serviceType: 'APPLICATION' }, (application) => application.git_repository)
    .with({ serviceType: 'HELM' }, (helm) =>
      isHelmGitSource(helm.source) ? helm.source?.git?.git_repository : undefined
    )
    .otherwise(() => undefined)

  const { setValue } = useFormContext<{
    provider: string
    repository: string | undefined
    branch: string | undefined
    root_path: string | undefined
    git_token_name?: string
  }>()

  const [gitDisabled, setGitDisabled] = useState(true)

  useEffect(() => {
    // Set default disabled values
    if (gitDisabled) {
      setValue('provider', upperCaseFirstLetter(gitRepository?.provider))
      setValue('repository', gitRepository?.name ?? '')
      setValue('branch', gitRepository?.branch ?? '')
      setValue('root_path', undefined)
      setValue('git_token_name', gitRepository?.git_token_name ?? undefined)
    }
  }, [gitDisabled, gitRepository, setValue])

  // Submit for modal with the dispatchs authProvider
  const editGitSettings = () => {
    setGitDisabled(false)
    // Reset fields except provider
    setValue('provider', gitRepository?.provider ?? '')
    setValue('repository', undefined)
  }

  return (
    <GitRepositorySettings
      gitDisabled={gitDisabled}
      editGitSettings={editGitSettings}
      currentProvider={gitRepository?.provider}
      currentRepository={gitRepository?.name}
      withBlockWrapper={withBlockWrapper}
    />
  )
}

export default EditGitRepositorySettingsFeature
