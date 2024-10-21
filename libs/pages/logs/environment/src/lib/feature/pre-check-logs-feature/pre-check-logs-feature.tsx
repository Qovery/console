import { type Environment, type EnvironmentStatusesWithStagesPreCheckStage } from 'qovery-typescript-axios'
import { ListPreCheckLogs } from '@qovery/domains/environment-logs/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export interface PreCheckLogsFeatureProps {
  environment: Environment
  preCheckStage?: EnvironmentStatusesWithStagesPreCheckStage
}

export function PreCheckLogsFeature({ environment, preCheckStage }: PreCheckLogsFeatureProps) {
  useDocumentTitle('Environment Pre-check logs')

  return (
    <div className="h-full w-full bg-neutral-800">
      <ListPreCheckLogs environment={environment} preCheckStage={preCheckStage} />
    </div>
  )
}

export default PreCheckLogsFeature
