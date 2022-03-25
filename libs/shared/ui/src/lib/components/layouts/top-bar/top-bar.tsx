import { ButtonIcon, ButtonIconSize, ButtonIconStyle } from "../../buttons/button-icon/button-icon"

export function TopBar() {
  return (
    <div className='fixed top-0 left-14 border-l border-element-light-lighter-400 z-10 bg-white w-[calc(100%-3.5rem)] h-14'>
      <div className="flex px-5 justify-between items-center h-full">
        <div>
          list
        </div>
        <div className='flex gap-3'>
          <ButtonIcon icon="icon-solid-rocket" style={ButtonIconStyle.STROKED} size={ButtonIconSize.BIG} notification={true}></ButtonIcon>
          <ButtonIcon icon="icon-solid-bell" style={ButtonIconStyle.STROKED} size={ButtonIconSize.BIG} notification={true}></ButtonIcon>
          <ButtonIcon icon="icon-solid-magnifying-glass" style={ButtonIconStyle.STROKED} size={ButtonIconSize.BIG}></ButtonIcon>
        </div>
      </div>
    </div>
  )
}

export default TopBar
