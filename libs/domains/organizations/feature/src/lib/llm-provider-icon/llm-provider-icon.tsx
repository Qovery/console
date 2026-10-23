import clsx from 'clsx'
import { LlmProviderType } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'

export interface LlmProviderIconProps {
  type: LlmProviderType
  size?: 'sm' | 'md'
  className?: string
}

export function LlmProviderIcon({ type, size = 'md', className }: LlmProviderIconProps) {
  const boxClassName = clsx(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', className)

  return match(type)
    .with(LlmProviderType.CLAUDE, () => (
      <img src="/assets/ai-tools/claude.svg" alt="" aria-hidden="true" className={boxClassName} />
    ))
    .with(LlmProviderType.BEDROCK, () => (
      <img src="/assets/ai-tools/bedrock.svg" alt="" aria-hidden="true" className={boxClassName} />
    ))
    .with(LlmProviderType.ANTHROPIC_COMPATIBLE, () => (
      <>
        <img
          src="/assets/ai-tools/openrouter-grape.svg"
          alt=""
          aria-hidden="true"
          className={clsx(boxClassName, 'object-contain dark:hidden')}
        />
        <img
          src="/assets/ai-tools/openrouter-volt.svg"
          alt=""
          aria-hidden="true"
          className={clsx(boxClassName, 'hidden object-contain dark:block')}
        />
      </>
    ))
    .exhaustive()
}

export default LlmProviderIcon
