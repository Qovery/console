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
    .with('CONTAINER_REGISTRY', () => 'Auto-deploy on new image tag')
    .otherwise(() => 'Auto-deploy on new commits')

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
            forceAlignTop
            small
          />
        )
      }}
    />
  )
}

export default AutoDeploySetting
