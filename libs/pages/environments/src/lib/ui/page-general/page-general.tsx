import { type Project } from 'qovery-typescript-axios'
import { EnvironmentList } from '@qovery/domains/environments/feature'

export interface PageGeneralProps {
  clusterAvailable: boolean
  project: Project
}

export function PageGeneral({ clusterAvailable, project }: PageGeneralProps) {
  return (
    <>
      <div className="mt-2 bg-white rounded-t-sm rounded-b-none flex-grow overflow-y-auto min-h-0">
        {project && (
          <EnvironmentList
            className="border-b-neutral-200 border-b"
            project={project}
            clusterAvailable={clusterAvailable ?? false}
          />
        )}
      </div>
    </>
  )
}

export default PageGeneral
