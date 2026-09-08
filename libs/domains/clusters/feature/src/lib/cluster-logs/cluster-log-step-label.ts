import { match } from 'ts-pattern'

// Accept newer API steps even when the generated SDK has not caught up yet.
export function getClusterLogStepLabel(step: string | undefined): string {
  return match(step)
    .with('PlatformExecutionResult', () => 'Summary')
    .otherwise((value) => value ?? '')
}
