import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CreateProjectModal } from '@qovery/domains/projects/feature'
import { ErrorBoundary, NavigationLeft, type NavigationLeftLinkProps, useModal } from '@qovery/shared/ui'

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
    <div className="flex flex-1 rounded-t bg-white">
      <ErrorBoundary>
        <div className="relative w-72 shrink-0 border-r border-neutral-200 pb-10">
          <div className="sticky top-12">
            <NavigationLeft title="Organization" links={organizationLinks} className="py-6" />
            <NavigationLeft
              title="Projects"
              links={projectLinks}
              link={{
                title: 'New',
                onClick: () => {
                  openModal({
                    content: <CreateProjectModal onClose={closeModal} organizationId={organizationId} />,
                  })
                },
              }}
              className="border-t border-neutral-200 py-6"
            />
          </div>
        </div>
        <div className="flex grow">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  )
}

export default Container
