import { Button, ButtonSize, ButtonStyle, IconAwesomeEnum } from '@qovery/shared/ui'
import { BreadcrumbFeature } from '../../feature/breadcrumb/breadcrumb'

export function TopBar() {
  return (
    <div className="sticky top-0 left-16 z-20 border-l border-b w-full h-navbar-height dark:border-element-light-darker-100 dark:bg-element-light-darker-400 dark:border-b-0 border-element-light-lighter-400 bg-white">
      <div className="flex px-5 justify-between items-center h-full">
        <BreadcrumbFeature />
        <Button
          className="dark:hidden w-[245px]"
          style={ButtonStyle.STROKED}
          size={ButtonSize.LARGE}
          iconRight={IconAwesomeEnum.ARROW_RIGHT_FROM_BRACKET}
          onClick={() => window.location.replace(`https://console.qovery.com/platform/organization/`)}
        >
          Back to the console V2
        </Button>
      </div>
    </div>
  )
}

export default TopBar
