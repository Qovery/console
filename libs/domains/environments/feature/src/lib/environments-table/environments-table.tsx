import { useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { Suspense, useCallback, useMemo } from 'react'
import { useEnvironmentsOverview, useProject } from '@qovery/domains/projects/feature'
import { Button, Heading, Icon, Section, Skeleton, TablePrimitives, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import CreateCloneEnvironmentModal from '../create-clone-environment-modal/create-clone-environment-modal'
import EnvironmentMode from '../environment-mode/environment-mode'
import { EnvironmentSection } from './environment-section/environment-section'

const { Table } = TablePrimitives

const SECTIONS: EnvironmentModeEnum[] = [
  EnvironmentModeEnum.PRODUCTION,
  EnvironmentModeEnum.STAGING,
  EnvironmentModeEnum.DEVELOPMENT,
  EnvironmentModeEnum.PREVIEW,
]

const SECTION_TITLES: Record<EnvironmentModeEnum, string> = {
  [EnvironmentModeEnum.PRODUCTION]: 'Production',
  [EnvironmentModeEnum.STAGING]: 'Staging',
  [EnvironmentModeEnum.DEVELOPMENT]: 'Development',
  [EnvironmentModeEnum.PREVIEW]: 'Ephemeral',
}

const skeletonGridLayoutClassName =
  'grid w-full grid-cols-[minmax(280px,2fr)_minmax(220px,1.4fr)_minmax(240px,1.2fr)_minmax(140px,1fr)_96px] items-center'

function EnvironmentsTableSkeleton() {
  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <Skeleton height={32} width={180} />
            <Skeleton height={32} width={170} />
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <Section key={section} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2">
                <EnvironmentMode mode={section} variant="shrink" />
                <Heading>{SECTION_TITLES[section]}</Heading>
              </div>
              <Table.Root className="w-full min-w-[1080px]" containerClassName="no-scrollbar overflow-x-auto">
                <Table.Header>
                  <Table.Row className={skeletonGridLayoutClassName}>
                    {[130, 110, 80, 90, 70].map((width, index) => (
                      <Table.ColumnHeaderCell
                        key={width}
                        className={`h-9 items-center py-2.5 ${index > 0 ? 'border-l border-neutral' : ''}`}
                      >
                        <Skeleton height={16} width={width} />
                      </Table.ColumnHeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body className="divide-y divide-neutral">
                  {[...Array(2)].map((_, index) => (
                    <Table.Row key={index} className={skeletonGridLayoutClassName}>
                      <Table.Cell className="border-none p-0">
                        <div className="flex h-full items-center justify-between gap-2 px-4">
                          <Skeleton height={16} width={180} />
                          <Skeleton height={16} width={90} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="h-full border-l border-neutral p-0">
                        <div className="flex h-full items-center justify-between px-4">
                          <Skeleton height={16} width={140} />
                          <Skeleton height={16} width={64} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="h-full border-l border-neutral p-0">
                        <div className="flex h-full items-center gap-2 px-4">
                          <Skeleton height={16} width={140} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="h-full border-l border-neutral p-0">
                        <div className="flex h-full items-center px-4">
                          <Skeleton height={16} width={100} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="h-full border-l border-neutral p-0">
                        <div className="flex h-full items-center gap-1.5 px-4">
                          <Skeleton height={16} width={40} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Section>
          ))}
        </div>
      </Section>
    </div>
  )
}

export interface EnvironmentsTableProps {
  cloneUseCaseId?: string
}

function EnvironmentsTableContent({ cloneUseCaseId }: EnvironmentsTableProps) {
  const { openModal, closeModal } = useModal()
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { data: environmentsOverview } = useEnvironmentsOverview({ projectId, suspense: true })

  const groupedEnvs = useMemo(() => {
    if (!environmentsOverview) {
      return undefined
    }

    const sortedEnvironments = [...environmentsOverview].sort(
      (environmentA: EnvironmentOverviewResponse, environmentB: EnvironmentOverviewResponse) =>
        (environmentA.name ?? '').localeCompare(environmentB.name ?? '')
    )

    return sortedEnvironments.reduce<Map<EnvironmentModeEnum, EnvironmentOverviewResponse[]>>(
      (acc, env: EnvironmentOverviewResponse) => {
        acc.set(env.mode, [...(acc.get(env.mode) || []), env])
        return acc
      },
      new Map<EnvironmentModeEnum, EnvironmentOverviewResponse[]>()
    )
  }, [environmentsOverview])

  const onCreateEnvClicked = useCallback(
    (type?: EnvironmentModeEnum) => {
      openModal({
        content: (
          <CreateCloneEnvironmentModal
            onClose={closeModal}
            projectId={projectId}
            organizationId={organizationId}
            type={type}
            cloneUseCaseId={cloneUseCaseId}
          />
        ),
        options: {
          fakeModal: true,
          ...(cloneUseCaseId === 'multi-source' ? { width: 676 } : {}),
        },
      })
    },
    [projectId, organizationId, closeModal, openModal, cloneUseCaseId]
  )

  const Sections = useCallback(() => {
    const filledSections = SECTIONS.filter((section) => groupedEnvs?.has(section))
    const emptySections = SECTIONS.filter((section) => !groupedEnvs?.has(section))
    return (
      <>
        {[...filledSections, ...emptySections].map((section) => (
          <EnvironmentSection
            key={section}
            type={section}
            items={groupedEnvs?.get(section) || []}
            onCreateEnvClicked={() => onCreateEnvClicked(section)}
            cloneUseCaseId={cloneUseCaseId}
          />
        ))}
      </>
    )
  }, [groupedEnvs, onCreateEnvClicked, cloneUseCaseId])

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
          <Sections />
        </div>
      </Section>
    </div>
  )
}

export function EnvironmentsTable({ cloneUseCaseId }: EnvironmentsTableProps) {
  useDocumentTitle('Environments - Qovery')

  return (
    <Suspense fallback={<EnvironmentsTableSkeleton />}>
      <EnvironmentsTableContent cloneUseCaseId={cloneUseCaseId} />
    </Suspense>
  )
}
