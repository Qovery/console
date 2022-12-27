import ButtonIcon, { ButtonIconStyle } from '../buttons/button-icon/button-icon'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import Skeleton from '../skeleton/skeleton'
import Tooltip from '../tooltip/tooltip'

export interface PropertyCardProps {
  name: string
  value: string
  isLoading?: boolean
  helperText?: string
  onSettingsClick?: () => void
  dataTestId?: string
}

export function PropertyCard(props: PropertyCardProps) {
  const { name, value, isLoading, helperText, onSettingsClick, dataTestId = 'property-card' } = props
  return (
    <div data-testid={dataTestId} className="px-5 py-4 rounded border border-element-light-lighter-500 bg-white flex">
      <div className="flex-grow">
        <Skeleton height={24} width={100} show={isLoading}>
          <h3 className="font-medium text-xl text-text-600 mb-1">{value}</h3>
        </Skeleton>
        <Skeleton height={24} width={100} show={isLoading}>
          <div className="text-xs text-text-600 flex">
            {name}{' '}
            {helperText && (
              <Tooltip side="right" content={helperText}>
                <div data-testid="icon-helper" className="ml-1 flex text-text-400 items-center">
                  <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
                </div>
              </Tooltip>
            )}
          </div>
        </Skeleton>
      </div>
      <ButtonIcon
        icon={IconAwesomeEnum.WHEEL}
        style={ButtonIconStyle.FLAT}
        dataTestId="property-card-settings-button"
        className=" flex-shrink-0 -mr-4 !text-text-400 hover:!text-text-600"
        iconClassName="cursor-pointer"
        onClick={onSettingsClick}
      />
    </div>
  )
}

export default PropertyCard
