import { useParams } from '@tanstack/react-router'
import { type GitProviderEnum, type GitRepository } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { Button, Heading, Section } from '@qovery/shared/ui'
import { type AgenticWorkflowGitRepository } from '../../agentic-workflow-context'

interface GitContextForm {
  provider?: keyof typeof GitProviderEnum | string | null
  is_public_repository?: boolean
  repository: string
  branch: string
  git_token_name?: string | null
  git_token_id?: string | null
  git_repository?: GitRepository
}

export function GitContextModal({
  editLabel = 'Save',
  context,
  onRemove,
  onSave,
  setOpen,
}: {
  context?: AgenticWorkflowGitRepository
  editLabel?: string
  onRemove?: () => void
  onSave: (context: AgenticWorkflowGitRepository) => void
  setOpen?: (open: boolean) => void
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const methods = useForm<GitContextForm>({
    defaultValues: {
      provider: context?.provider,
      is_public_repository: context?.isPublicRepository,
      repository: context?.repository ?? '',
      branch: context?.branch ?? '',
      git_token_name: context?.gitTokenName,
      git_token_id: context?.gitTokenId,
      git_repository: context?.gitRepository,
    },
    mode: 'onChange',
  })
  const provider = methods.watch('provider') as keyof typeof GitProviderEnum | undefined
  const gitTokenId = methods.watch('git_token_id') ?? undefined
  const repository = methods.watch('repository')
  const isPublicRepository = methods.watch('is_public_repository')
  const close = () => setOpen?.(false)

  return (
    <FormProvider {...methods}>
      <Section className="gap-5 p-5">
        <div className="flex flex-col gap-1 pr-8">
          <Heading level={2} className="text-xl font-medium leading-7 text-neutral">
            {context ? 'Edit Git repository' : 'Add from Git repository'}
          </Heading>
          <p className="text-sm leading-5 text-neutral-subtle">
            Link a repository so the agent can use its code and documentation as context.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <GitProviderSetting organizationId={organizationId} portal />
          {isPublicRepository ? (
            <GitPublicRepositorySettings hideRootPath />
          ) : (
            <>
              {provider ? (
                <GitRepositorySetting
                  organizationId={organizationId}
                  gitProvider={provider}
                  gitTokenId={gitTokenId}
                  portal
                />
              ) : null}
              {provider && repository ? (
                <GitBranchSettings
                  organizationId={organizationId}
                  gitProvider={provider}
                  gitTokenId={gitTokenId}
                  hideRootPath
                  portal
                />
              ) : null}
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            {onRemove ? (
              <Button type="button" variant="plain" color="red" size="md" onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="plain" color="neutral" size="md" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              size="md"
              onClick={methods.handleSubmit((values) => {
                onSave({
                  provider: values.provider,
                  gitTokenId: values.git_token_id,
                  gitTokenName: values.git_token_name,
                  isPublicRepository: values.is_public_repository,
                  repository: values.repository,
                  gitRepository: values.git_repository,
                  branch: values.branch,
                })
                close()
              })}
            >
              {context ? editLabel : 'Add repository'}
            </Button>
          </div>
        </div>
      </Section>
    </FormProvider>
  )
}
