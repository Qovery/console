import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { Button, EmptyState, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { pluralize } from '@qovery/shared/util-js'
import { queries } from '@qovery/state/util-queries'
import CreateProjectModal from '../create-project-modal/create-project-modal'

export function ProjectList() {
  const { organizationId = '' }: { organizationId: string } = useParams({ strict: false })
  const { data: projects } = useQuery({
    ...queries.projects.list({ organizationId }),
    suspense: true,
  })
  const { openModal, closeModal } = useModal()

  const createProjectModal = () => {
    openModal({
      content: <CreateProjectModal onClose={closeModal} organizationId={organizationId} />,
    })
  }

  return (
    <Section className="flex flex-col gap-3">
      <div className="flex justify-between gap-4">
        <Heading className="flex items-center gap-2">
          Your {pluralize(projects?.length ?? 0, 'project', 'projects')}
        </Heading>
        <Button type="button" color="brand" size="sm" className="gap-1.5" onClick={() => createProjectModal()}>
          <Icon iconName="circle-plus" />
          New project
        </Button>
      </div>
      {projects?.length === 0 ? (
        <EmptyState
          title="No projects created yet"
          description="Create your first project and environments to start deploying apps"
          icon="folder-closed"
        >
          <Button color="neutral" size="md" className="gap-1.5" onClick={() => createProjectModal()}>
            <Icon iconName="circle-plus" />
            Create project
          </Button>
        </EmptyState>
      ) : (
        <div
          className={twMerge(
            clsx('grid grid-cols-1 gap-3', {
              'grid-cols-1 lg:grid-cols-3': (projects?.length ?? 0) > 3,
            })
          )}
        >
          {projects?.map((project) => (
            <button
              key={project.id}
              className="group flex items-center justify-between rounded-lg border border-neutral bg-surface-neutral p-4 text-left text-sm text-neutral transition-colors hover:bg-surface-neutral-subtle"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{project.name}</p>
                <span className="truncate text-neutral-subtle">
                  {project.associated_environments_count}{' '}
                  {pluralize(project.associated_environments_count, 'environment', 'environments')}
                </span>
              </div>
              <Icon
                iconName="angle-right"
                className="text-base text-neutral-subtle transition-colors group-hover:text-neutral"
              />
            </button>
          ))}
        </div>
      )}
    </Section>
  )
}

export default ProjectList
