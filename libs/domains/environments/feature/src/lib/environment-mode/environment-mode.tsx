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
        Production
      </Badge>
    ))
    .with('DEVELOPMENT', () => (
      <Badge variant="surface" color="neutral" {...props}>
        Development
      </Badge>
    ))
    .with('PREVIEW', () => (
      <Badge variant="surface" color="purple" {...props}>
        Preview
      </Badge>
    ))
    .with('STAGING', () => (
      <Badge variant="surface" color="neutral" {...props}>
        Staging
      </Badge>
    ))
    .exhaustive()
}

export default EnvironmentMode
