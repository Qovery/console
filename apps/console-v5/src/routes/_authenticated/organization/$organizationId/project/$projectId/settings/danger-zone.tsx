import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Suspense, useState } from 'react'
import { useDeleteProject, useProject } from '@qovery/domains/projects/feature'
import { BlockContentDelete, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/settings/danger-zone'
)({
  component: RouteComponent,
})

export interface BlockContentDeleteProps {
  title: string
  modalConfirmation?: {
    title: string
    name?: string
    mode?: string
  }
  description?: string
  className?: string
  list?: {
    text: string
    icon?: string
  }[]
  ctaLabel?: string
  ctaLoading?: boolean
  callback?: () => void
  customWidth?: string
  customModalConfirmation?: () => void
}

function ProjectDangerZone() {
  useDocumentTitle('Danger zone - Project settings')
  const navigate = useNavigate()
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { mutateAsync } = useDeleteProject()
  const [loading, setLoading] = useState(false)

  const deleteProject = async () => {
    setLoading(true)

    try {
      await mutateAsync({
        organizationId,
        projectId,
      })
      setLoading(false)
      navigate({ to: '/organization/' + organizationId })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Section className="max-w-content-with-navigation-left p-8">
      <BlockContentDelete
        title="Delete project"
        ctaLabel="Delete project"
        ctaLoading={loading}
        list={[
          {
            iconName: 'trash',
            iconStyle: 'solid',
            text: 'Databases',
          },
          {
            iconName: 'trash',
            iconStyle: 'solid',
            text: 'Applications',
          },
          {
            iconName: 'trash',
            iconStyle: 'solid',
            text: 'Environments',
          },
        ]}
        callback={deleteProject}
        modalConfirmation={{
          mode: EnvironmentModeEnum.PRODUCTION,
          title: 'Delete project',
          name: project?.name,
        }}
      />
    </Section>
  )
}

function RouteComponent() {
  return (
    <Suspense>
      <ProjectDangerZone />
    </Suspense>
  )
}
