import { LlmProviderType } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { Icon } from '@qovery/shared/ui'

export interface LlmProviderIconProps {
  type: LlmProviderType
  size?: 'sm' | 'md'
}

export function LlmProviderIcon({ type, size = 'md' }: LlmProviderIconProps) {
  const boxClassName = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return match(type)
    .with(LlmProviderType.CLAUDE, () => (
      <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className={boxClassName} />
    ))
    .with(LlmProviderType.BEDROCK, () => (
      <img src="/assets/ai-tools/bedrock.svg" alt="" aria-hidden="true" className={boxClassName} />
    ))
    .with(LlmProviderType.ANTHROPIC_COMPATIBLE, () => (
      <span className={`inline-flex shrink-0 items-center justify-center text-neutral ${boxClassName}`}>
        <Icon iconName="plug" iconStyle="regular" className={size === 'sm' ? 'text-xs' : 'text-sm'} />
      </span>
    ))
    .exhaustive()
}

export default LlmProviderIcon
