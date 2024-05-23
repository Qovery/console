import { type Project } from 'qovery-typescript-axios'
import { EnvironmentList } from '@qovery/domains/environments/feature'

export interface PageGeneralProps {
  clusterAvailable: boolean
  project: Project
}

export function PageGeneral({ clusterAvailable, project }: PageGeneralProps) {
  return (
    <>
      <div className="mt-2 min-h-0 flex-grow overflow-y-auto rounded-b-none rounded-t-sm bg-white">
        {project && (
          <EnvironmentList
            className="border-b border-b-neutral-200"
            project={project}
            clusterAvailable={clusterAvailable ?? false}
          />
        )}
      </div>
    </>
  )
}

export default PageGeneral
