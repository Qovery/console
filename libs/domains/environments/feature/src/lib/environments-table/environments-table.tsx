import { useParams } from '@tanstack/react-router'
import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useEnvironmentsOverview, useProject } from '@qovery/domains/projects/feature'
import { Button, Heading, Icon, Section, Skeleton, TablePrimitives, useModal } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import CreateCloneEnvironmentModal from '../create-clone-environment-modal/create-clone-environment-modal'
import EnvironmentMode from '../environment-mode/environment-mode'
import {
  EnvironmentSection,
  environmentNameCellContentClassName,
  environmentSelectionCellClassName,
  environmentTableCellClassName,
  environmentTableGridLayoutClassName,
} from './environment-section/environment-section'
import { EnvironmentsTableActionBar } from './environments-table-action-bar'

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
const BODY_TEXT_SKELETON_HEIGHT = 20
const ACTION_BUTTON_SKELETON_HEIGHT = 32

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
                  <Table.Row className={`${environmentTableGridLayoutClassName} w-full items-center text-xs`}>
                    <Table.ColumnHeaderCell className="h-9 p-0 text-neutral-subtle">
                      <div className={environmentSelectionCellClassName}>
                        <Skeleton height={16} width={16} />
                      </div>
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="flex h-9 items-center py-0 pl-0 pr-4 text-neutral-subtle">
                      <Skeleton height={16} width={130} />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                      <Skeleton height={16} width={110} />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                      <Skeleton height={16} width={80} />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                      <Skeleton height={16} width={90} />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="flex h-9 items-center justify-end border-l border-neutral text-left text-neutral-subtle">
                      <Skeleton height={16} width={54} />
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body className="divide-y divide-neutral">
                  {[...Array(2)].map((_, index) => (
                    <Table.Row key={index} className={environmentTableGridLayoutClassName}>
                      <Table.Cell className="h-auto border-none p-0">
                        <div className={environmentSelectionCellClassName}>
                          <Skeleton height={16} width={16} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className={`${environmentTableCellClassName} border-none p-0`}>
                        <div className={environmentNameCellContentClassName}>
                          <Skeleton height={BODY_TEXT_SKELETON_HEIGHT} width={180} />
                          <Skeleton height={BODY_TEXT_SKELETON_HEIGHT} width={90} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className={environmentTableCellClassName}>
                        <div className="flex h-full items-center justify-between">
                          <Skeleton height={BODY_TEXT_SKELETON_HEIGHT} width={140} />
                          <Skeleton height={16} width={64} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className={environmentTableCellClassName}>
                        <div className="flex h-full items-center gap-2">
                          <Skeleton height={BODY_TEXT_SKELETON_HEIGHT} width={140} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className={environmentTableCellClassName}>
                        <div className="flex h-full items-center">
                          <Skeleton height={BODY_TEXT_SKELETON_HEIGHT} width={100} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className={environmentTableCellClassName}>
                        <div className="flex h-full items-center justify-end gap-1.5">
                          <Skeleton height={ACTION_BUTTON_SKELETON_HEIGHT} width={56} />
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

function EnvironmentsTableContent() {
  const { openModal, closeModal } = useModal()
  const { organizationId = '', projectId = '' } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { data: environmentsOverview } = useEnvironmentsOverview({ projectId, suspense: true })
  const [selectedEnvironmentIds, setSelectedEnvironmentIds] = useState<string[]>([])

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
          />
        ),
        options: {
          fakeModal: true,
        },
      })
    },
    [projectId, organizationId, closeModal, openModal]
  )

  const handleEnvironmentSelectionChange = useCallback((environmentId: string, checked: boolean) => {
    setSelectedEnvironmentIds((currentSelectedEnvironmentIds) => {
      if (checked) {
        return currentSelectedEnvironmentIds.includes(environmentId)
          ? currentSelectedEnvironmentIds
          : [...currentSelectedEnvironmentIds, environmentId]
      }

      return currentSelectedEnvironmentIds.filter((selectedEnvironmentId) => selectedEnvironmentId !== environmentId)
    })
  }, [])

  const handleSectionSelectionChange = useCallback((environmentIds: string[], checked: boolean) => {
    setSelectedEnvironmentIds((currentSelectedEnvironmentIds) => {
      if (checked) {
        return Array.from(new Set([...currentSelectedEnvironmentIds, ...environmentIds]))
      }

      return currentSelectedEnvironmentIds.filter(
        (selectedEnvironmentId) => !environmentIds.includes(selectedEnvironmentId)
      )
    })
  }, [])

  const selectedRows = useMemo(() => {
    if (!environmentsOverview) {
      return []
    }

    const selectedEnvironmentIdsSet = new Set(selectedEnvironmentIds)
    return environmentsOverview.filter(({ id }) => selectedEnvironmentIdsSet.has(id))
  }, [environmentsOverview, selectedEnvironmentIds])

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
            selectedEnvironmentIds={selectedEnvironmentIds}
            onEnvironmentSelectionChange={handleEnvironmentSelectionChange}
            onSectionSelectionChange={handleSectionSelectionChange}
          />
        ))}
      </>
    )
  }, [
    groupedEnvs,
    handleEnvironmentSelectionChange,
    handleSectionSelectionChange,
    onCreateEnvClicked,
    selectedEnvironmentIds,
  ])

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
      <EnvironmentsTableActionBar
        projectId={projectId}
        selectedRows={selectedRows}
        resetRowSelection={() => setSelectedEnvironmentIds([])}
      />
    </div>
  )
}

export function EnvironmentsTable() {
  useDocumentTitle('Environments - Qovery')

  return (
    <Suspense fallback={<EnvironmentsTableSkeleton />}>
      <EnvironmentsTableContent />
    </Suspense>
  )
}
