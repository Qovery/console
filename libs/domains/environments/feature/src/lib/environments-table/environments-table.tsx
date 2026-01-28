import { useParams } from '@tanstack/react-router'
import type { EnvironmentModeEnum, EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useEnvironmentsOverview, useProject } from '@qovery/domains/projects/feature'
import { Button, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
import CreateCloneEnvironmentModal from '../create-clone-environment-modal/create-clone-environment-modal'
import { EnvironmentSection } from './environment-section/environment-section'

export function EnvironmentsTable() {
  const { openModal, closeModal } = useModal()
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { data: environmentsOverview } = useEnvironmentsOverview({ projectId, suspense: true })

  const groupedEnvs = useMemo(() => {
    return environmentsOverview?.reduce((acc, env) => {
      acc.set(env.mode, [...(acc.get(env.mode) || []), env])
      return acc
    }, new Map<EnvironmentModeEnum, EnvironmentOverviewResponse[]>())
  }, [environmentsOverview])

  const onCreateEnvClicked = (type?: EnvironmentModeEnum) => {
    openModal({
      content: (
        <CreateCloneEnvironmentModal
          onClose={closeModal}
          projectId={projectId}
          organizationId={organizationId}
          type={type}
        />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <Heading>{project?.name}</Heading>
            <Button
              onClick={() => {
                onCreateEnvClicked()
              }}
              variant="solid"
              className="gap-1.5"
              size="md"
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              New Environment
            </Button>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          <EnvironmentSection
            type="PRODUCTION"
            items={groupedEnvs?.get('PRODUCTION') || []}
            onCreateEnvClicked={() => onCreateEnvClicked('PRODUCTION')}
          />
          <EnvironmentSection
            type="STAGING"
            items={groupedEnvs?.get('STAGING') || []}
            onCreateEnvClicked={() => onCreateEnvClicked('STAGING')}
          />
          <EnvironmentSection
            type="DEVELOPMENT"
            items={groupedEnvs?.get('DEVELOPMENT') || []}
            onCreateEnvClicked={() => onCreateEnvClicked('DEVELOPMENT')}
          />
          <EnvironmentSection type="PREVIEW" items={groupedEnvs?.get('PREVIEW') || []} />
        </div>
      </Section>
    </div>
  )
}
