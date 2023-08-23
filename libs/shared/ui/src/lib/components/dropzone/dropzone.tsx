import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface DropzoneProps {
  isDragActive: boolean
  className?: string
}

export function Dropzone(props: DropzoneProps) {
  const classNamesDragIsActive = props.isDragActive ? '' : 'border-dashed'

  return (
    <div
      className={`flex w-full items-center justify-center min-h-[144px] rounded bg-neutral-150 border border-neutral-300 hover:border-neutral-350 transition-all ease-in-out duration-150 cursor-pointer text-neutral-350 text-xs ${classNamesDragIsActive} ${
        props.className || ''
      }`}
    >
      <div className="flex items-center h-full justify-center flex-col text-center">
        <Icon name={IconAwesomeEnum.FILE_ARROW_DOWN} className="text-xl mb-2" />
        {!props.isDragActive ? (
          <p>
            Click to import your .env file or
            <br />
            drag and drop it
          </p>
        ) : (
          <p>Here!</p>
        )}
      </div>
    </div>
  )
}

export default Dropzone
