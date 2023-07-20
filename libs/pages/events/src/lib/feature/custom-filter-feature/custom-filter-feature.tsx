import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useFetchEnvironments } from '@qovery/domains/environment'
import { EventQueryParams, useFetchEventTargets } from '@qovery/domains/event'
import { selectProjectsEntitiesByOrgId } from '@qovery/domains/projects'
import { convertDatetoTimestamp } from '@qovery/shared/utils'
import { RootState } from '@qovery/store'
import CustomFilter from '../../ui/custom-filter/custom-filter'
import { extractEventQueryParams, hasEnvironment } from '../page-general-feature/page-general-feature'

export interface CustomFilterFeatureProps {
  handleClearFilter: () => void
}

export function CustomFilterFeature({ handleClearFilter }: CustomFilterFeatureProps) {
  const location = useLocation()
  const { organizationId = '' } = useParams()
  const [, setSearchParams] = useSearchParams()
  const [timestamps, setTimestamps] = useState<[Date, Date] | undefined>()
  const [isOpenTimestamp, setIsOpenTimestamp] = useState(false)

  const queryParams: EventQueryParams = extractEventQueryParams(location.pathname + location.search)
  const { environmentId, projectId, targetType, targetId } = queryParams

  const projects = useSelector((state: RootState) => selectProjectsEntitiesByOrgId(state, organizationId))
  const { data: environments } = useFetchEnvironments(projectId || '')

  const displayEventTargets: boolean = Boolean(
    targetType && (!hasEnvironment(targetType) || (projectId && environmentId))
  )

  const { data: eventsTargetsData, isLoading: isLoadingEventsTargetsData } = useFetchEventTargets(
    organizationId,
    queryParams,
    displayEventTargets
  )

  useEffect(() => {
    const newQueryParams: EventQueryParams = extractEventQueryParams(location.pathname + location.search)

    if (newQueryParams.fromTimestamp && newQueryParams.toTimestamp)
      setTimestamps([
        new Date(parseInt(newQueryParams.fromTimestamp, 10) * 1000),
        new Date(parseInt(newQueryParams.toTimestamp, 10) * 1000),
      ])
  }, [location])

  const onChangeTimestamp = (startDate: Date, endDate: Date) => {
    setSearchParams((prev) => {
      prev.delete('continueToken')
      prev.delete('stepBackToken')
      prev.set('fromTimestamp', convertDatetoTimestamp(startDate.toString()).toString())
      prev.set('toTimestamp', endDate ? convertDatetoTimestamp(endDate.toString()).toString() : '')
      return prev
    })
    setTimestamps([startDate, endDate])
    setIsOpenTimestamp(!isOpenTimestamp)
  }

  const onChangeClearTimestamp = () => {
    setTimestamps(undefined)
    setIsOpenTimestamp(false)
  }

  const onChangeType = (name: string, value?: string | string[]) => {
    if (name === 'targetType') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('targetType', value as string)
        } else {
          prev.delete('targetType')
          prev.delete('projectId')
          prev.delete('environmentId')
          prev.delete('targetId')
        }
        return prev
      })
    } else if (name === 'projectId') {
      setSearchParams((prev) => {
        console.log(value)
        if (value) {
          prev.set('projectId', value as string)
        } else {
          prev.delete('projectId')
          prev.delete('environmentId')
          prev.delete('targetId')
        }
        return prev
      })
    } else if (name === 'environmentId') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('environmentId', value as string)
        } else {
          prev.delete('environmentId')
          prev.delete('targetId')
        }
        return prev
      })
    } else if (name === 'targetId') {
      setSearchParams((prev) => {
        if (value) {
          prev.set('targetId', value as string)
        } else {
          prev.delete('targetId')
        }
        return prev
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
      targetType={targetType}
      targetId={targetId}
      displayEventTargets={displayEventTargets}
    />
  )
}

export default React.memo(CustomFilterFeature)
