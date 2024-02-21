import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export interface DropzoneProps {
  isDragActive: boolean
  className?: string
  typeFile?: string
}

export function Dropzone({ isDragActive, typeFile = '.env', className }: DropzoneProps) {
  const classNamesDragIsActive = isDragActive ? '' : 'border-dashed'

  return (
    <div
      className={twMerge(
        `flex w-full items-center justify-center min-h-[140px] rounded bg-neutral-100 border border-neutral-250 hover:border-neutral-300 transition-all ease-in-out duration-150 cursor-pointer text-neutral-350 text-xs`,
        classNamesDragIsActive,
        className
      )}
    >
      <div className="flex items-center h-full justify-center flex-col text-center">
        <Icon iconName="file-arrow-down" className="text-xl mb-2" />
        {!isDragActive ? (
          <p>
            Click to import your {typeFile} file or
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
