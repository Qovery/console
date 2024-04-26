import Button from '../button/button'
import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import { ButtonLegacySize } from '../buttons/button-legacy/button-legacy'
import Icon from '../icon/icon'
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
        <Button
          data-testid="button-previous-page"
          className="justify-center w-9"
          variant="surface"
          color="neutral"
          size="md"
          disabled={props.previousDisabled}
          onClick={() => props.onPrevious()}
        >
          <Icon iconName="chevron-left" />
        </Button>
        <Button
          data-testid="button-next-page"
          className="justify-center w-9"
          variant="surface"
          color="neutral"
          size="md"
          disabled={props.nextDisabled}
          onClick={() => props.onNext()}
        >
          <Icon iconName="chevron-right" />
        </Button>
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
