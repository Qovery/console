import { Controller, useFormContext } from 'react-hook-form'
import { InputToggle } from '@qovery/shared/ui'

export interface AutoDeploySettingProps {
  source: 'CONTAINER_REGISTRY' | 'GIT'
  className?: string
}

export function AutoDeploySetting({ source, className = '' }: AutoDeploySettingProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name="auto_deploy"
      control={control}
      render={({ field }) => (
        <InputToggle
          className={className}
          value={field.value}
          onChange={field.onChange}
          title="Auto-deploy"
          description={
            source === 'CONTAINER_REGISTRY'
              ? 'The service will be automatically updated if Qovery is notified on the API that a new image tag is available.'
              : 'The service will be automatically updated on every new commit on the branch.'
          }
          forceAlignTop
          small
        />
      )}
    />
  )
}

export default AutoDeploySetting
