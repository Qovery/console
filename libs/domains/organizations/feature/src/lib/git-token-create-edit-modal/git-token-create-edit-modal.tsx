import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { GitProviderEnum, type GitTokenRequest, type GitTokenResponse } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { ExternalLink, Icon, InputSelect, InputText, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useCreateGitToken } from '../hooks/use-create-git-token/use-create-git-token'
import { useEditGitToken } from '../hooks/use-edit-git-token/use-edit-git-token'

export interface GitTokenCreateEditModalProps {
  onClose: (response?: GitTokenResponse) => void
  organizationId: string
  isEdit?: boolean
  gitToken?: GitTokenResponse
}

export function GitTokenCreateEditModal({ isEdit, gitToken, organizationId, onClose }: GitTokenCreateEditModalProps) {
  const isGitlabSelfHostedFFEnabled = useFeatureFlagVariantKey('gitlab-self-hosted')
  const { enableAlertClickOutside } = useModal()
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      id: gitToken?.id ?? '',
      type: gitToken?.type ?? GitProviderEnum.GITHUB,
      name: gitToken?.name ?? '',
      description: gitToken?.description ?? '',
      workspace: gitToken?.workspace ?? undefined,
      token: '',
      hosting: gitToken?.git_api_url
        ? gitToken?.git_api_url === 'https://gitlab.com'
          ? 'GITLAB'
          : 'SELF_HOSTED'
        : 'GITLAB',
      git_api_url: gitToken?.git_api_url ?? '',
    },
  })

  methods.watch(() => enableAlertClickOutside(methods.formState.isDirty))

  const { mutateAsync: editGitToken, isLoading: isLoadingEditGitToken } = useEditGitToken()
  const { mutateAsync: createGitToken, isLoading: isLoadingCreateGitToken } = useCreateGitToken()
  const gitType = methods.watch('type')
  const hosting = methods.watch('hosting')

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      const { hosting, ...data } = values
      const gitTokenRequest: GitTokenRequest = {
        ...data,
        git_api_url: hosting === 'SELF_HOSTED' ? data.git_api_url : undefined,
      }

      if (isEdit) {
        const response = await editGitToken({
          organizationId,
          gitTokenId: gitToken?.id ?? '',
          gitTokenRequest,
        })
        onClose(response)
      } else {
        const response = await createGitToken({
          organizationId,
          gitTokenRequest,
        })
        onClose(response)
      }
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={isEdit ? 'Edit git token' : 'Add git token'}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isLoadingEditGitToken || isLoadingCreateGitToken}
        isEdit={isEdit}
        howItWorks={
          <>
            <p>
              Git tokens allow Qovery to access any git repository within your git organization. By default Qovery uses
              your own git account to retrieve the access but if you want to manage the accesses in a centralized way,
              create dedicated git tokens.
            </p>
            <p>How to configure it:</p>
            <ol className="mb-2 ml-3 list-disc">
              <li>
                Create a token within your git account (procedures depends on the git provider, see linked
                documentation)
              </li>
              <li>Add the token within this page</li>
              <li>
                When creating an application from a git provider, select the git token you want to use to access the
                repository.
              </li>
            </ol>
            <p className="mb-2">A workspace is necessary for bitbucket tokens</p>
            <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/organization/git-repository-access">
              Documentation
            </ExternalLink>
          </>
        }
      >
        {isEdit && (
          <Controller
            name="id"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-5"
                label="Qovery ID"
                name={field.name}
                value={field.value}
                error={error?.message}
                disabled
                hint="This is the ID to be used to interact with Qovery via the API, CLI or Terraform"
              />
            )}
          />
        )}
        <Controller
          name="type"
          control={methods.control}
          rules={{
            required: 'Please enter a git type.',
          }}
          render={({ field, fieldState: { error } }) => (
            <div className="mb-5">
              <InputSelect
                label="Type"
                onChange={(event) => {
                  field.onChange(event)
                  methods.setValue('workspace', undefined)
                }}
                value={field.value}
                error={error?.message}
                options={Object.keys(GitProviderEnum).map((key) => ({
                  label: upperCaseFirstLetter(key),
                  value: key,
                  icon: <Icon name={key} width="16px" height="16px" />,
                }))}
                portal
              />
            </div>
          )}
        />
        {gitType === GitProviderEnum.GITLAB && isGitlabSelfHostedFFEnabled && (
          <Controller
            name="hosting"
            control={methods.control}
            rules={{
              required: 'Please select the hosting provider.',
            }}
            render={({ field, fieldState: { error } }) => (
              <div className="mb-5">
                <InputSelect
                  label="Hosting type"
                  onChange={(event) => {
                    field.onChange(event)
                  }}
                  value={field.value}
                  error={error?.message}
                  options={[
                    {
                      label: 'Gitlab.com',
                      value: 'GITLAB',
                      icon: <Icon name="GITLAB" width="16px" height="16px" />,
                    },
                    {
                      label: 'Self-hosted',
                      value: 'SELF_HOSTED',
                      icon: <Icon name="GITLAB" width="16px" height="16px" />,
                    },
                  ]}
                  portal
                />
              </div>
            )}
          />
        )}
        {gitType === GitProviderEnum.GITLAB && hosting === 'SELF_HOSTED' && (
          <Controller
            name="git_api_url"
            control={methods.control}
            rules={{
              required: 'Please enter a correct URL.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-5"
                label="Gitlab host URL"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                hint="This is the URL of your self-hosted Gitlab instance. It should be in the format https://gitlab.example.com"
              />
            )}
          />
        )}

        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a token name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-5"
              label="Token name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={methods.control}
          render={({ field, fieldState: { error } }) => (
            <InputTextArea
              className="mb-5"
              label="Description"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="token"
          control={methods.control}
          rules={{
            required: true,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-5"
              label="Token value"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        {gitType === GitProviderEnum.BITBUCKET && (
          <Controller
            name="workspace"
            control={methods.control}
            rules={{
              required: 'Please enter a correct workspace.',
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                className="mb-5"
                label="Workspace"
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
              />
            )}
          />
        )}
      </ModalCrud>
    </FormProvider>
  )
}

export default GitTokenCreateEditModal
