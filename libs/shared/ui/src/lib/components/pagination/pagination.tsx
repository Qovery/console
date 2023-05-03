import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import InputSelectSmall from '../inputs/input-select-small/input-select-small'

export interface PaginationProps {
  nextDisabled?: boolean
  previousDisabled?: boolean
  prevLink?: string
  className?: string
  onNext: () => void
  onPrevious: () => void
  pageSize?: string
  onPageSizeChange?: (pageSize: string) => void
}

export function Pagination(props: PaginationProps) {
  return (
    <div className={`flex justify-between ${props.className || ''}`}>
      <div className="flex gap-0.5 items-center">
        <ButtonIcon
          icon={IconAwesomeEnum.CHEVRON_LEFT}
          style={ButtonIconStyle.STROKED}
          className="!w-8 !h-8"
          disabled={props.previousDisabled}
          onClick={() => props.onPrevious()}
          iconClassName="!text-xs"
        />
        <ButtonIcon
          icon={IconAwesomeEnum.CHEVRON_RIGHT}
          style={ButtonIconStyle.STROKED}
          className="!w-8 !h-8"
          disabled={props.nextDisabled}
          onClick={() => props.onNext()}
          iconClassName="!text-xs"
        />
      </div>
      <div className="flex gap-3 items-center">
        <span className="text-xs text-element-light-lighter-600">Results 1-10 of 100</span>
        <InputSelectSmall
          name="pageSize"
          label=""
          className="!w-16"
          defaultValue={props.pageSize || '10'}
          onChange={(e) => props.onPageSizeChange && props.onPageSizeChange(e || '')}
          items={[
            {
              label: '10',
              value: '10',
            },
            {
              label: '30',
              value: '30',
            },
            {
              label: '50',
              value: '50',
            },
          ]}
        />
      </div>
    </div>
  )
}

export default Pagination
