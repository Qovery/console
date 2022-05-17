/* eslint-disable-next-line */
import { ApplicationEntity } from '@console/shared/interfaces'
import HelpSection from '../../../../../../../shared/ui/src/lib/components/help-section/help-section'
import { BaseLink } from '@console/shared/ui'
import About from '../about/about'

export interface GeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
}

export function GeneralPage(props: GeneralProps) {
  const { application, listHelpfulLinks } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <div className="py-7 px-10 flex-grow">
          <h1>Hey {application?.name}</h1>
        </div>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
      <div className="w-left-help-sidebar py-10 border-l border-element-light-lighter-400">
        <About
          description={application?.description || ''}
          link={{
            link: application?.git_repository?.url || '',
            linkLabel: application?.git_repository?.provider,
            external: true,
          }}
          buildMode={application?.build_mode}
          gitProvider={application?.git_repository?.provider}
        />
      </div>
    </div>
  )
}

export default GeneralPage
