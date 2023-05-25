// import { useState } from 'react'
import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import Button, { ButtonSize, ButtonStyle } from '../buttons/button/button'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import InputSelectSmall from '../inputs/input-select-small/input-select-small'

export interface PaginationProps {
  nextDisabled?: boolean
  previousDisabled?: boolean
  className?: string
  onNext: () => void | PaginationAction
  onPrevious: () => void | PaginationAction
  pageSize?: string
  onPageSizeChange?: (pageSize: string) => void
}

export interface PaginationAction {
  index: number
  url: string
  action: () => void
}

export function Pagination(props: PaginationProps) {
  // const [visitedPages, setVisitedPages] = useState<PaginationAction[] | undefined>([
  //   {
  //     index: 1,
  //     url: props.onNext.action,
  //   },
  // ])

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
        <Button
          dataTestId="button-previous-page"
          style={ButtonStyle.STROKED}
          size={ButtonSize.SMALL}
          className="!w-8"
          disabled={props.previousDisabled}
          onClick={() => props.onNext()}
        >
          1
        </Button>
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
