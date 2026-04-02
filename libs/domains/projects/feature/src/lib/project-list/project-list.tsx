import { Link, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { Button, EmptyState, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { pluralize } from '@qovery/shared/util-js'
import CreateProjectModal from '../create-project-modal/create-project-modal'
import { useFavoriteProjects } from '../hooks/use-favorite-projects/use-favorite-projects'
import { useProjects } from '../hooks/use-projects/use-projects'

export function ProjectList() {
  const { organizationId = '' }: { organizationId: string } = useParams({ strict: false })
  const { data: projects = [] } = useProjects({ organizationId, suspense: true })
  const { isProjectFavorite, toggleFavoriteProject } = useFavoriteProjects({ organizationId })
  const { openModal, closeModal } = useModal()
  const sortedProjects = [...projects].sort((a, b) => {
    const isProjectAFavorite = isProjectFavorite(a.id)
    const isProjectBFavorite = isProjectFavorite(b.id)

    if (isProjectAFavorite !== isProjectBFavorite) {
      return isProjectAFavorite ? -1 : 1
    }

    return a.name.localeCompare(b.name)
  })

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
          {sortedProjects.map((project) => {
            const isFavorite = isProjectFavorite(project.id)

            return (
              <div
                key={project.id}
                className="group relative rounded-lg border border-neutral bg-surface-neutral p-4 text-left text-sm text-neutral transition-colors hover:bg-surface-neutral-subtle"
              >
                <Link
                  to="/organization/$organizationId/project/$projectId/overview"
                  params={{ organizationId, projectId: project.id }}
                  aria-label={`Open project ${project.name}`}
                  className="absolute inset-0 rounded-lg"
                />
                <div className="pointer-events-none relative z-10 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium">{project.name}</p>
                      <Button
                        type="button"
                        variant="plain"
                        color={isFavorite ? 'yellow' : 'neutral'}
                        size="xs"
                        iconOnly
                        aria-label={`${isFavorite ? 'Remove' : 'Add'} ${project.name} ${isFavorite ? 'from' : 'to'} favorites`}
                        aria-pressed={isFavorite}
                        className="pointer-events-auto h-5 w-5 rounded-sm"
                        onClick={() => toggleFavoriteProject(project)}
                      >
                        <Icon
                          iconName="star"
                          iconStyle={isFavorite ? 'solid' : 'regular'}
                          className={twMerge(
                            clsx('text-sm transition-colors', {
                              'text-neutral-disabled group-hover:text-neutral-subtle': !isFavorite,
                              'text-warning': isFavorite,
                            })
                          )}
                        />
                      </Button>
                    </div>
                    <span className="truncate text-neutral-subtle">
                      {project.associated_environments_count}{' '}
                      {pluralize(project.associated_environments_count, 'environment', 'environments')}
                    </span>
                  </div>
                  <Icon
                    iconName="angle-right"
                    className="text-base text-neutral-subtle transition-colors group-hover:text-neutral"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

export default ProjectList
