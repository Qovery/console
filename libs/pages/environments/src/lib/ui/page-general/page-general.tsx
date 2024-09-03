import { type Project } from 'qovery-typescript-axios'
import { EnvironmentList } from '@qovery/domains/environments/feature'

export interface PageGeneralProps {
  clusterAvailable: boolean
  project?: Project
}

export function PageGeneral({ clusterAvailable, project }: PageGeneralProps) {
  return (
    project && (
      <EnvironmentList
        className="border-b border-b-neutral-200"
        project={project}
        clusterAvailable={clusterAvailable ?? false}
      />
    )
  )
}

export default PageGeneral
