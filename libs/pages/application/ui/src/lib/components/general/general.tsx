/* eslint-disable-next-line */
import { ApplicationEntity } from '@console/shared/interfaces'
import HelpSection from '../../../../../../../shared/ui/src/lib/components/help-section/help-section'
import { BaseLink } from '@console/shared/ui'

export interface GeneralProps {
  application?: ApplicationEntity
  listHelpfulLinks: BaseLink[]
}

export function GeneralPage(props: GeneralProps) {
  const { application, listHelpfulLinks } = props

  return (
    <div className="mt-2 bg-white rounded flex flex-grow">
      <div className="flex h-full flex-col flex-grow">
        <h1 className="border-gray-50 flex-grow">Welcome to {application?.name} overview page</h1>
        <HelpSection description="Need help? You may find these links useful" links={listHelpfulLinks}></HelpSection>
      </div>
    </div>
  )
}

export default GeneralPage
