import { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CreateProjectModalFeature } from '@qovery/shared/console-shared'
import { NavigationLeft, NavigationLeftLinkProps, useModal } from '@qovery/shared/ui'

export interface ContainerProps {
  organizationLinks: NavigationLeftLinkProps[]
  projectLinks: NavigationLeftLinkProps[]
  accountLinks: NavigationLeftLinkProps[]
  children: ReactNode
}

export function Container(props: ContainerProps) {
  const { organizationId = '' } = useParams()
  const { organizationLinks, projectLinks, accountLinks, children } = props
  const { openModal, closeModal } = useModal()

  return (
    <div className="bg-white flex rounded-t">
      <div className="w-72 border-r border-element-light-lighter-400 relative shrink-0 min-h-[calc(100vh-10px)] pb-10">
        <div className="sticky top-7">
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
            className="py-6 border-t border-element-light-lighter-400"
          />
          <NavigationLeft
            title="Account"
            links={accountLinks}
            className="py-6 border-t border-element-light-lighter-400"
          />
        </div>
      </div>
      <div className="flex flex-grow min-h-[calc(100vh-10px)]">{children}</div>
    </div>
  )
}

export default Container
