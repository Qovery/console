import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CreateProjectModalFeature } from '@qovery/shared/console-shared'
import { NavigationLeft, type NavigationLeftLinkProps, useModal } from '@qovery/shared/ui'

export interface ContainerProps {
  organizationLinks: NavigationLeftLinkProps[]
  projectLinks: NavigationLeftLinkProps[]
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { organizationId = '' } = useParams()
  const { organizationLinks, projectLinks, children } = props
  const { openModal, closeModal } = useModal()

  return (
    <div className="bg-white flex flex-1 rounded-t">
      <div className="w-72 border-r border-neutral-200 relative shrink-0 pb-10">
        <div className="sticky top-12">
          <NavigationLeft title="Organization" links={organizationLinks} className="py-6" />
          <NavigationLeft
            title="Projects"
            links={projectLinks}
            link={{
              title: 'New',
              onClick: () => {
                openModal({
                  content: <CreateProjectModalFeature onClose={closeModal} organizationId={organizationId} />,
                })
              },
            }}
            className="py-6 border-t border-neutral-200"
          />
        </div>
      </div>
      <div className="flex grow">{children}</div>
    </div>
  )
}

export default Container
