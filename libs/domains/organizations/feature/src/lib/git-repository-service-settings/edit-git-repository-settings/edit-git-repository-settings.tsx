import { type ApplicationGitRepository, type GitProviderEnum } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import GitRepositorySettings from '../git-repository-settings'

interface EditGitRepositorySettingsProps {
  organizationId: string
  gitRepository?: ApplicationGitRepository
  rootPathLabel?: string
  rootPathHint?: string
}

export function EditGitRepositorySettings({
  organizationId,
  gitRepository,
  rootPathHint,
  rootPathLabel,
}: EditGitRepositorySettingsProps) {
  const { setValue } = useFormContext<{
    provider: GitProviderEnum | undefined
    repository?: string
    branch?: ApplicationGitRepository['branch']
    root_path?: ApplicationGitRepository['root_path']
    git_token_name?: ApplicationGitRepository['git_token_name']
    git_token_id?: ApplicationGitRepository['git_token_id']
    git_repository?: ApplicationGitRepository
  }>()

  const [gitDisabled, setGitDisabled] = useState(true)

  useEffect(() => {
    // Set default disabled values
    if (gitDisabled) {
      setValue('provider', gitRepository?.provider)
      setValue('repository', gitRepository?.name ?? '')
      setValue('branch', gitRepository?.branch ?? '')
      setValue('root_path', gitRepository?.root_path ?? '/')
      setValue('git_token_name', gitRepository?.git_token_name ?? undefined)
      setValue('git_token_id', gitRepository?.git_token_id)
      setValue('git_repository', gitRepository)
    }
  }, [gitDisabled, gitRepository, setValue])

  // Submit for modal with the dispatchs authProvider
  const editGitSettings = () => {
    setGitDisabled(false)
    // Reset fields except provider
    setValue('provider', gitRepository?.provider)
    setValue('repository', undefined)
  }

  return (
    <GitRepositorySettings
      gitDisabled={gitDisabled}
      editGitSettings={editGitSettings}
      currentProvider={gitRepository?.provider}
      currentRepository={gitRepository?.name}
      urlRepository={gitRepository?.url}
      rootPathLabel={rootPathLabel}
      rootPathHint={rootPathHint}
      organizationId={organizationId}
    />
  )
}

export default EditGitRepositorySettings
