import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import { ButtonSize } from '../buttons/button/button'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import InputSelectSmall from '../inputs/input-select-small/input-select-small'

export interface PaginationProps {
  nextDisabled?: boolean
  previousDisabled?: boolean
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
          dataTestId="button-previous-page"
          icon={IconAwesomeEnum.CHEVRON_LEFT}
          style={ButtonIconStyle.STROKED}
          size={ButtonSize.SMALL}
          className="!w-8"
          disabled={props.previousDisabled}
          onClick={() => props.onPrevious()}
          iconClassName="!text-xs"
        />
        <ButtonIcon
          dataTestId="button-next-page"
          icon={IconAwesomeEnum.CHEVRON_RIGHT}
          style={ButtonIconStyle.STROKED}
          size={ButtonSize.SMALL}
          className="!w-8"
          disabled={props.nextDisabled}
          onClick={() => props.onNext()}
          iconClassName="!text-xs"
        />
      </div>
      <div className="flex gap-3 items-center">
        <InputSelectSmall
          dataTestId="select-page-size"
          name="pageSize"
          className="!w-16"
          defaultValue={props.pageSize || '30'}
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
            {
              label: '100',
              value: '100',
            },
          ]}
        />
      </div>
    </div>
  )
}

export default Pagination
