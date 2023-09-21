import { type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Badge, type BadgeProps } from '@qovery/shared/ui'

export interface EnvironmentModeProps extends Omit<BadgeProps, 'color'> {
  mode: keyof typeof EnvironmentModeEnum
}

export function EnvironmentMode({ mode, ...props }: EnvironmentModeProps) {
  return match(mode)
    .with('PRODUCTION', () => (
      <Badge variant="surface" color="red" {...props}>
        PROD
      </Badge>
    ))
    .with('DEVELOPMENT', () => (
      <Badge variant="surface" color="neutral" {...props}>
        DEV
      </Badge>
    ))
    .with('PREVIEW', () => (
      <Badge variant="surface" color="purple" {...props}>
        PREVIEW
      </Badge>
    ))
    .with('STAGING', () => (
      <Badge variant="surface" color="neutral" {...props}>
        STAGING
      </Badge>
    ))
    .exhaustive()
}

export default EnvironmentMode
