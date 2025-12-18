import { useSuspenseQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Button, EmptyState, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { pluralize } from '@qovery/shared/util-js'
import CreateProjectModal from '../create-project-modal/create-project-modal'
import { projectsQuery } from '../hooks/use-projects/use-projects'

export function ProjectList({ organizationId }: { organizationId: string }) {
  const { data: projects = [] } = useSuspenseQuery(projectsQuery({ organizationId }))
  const { openModal, closeModal } = useModal()

  const createProjectModal = () => {
    openModal({
      content: <CreateProjectModal onClose={closeModal} organizationId={organizationId} />,
    })
  }

  return (
    <Section className="flex flex-col gap-3">
      <div className="flex justify-between gap-4">
        <Heading className="flex items-center gap-2">Your {pluralize(projects.length, 'project', 'projects')}</Heading>
        <Button type="button" color="brand" size="sm" className="gap-1.5" onClick={() => createProjectModal()}>
          <Icon iconName="circle-plus" />
          New project
        </Button>
      </div>
      {projects.length === 0 ? (
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
              'grid-cols-1 lg:grid-cols-3': projects?.length > 3,
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
