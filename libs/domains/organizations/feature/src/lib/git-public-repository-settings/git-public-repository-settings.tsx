import { Controller, useFormContext } from 'react-hook-form'
import { ExternalLink, InputText } from '@qovery/shared/ui'
import { Callout, Icon } from '@qovery/shared/ui'
import { guessGitProvider } from '@qovery/shared/util-git'

export interface GitPublicRepositorySettingsProps {
  disabled?: boolean
  hideRootPath?: boolean
  urlRepository?: string
}

export function GitPublicRepositorySettings({
  disabled = false,
  urlRepository,
  hideRootPath,
}: GitPublicRepositorySettingsProps) {
  const { control, setValue } = useFormContext()

  const onRepositoryChange = (value: string) => {
    const provider = guessGitProvider(value)
    if (provider) {
      setValue('provider', provider)
    }
  }

  return (
    <>
      <Controller
        name="repository"
        control={control}
        rules={{
          required: 'Repository required',
          validate: (input) =>
            // eslint-disable-next-line no-useless-escape
            input.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+.git$/gm) !==
              null || 'URL must be valid, start with «http(s)://» and end with «.git»',
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <InputText
              label="Public repository URL (.git)"
              name={field.name}
              onChange={(e) => {
                field.onChange(e)
                onRepositoryChange(e.target.value)
              }}
              value={field.value}
              error={error?.message}
              disabled={disabled}
            />
            {urlRepository && (
              <ExternalLink className="ml-4" size="xs" href={urlRepository}>
                Go to repository
              </ExternalLink>
            )}
          </div>
        )}
      />
      <Controller
        name="branch"
        control={control}
        rules={{
          required: 'Branch required',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Branch"
            name={field.name}
            onChange={(event) => {
              event.target.value = event.target.value.trim()
              field.onChange(event)
            }}
            value={field.value}
            error={error?.message}
            disabled={disabled}
          />
        )}
      />
      {!hideRootPath && (
        <>
          <div>
            <Controller
              name="root_path"
              control={control}
              defaultValue="/"
              rules={{
                required: 'Value required',
              }}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  label="Root service path"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  error={error?.message}
                  disabled={disabled}
                />
              )}
            />
            <p className="ml-4 mt-1 text-xs text-neutral-350">
              Provide the path in the repository where the service is located
            </p>
          </div>
          <Callout.Root color="sky" className="items-center text-xs">
            <Callout.Icon>
              <Icon iconName="info-circle" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              Git automations are disabled when using public repos (auto-deploy, automatic preview environments)
            </Callout.Text>
          </Callout.Root>
        </>
      )}
    </>
  )
}

export default GitPublicRepositorySettings
