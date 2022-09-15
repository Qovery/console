import { useEffect, useState } from 'react'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'

export interface InputFileProps {
  value: string
  onChange?: (e: string) => void
  className?: string
  accept?: string
}

export function InputFile(props: InputFileProps) {
  const { value, className = '', onChange, accept = 'image/*' } = props

  const [selectedImage, setSelectedImage] = useState<string | undefined | Blob | MediaSource>(value)

  useEffect(() => {
    if (value) setSelectedImage(value)
  }, [value, setSelectedImage])

  const imageChange = (event: { target: HTMLInputElement & EventTarget }) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0] as any

      setSelectedImage(file)

      // convert to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        onChange && onChange(reader.result as string)
      }
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(undefined)
  }

  const checkIfBase64 = (value: string) => {
    return /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(value)
  }

  return (
    <label
      htmlFor="dropzone-file"
      className={`relative flex items-center justify-center w-[72px] h-[72px] rounded bg-element-light-lighter-100 border border-element-light-lighter-600 ease-out duration-150 border-dashed cursor-pointer ${
        !selectedImage ? 'hover:bg-element-light-lighter-300' : 'bg-element-light-lighter-100'
      } ${className}`}
    >
      <input id="dropzone-file" type="file" className="hidden" accept={accept} onChange={imageChange} />

      {selectedImage ? (
        <>
          <img
            className="absolute z-10 top-0 left-0 w-full h-full object-contain p-2 hover:opacity-75 ease-out duration-150"
            src={
              checkIfBase64(selectedImage as string) ? URL.createObjectURL(selectedImage as Blob | MediaSource) : value
            }
            alt="file"
          />
          <span
            onClick={(e) => {
              e.preventDefault()
              removeSelectedImage()
            }}
            className="w-5 h-5 flex justify-center items-center absolute z-30 -top-2 -right-2 bg-brand-50 hover:bg-brand-100 text-text-400 hover:text-brand-500 ease-out duration-150 rounded-full"
          >
            <Icon name={IconAwesomeEnum.XMARK} className="text-xs" />
          </span>
        </>
      ) : (
        <svg
          className="group-hover:z-20 relative"
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
