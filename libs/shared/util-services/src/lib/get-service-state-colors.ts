import { type ServiceStateDto } from 'qovery-ws-typescript-axios'
import { match } from 'ts-pattern'

/**
 * `returnType` is needed due to lack of dynamic class names with tailwind
 * https://tailwindcss.com/docs/content-configuration#dynamic-class-names
 **/
export function getServiceStateColor(state?: ServiceStateDto, returnType: 'background' | 'color' = 'color') {
  if (returnType === 'color') {
    return match(state)
      .with('COMPLETED', 'RUNNING', () => 'green-500')
      .with('ERROR', () => 'red-500')
      .with('STARTING', 'STOPPING', () => 'indigo-500')
      .with('WARNING', () => 'yellow-600')
      .with('STOPPED', undefined, () => 'neutral-300')
      .exhaustive()
  } else {
    return match(state)
      .with('COMPLETED', 'RUNNING', () => 'bg-green-500')
      .with('ERROR', () => 'bg-red-500')
      .with('STARTING', 'STOPPING', () => 'bg-indigo-500')
      .with('WARNING', () => 'bg-yellow-600')
      .with('STOPPED', undefined, () => 'bg-neutral-300')
      .exhaustive()
  }
}
