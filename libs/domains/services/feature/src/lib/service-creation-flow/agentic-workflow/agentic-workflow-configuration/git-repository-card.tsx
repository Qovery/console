import { useParams } from '@tanstack/react-router'
import { type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { GitBranchSettings, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
import { Button } from '@qovery/shared/ui'
import { type AgenticWorkflowGitRepository } from '../agentic-workflow-context'

export function GitRepositoryCard({
  index,
  onChange,
  onRemove,
  repository,
}: {
  index: number
  onChange: (repository: AgenticWorkflowGitRepository) => void
  onRemove: () => void
  repository: AgenticWorkflowGitRepository
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const methods = useForm<{
    provider?: keyof typeof GitProviderEnum | string | null
    is_public_repository?: boolean
    repository: string
    branch: string
    git_token_name?: string | null
    git_token_id?: string | null
    git_repository?: GitRepository
  }>({
    defaultValues: {
      provider: repository.provider,
      is_public_repository: repository.isPublicRepository,
      repository: repository.repository,
      branch: repository.branch,
      git_token_name: repository.gitTokenName,
      git_token_id: repository.gitTokenId,
      git_repository: repository.gitRepository,
    },
    mode: 'onChange',
  })
  const provider = methods.watch('provider') as keyof typeof GitProviderEnum | undefined
  const watchedRepository = methods.watch('repository')
  const gitTokenId = methods.watch('git_token_id') ?? undefined
  const isPublicRepository = methods.watch('is_public_repository')

  useEffect(() => {
    const subscription = methods.watch((values) => {
      onChange({
        provider: values.provider,
        gitTokenId: values.git_token_id,
        gitTokenName: values.git_token_name,
        isPublicRepository: values.is_public_repository,
        repository: values.repository ?? '',
        gitRepository: values.git_repository as GitRepository | undefined,
        branch: values.branch ?? '',
      })
    })

    return () => subscription.unsubscribe()
  }, [methods, onChange])

  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral">Repository {index + 1}</span>
        <Button type="button" variant="plain" color="neutral" size="md" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <FormProvider {...methods}>
        <div className="flex flex-col gap-3">
          <GitProviderSetting organizationId={organizationId} />
          {isPublicRepository ? null : (
            <>
              {provider && (
                <GitRepositorySetting organizationId={organizationId} gitProvider={provider} gitTokenId={gitTokenId} />
              )}
              {provider && watchedRepository && (
                <GitBranchSettings
                  organizationId={organizationId}
                  gitProvider={provider}
                  gitTokenId={gitTokenId}
                  hideRootPath
                />
              )}
            </>
          )}
        </div>
      </FormProvider>
    </div>
  )
}
