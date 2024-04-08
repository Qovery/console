import {
  type OrganizationAnnotationsGroupResponse,
  OrganizationAnnotationsGroupScopeEnum,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { Button, Checkbox, Icon, InputText, InputTextSmall, ModalCrud } from '@qovery/shared/ui'
import { useCreateAnnotationsGroup } from '../hooks/use-create-annotations-group/use-create-annotations-group'
import { useEditAnnotationsGroup } from '../hooks/use-edit-annotations-group/use-edit-annotations-group'

type ScopeEnum = keyof typeof OrganizationAnnotationsGroupScopeEnum

// Convert scope for default values
export function convertScopeEnumToObject(scopes: OrganizationAnnotationsGroupScopeEnum[]): { [key: string]: boolean } {
  return Object.keys(OrganizationAnnotationsGroupScopeEnum).reduce((acc, key) => {
    acc[key] = scopes.includes(OrganizationAnnotationsGroupScopeEnum[key as ScopeEnum])
    return acc
  }, {} as { [key: string]: boolean })
}

export function convertScopeObjectToEnum(obj: { [key: string]: boolean }): OrganizationAnnotationsGroupScopeEnum[] {
  return Object.keys(obj)
    .filter((key) => obj[key])
    .map((key) => OrganizationAnnotationsGroupScopeEnum[key as ScopeEnum])
}

export interface AnnotationCreateEditModalProps {
  onClose: () => void
  organizationId: string
  isEdit?: boolean
  gitToken?: GitTokenResponse
}

export function AnnotationCreateEditModal({
  isEdit,
  gitToken,
  organizationId,
  onClose,
}: AnnotationCreateEditModalProps) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      type: gitToken?.type ?? GitProviderEnum.GITHUB,
      name: gitToken?.name ?? '',
      description: gitToken?.description ?? '',
      workspace: gitToken?.workspace ?? undefined,
      token: '',
    },
  })

  const { mutateAsync: editGitToken, isLoading: isLoadingEditGitToken } = useEditGitToken()
  const { mutateAsync: createGitToken, isLoading: isLoadingCreateGitToken } = useCreateGitToken()
  const gitType = methods.watch('type')

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      if (isEdit) {
        const response = await editGitToken({
          organizationId,
          gitTokenId: gitToken?.id ?? '',
          gitTokenRequest: data,
        })
        onClose()
      } else {
        const response = await createGitToken({
          organizationId,
          gitTokenRequest: data,
        })
        onClose()
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
            <ol className="list-disc ml-3 mb-2">
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

export default AnnotationCreateEditModal
