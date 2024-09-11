import { subDays } from 'date-fns'
import {
  type ClusterCloudProviderInfoCredentials,
  type Environment,
  type Organization,
  OrganizationEventTargetType,
  type Project,
} from 'qovery-typescript-axios'
import { useSearchParams } from 'react-router-dom'
import { Button, DatePicker, Icon, InputFilter } from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond } from '@qovery/shared/util-dates'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { hasEnvironment, hasProject } from '../../feature/page-general-feature/page-general-feature'

export interface CustomFilterProps {
  onChangeTimestamp: (startDate: Date, endDate: Date) => void
  onChangeClearTimestamp: () => void
  isOpenTimestamp: boolean
  setIsOpenTimestamp: (isOpen: boolean) => void
  onChangeType: (type: string, value?: string | string[]) => void
  clearFilter: () => void
  timestamps?: [Date, Date]
  projects?: Project[]
  environments?: Environment[]
  eventsTargetsData?: ClusterCloudProviderInfoCredentials[]
  isLoadingEventsTargetsData?: boolean
  displayEventTargets?: boolean
  targetType?: string | null
  projectId?: string | null
  environmentId?: string | null
  organization?: Organization
  targetId?: string | null
}

export function CustomFilter({
  onChangeType,
  clearFilter,
  onChangeTimestamp,
  onChangeClearTimestamp,
  isOpenTimestamp,
  timestamps,
  setIsOpenTimestamp,
  projects = [],
  environments = [],
  eventsTargetsData = [],
  isLoadingEventsTargetsData = false,
  displayEventTargets = false,
  targetType,
  projectId,
  environmentId,
  organization,
  targetId,
}: CustomFilterProps) {
  const [searchParams] = useSearchParams()

  return (
    <>
      <p className="mr-1.5 text-ssm font-medium text-neutral-350">Select</p>
      <div className="mr-5">
        <DatePicker
          key={timestamps ? timestamps[0].toString() : 'timestamp'}
          onChange={onChangeTimestamp}
          isOpen={isOpenTimestamp}
          maxDate={new Date()}
          minDate={subDays(new Date(), organization?.organization_plan?.audit_logs_retention_in_days ?? 30)}
          defaultDates={timestamps}
          showTimeInput
          onClickOutside={() => setIsOpenTimestamp(!isOpenTimestamp)}
        >
          {!timestamps ? (
            <Button
              data-testid="timeframe-button"
              type="button"
              variant="surface"
              color="neutral"
              className="gap-2"
              onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}
            >
              Timeframe
              <Icon iconName="clock" iconStyle="regular" />
            </Button>
          ) : (
            <Button type="button" data-testid="timeframe-values" onClick={() => setIsOpenTimestamp(!isOpenTimestamp)}>
              from: {dateYearMonthDayHourMinuteSecond(timestamps[0], true, false)} - to:{' '}
              {dateYearMonthDayHourMinuteSecond(timestamps[1], true, false)}
              <span
                data-testid="clear-timestamp"
                className="relative left-1 px-1 py-1"
                role="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onChangeClearTimestamp()
                }}
              >
                <Icon iconName="xmark" />
              </span>
            </Button>
          )}
        </DatePicker>
      </div>
      <div className="relative flex items-center text-ssm font-medium text-neutral-350">
        <p className=" mr-1.5">Search</p>
        <div className="flex items-center gap-2">
          <InputFilter
            name="Type"
            nameKey="targetType"
            options={Object.keys(OrganizationEventTargetType).map((type) => ({
              label: upperCaseFirstLetter(type)?.split('_').join(' ') || '',
              value: type,
            }))}
            onChange={onChangeType}
            defaultValue={targetType as string}
          />
          {projects && hasProject(targetType as string) && (
            <InputFilter
              name="Project"
              nameKey="projectId"
              options={projects.map((project) => ({
                label: project.name || '',
                value: project.id,
              }))}
              onChange={onChangeType}
              defaultValue={projectId as string}
            />
          )}
          {projectId && hasEnvironment(targetType as string) && environments && (
            <InputFilter
              name="Environment"
              nameKey="environmentId"
              options={environments.map((environment) => ({
                label: environment.name || '',
                value: environment.id,
              }))}
              onChange={onChangeType}
              defaultValue={environmentId as string}
            />
          )}
          {eventsTargetsData && displayEventTargets && (
            <InputFilter
              name="Target"
              nameKey="targetId"
              options={eventsTargetsData.map((target) => ({
                label: target.name || '',
                value: target.id || '',
              }))}
              onChange={onChangeType}
              defaultValue={targetId as string}
              isLoading={isLoadingEventsTargetsData}
            />
          )}
        </div>
        {searchParams.toString()?.length > 0 && (
          <span className="link ml-6 cursor-pointer text-brand-500" onClick={clearFilter}>
            Clear all
          </span>
        )}
      </div>
    </>
  )
}

export default CustomFilter
