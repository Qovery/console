import { Button, ButtonSize, ButtonStyle, IconAwesomeEnum } from '@qovery/shared/ui'
import { BreadcrumbFeature } from '../../feature/breadcrumb/breadcrumb'

export interface TopBarProps {
  darkMode?: boolean
}

export function TopBar(props: TopBarProps) {
  const { darkMode } = props

  return (
    <div
      className={`sticky top-0 left-16 border-l border-b w-full h-navbar-height ${
        darkMode
          ? 'border-element-light-darker-100 bg-element-light-darker-400 border-b-0'
          : 'border-element-light-lighter-400 z-10 bg-white'
      }`}
    >
      <div className="flex px-5 justify-between items-center h-full">
        <BreadcrumbFeature />
        {!darkMode && (
          <Button
            style={ButtonStyle.STROKED}
            size={ButtonSize.LARGE}
            iconRight={IconAwesomeEnum.ARROW_RIGHT_FROM_BRACKET}
            onClick={() => window.location.replace(`https://console.qovery.com/platform/organization/`)}
          >
            Back to the console V2
          </Button>
        )}
      </div>
    </div>
  )
}

export default TopBar
