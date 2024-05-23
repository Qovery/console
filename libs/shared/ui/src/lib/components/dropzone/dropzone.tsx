import { twMerge } from '@qovery/shared/util-js'
import Icon from '../icon/icon'

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
        `flex min-h-[140px] w-full cursor-pointer items-center justify-center rounded border border-neutral-250 bg-neutral-100 text-xs text-neutral-350 transition-all duration-150 ease-in-out hover:border-neutral-300`,
        classNamesDragIsActive,
        className
      )}
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Icon iconName="file-arrow-down" className="mb-2 text-xl" />
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
