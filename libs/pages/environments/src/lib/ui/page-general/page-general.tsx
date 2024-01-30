import { type Project } from 'qovery-typescript-axios'
import { EnvironmentList } from '@qovery/domains/environments/feature'
import { type BaseLink, HelpSection } from '@qovery/shared/ui'

export interface PageGeneralProps {
  clusterAvailable: boolean
  project: Project
  listHelpfulLinks: BaseLink[]
}

export function PageGeneral({ clusterAvailable, project, listHelpfulLinks }: PageGeneralProps) {
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
      <div className="bg-white rounded-b flex flex-col justify-end">
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks} />
      </div>
    </>
  )
}

export default PageGeneral
