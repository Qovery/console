import { useCallback, useEffect, useState } from 'react'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export interface InputFileProps {
  value: string | undefined
  onChange?: (e: string | undefined) => void
  className?: string
  accept?: string
  dataTestId?: string
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (reader.result) {
        resolve(reader.result as string)
      }
    })
    reader.readAsDataURL(file)
  })
}

export function InputFile(props: InputFileProps) {
  const { value, className = '', onChange, accept = 'image/*', dataTestId = 'input-file' } = props

  const [selectedImage, setSelectedImage] = useState<string | undefined | Blob | MediaSource>(value)

  useEffect(() => {
    if (value) setSelectedImage(value)
  }, [value, setSelectedImage])

  const handleChange = useCallback(
    (event: { target: HTMLInputElement & EventTarget }) => {
      async function doFileRead() {
        if (event.target.files && event.target.files.length > 0) {
          const result = await readFileAsDataURL(event.target.files[0])
          setSelectedImage(result as string)
          onChange && onChange(result as string)
        }
      }
      doFileRead()
    },
    [onChange]
  )

  return (
    <label
      data-testid={dataTestId}
      htmlFor="dropzone-file"
      className={`relative flex items-center justify-center w-[72px] h-[72px] rounded bg-element-light-lighter-100 border border-element-light-lighter-600 ease-out duration-150 border-dashed cursor-pointer ${
        !selectedImage ? 'hover:bg-element-light-lighter-300' : 'bg-element-light-lighter-100'
      } ${className}`}
    >
      <input
        data-testid="input-file-field"
        id="dropzone-file"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {selectedImage ? (
        <>
          <img
            data-testid="input-file-image"
            className="absolute z-10 top-0 left-0 w-full h-full object-contain p-2 hover:opacity-75 ease-out duration-150"
            src={selectedImage as string}
            alt="file"
          />
          <span
            onClick={(e) => {
              e.preventDefault()
              setSelectedImage(undefined)
              onChange && onChange(undefined)
            }}
            className="w-5 h-5 flex justify-center items-center absolute z-30 -top-2 -right-2 bg-brand-50 hover:bg-brand-100 text-text-400 hover:text-brand-500 ease-out duration-150 rounded-full"
          >
            <Icon name={IconAwesomeEnum.XMARK} className="text-xs" />
          </span>
        </>
      ) : (
        <svg
          className="relative"
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="14"
          fill="none"
          viewBox="0 0 17 14"
        >
          <path
            fill="#A1A8CF"
            d="M14.969 0h-12c-1.094 0-2 .906-2 2v10c0 1.125.906 2 2 2h12c1.094 0 2-.875 2-2V2c0-1.094-.875-2-2-2zm-10.5 2c.812 0 1.5.688 1.5 1.5 0 .844-.657 1.5-1.5 1.5-.875 0-1.5-.656-1.5-1.5 0-.813.687-1.5 1.5-1.5zm10.468 9.75a.539.539 0 01-.437.25H3.562a.514.514 0 01-.468-.25c-.063-.188-.063-.375.062-.531l2.188-3A.488.488 0 015.75 8c.156 0 .281.094.375.219l1.031 1.406 2.907-4.375A.499.499 0 0110.5 5c.156 0 .313.094.406.25l4 6c.094.125.094.344.031.5z"
          />
        </svg>
      )}
    </label>
  )
}

export default InputFile
