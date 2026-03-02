import { type ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { InputToggle } from '@qovery/shared/ui'

export interface AutoDeploySettingProps {
  source: 'CONTAINER_REGISTRY' | 'GIT' | 'TERRAFORM'
  className?: string
  titleSuffix?: ReactNode
}

export function AutoDeploySetting({ source, className = '', titleSuffix }: AutoDeploySettingProps) {
  const { control } = useFormContext()

  const title = match(source)
    .with('TERRAFORM', () => 'Auto-deploy on new commits')
    .otherwise(() => 'Auto-deploy')

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
            title={
              titleSuffix ? (
                <span className="flex items-center gap-2">
                  {title}
                  {titleSuffix}
                </span>
              ) : (
                title
              )
            }
            description={match(source)
              .with('TERRAFORM', () => undefined)
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
