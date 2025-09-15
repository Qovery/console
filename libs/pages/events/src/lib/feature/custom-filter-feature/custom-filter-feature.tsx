import { OrganizationEventTargetType } from 'qovery-typescript-axios'
import { memo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryParams } from 'use-query-params'
import { useEnvironments } from '@qovery/domains/environments/feature'
import { useFetchEventTargets } from '@qovery/domains/event'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { convertDatetoTimestamp } from '@qovery/shared/util-dates'
import CustomFilter from '../../ui/custom-filter/custom-filter'
import { hasEnvironment, queryParamsValues } from '../page-general-feature/page-general-feature'

export interface CustomFilterFeatureProps {
  handleClearFilter: () => void
}

export function CustomFilterFeature({ handleClearFilter }: CustomFilterFeatureProps) {
  const { organizationId = '' } = useParams()
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  const [queryParams, setQueryParams] = useQueryParams(queryParamsValues)
  const { environmentId, projectId, targetType, targetId } = queryParams

  const fromTimestamp = queryParams.fromTimestamp && new Date(parseInt(queryParams.fromTimestamp, 10) * 1000)
  const toTimestamp = queryParams.toTimestamp && new Date(parseInt(queryParams.toTimestamp, 10) * 1000)
  const timestamps = fromTimestamp && toTimestamp ? ([fromTimestamp, toTimestamp] as [Date, Date]) : undefined

  const { data: projects = [] } = useProjects({ organizationId })
  const { data: environments } = useEnvironments({ projectId: projectId ?? '' })
  const { data: organization } = useOrganization({ organizationId, enabled: !!organizationId })

  // NOTE: - ENVIRONMENT: we don't display target input if no project selected
  const displayEventTargets = Boolean(
    targetType &&
      (targetType === OrganizationEventTargetType.ENVIRONMENT
        ? !!projectId
        : !hasEnvironment(targetType) || (projectId && environmentId))
  )

  const { data: eventsTargetsData, isLoading: isLoadingEventsTargetsData } = useFetchEventTargets(
    organizationId,
    queryParams,
    displayEventTargets
  )

  const onChangeTimestamp = (startDate: Date, endDate: Date) => {
    setQueryParams({
      continueToken: undefined,
      stepBackToken: undefined,
      fromTimestamp: convertDatetoTimestamp(startDate.toString()).toString(),
      toTimestamp: endDate ? convertDatetoTimestamp(endDate.toString()).toString() : undefined,
    })
    setIsOpenTimestamp(!isOpenTimestamp)
  }

  const onChangeClearTimestamp = () => {
    setQueryParams({
      fromTimestamp: undefined,
      toTimestamp: undefined,
    })
    setIsOpenTimestamp(false)
  }

  const onChangeType = (name: string, value?: string | string[]) => {
    if (name === 'targetType') {
      setQueryParams({
        targetType: value as OrganizationEventTargetType | undefined,
        projectId: undefined,
        environmentId: undefined,
        targetId: undefined,
      })
    } else if (name === 'projectId') {
      setQueryParams({
        projectId: value as string | undefined,
        environmentId: undefined,
        targetId: undefined,
      })
    } else if (name === 'environmentId') {
      setQueryParams({
        environmentId: value as string | undefined,
        targetId: undefined,
      })
    } else if (name === 'targetId') {
      setQueryParams({
        targetId: value as string | undefined,
      })
    }
  }

  return (
    <CustomFilter
      onChangeTimestamp={onChangeTimestamp}
      onChangeClearTimestamp={onChangeClearTimestamp}
      isOpenTimestamp={isOpenTimestamp}
      setIsOpenTimestamp={setIsOpenTimestamp}
      timestamps={timestamps}
      onChangeType={onChangeType}
      clearFilter={() => {
        handleClearFilter()
        onChangeClearTimestamp()
      }}
      projects={projects}
      environments={environments}
      eventsTargetsData={eventsTargetsData?.targets}
      isLoadingEventsTargetsData={isLoadingEventsTargetsData}
      projectId={projectId}
      environmentId={environmentId}
      organization={organization}
      targetType={targetType}
      targetId={targetId}
      displayEventTargets={displayEventTargets}
    />
  )
}

export default memo(CustomFilterFeature)
