import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { InputToggle } from '@qovery/shared/ui'

export interface AutoDeploySettingProps {
  source: 'CONTAINER_REGISTRY' | 'GIT' | 'TERRAFORM'
  className?: string
}

export function AutoDeploySetting({ source, className = '' }: AutoDeploySettingProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name="auto_deploy"
      control={control}
      render={({ field }) => {
        return (
          <InputToggle
            className={className}
            value={field.value}
            onChange={field.onChange}
            title="Auto-deploy"
            description={match(source)
              .with(
                'TERRAFORM',
                () => 'A terraform plan will be automatically triggered on every new commit on the branch.'
              )
              .with('GIT', () => 'The service will be automatically updated on every new commit on the branch.')
              .with(
                'CONTAINER_REGISTRY',
                () =>
                  'The service will be automatically updated if Qovery is notified on the API that a new image tag is available.'
              )
              .exhaustive()}
            forceAlignTop
            small
          />
        )
      }}
    />
  )
}

export default AutoDeploySetting
