import { type ServiceStateDto } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'

/**
 * `returnType` is needed due to lack of dynamic class names with tailwind
 * https://tailwindcss.com/docs/content-configuration#dynamic-class-names
 **/
export function getServiceStateColor(state?: ServiceStateDto, returnType: 'background' | 'color' = 'color') {
  if (returnType === 'color') {
    return match(state)
      .with('COMPLETED', 'RUNNING', () => 'text-positive')
      .with('ERROR', () => 'text-negative')
      .with('STARTING', 'STOPPING', () => 'text-info')
      .with('WARNING', () => 'text-warning')
      .with('STOPPED', undefined, () => 'text-neutral')
      .exhaustive()
  } else {
    return match(state)
      .with('COMPLETED', 'RUNNING', () => 'bg-surface-positive-solid')
      .with('ERROR', () => 'bg-surface-negative-solid')
      .with('STARTING', 'STOPPING', () => 'bg-surface-info-solid')
      .with('WARNING', () => 'bg-surface-warning-solid')
      .with('STOPPED', undefined, () => 'bg-surface-neutral-solid')
      .exhaustive()
  }
}
