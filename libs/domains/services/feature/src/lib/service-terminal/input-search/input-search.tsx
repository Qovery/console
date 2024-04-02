import { useState } from 'react'
import { Button, Icon } from '@qovery/shared/ui'
import { useClickAway } from '@qovery/shared/util-hooks'

export interface InputSearchProps {
  data: string[]
  onChange: (value: string) => void
  placeholder: string
  value?: string
  trimLabel?: boolean
}

export function InputSearch({ data, value, onChange, placeholder, trimLabel }: InputSearchProps) {
  const [search, setSearch] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const filteredData = search && data.filter((item) => item.toLowerCase().includes(search.toLowerCase()))

  const ref = useClickAway(() => setIsOpen(false)) as React.RefObject<HTMLDivElement>

  return (
    <div className="relative z-10">
      {!isOpen && value ? (
        <Button color="neutral" onClick={() => setIsOpen(true)}>
          {value}
          <span
            onClick={(event) => {
              event.stopPropagation()
              onChange('')
              setSearch('')
            }}
          >
            <Icon iconName="xmark" className="ml-2 text-sm" />
          </span>
        </Button>
      ) : (
        <>
          <Icon iconName="magnifying-glass" className="text-neutral-50 absolute left-2.5 top-1.5 text-xs" />
          <input
            placeholder={placeholder}
            className="w-56 h-7 bg-transparent text-xs text-neutral-250 rounded pl-7 pr-2 border border-neutral-350 focus:outline-none focus:border-brand-400"
            value={search}
            onChange={(e) => {
              setIsOpen(true)
              setSearch(e.target.value)
            }}
            onFocus={() => setIsOpen(true)}
          />
        </>
      )}
      {isOpen && search && search.length > 0 && (
        <div ref={ref} className="mt-1 bg-neutral-600 p-2 rounded w-56 max-h-40">
          {filteredData && filteredData.length > 0 ? (
            <ul>
              {filteredData.map((v) => (
                <li key={v}>
                  <button
                    className="flex w-full h-9 items-center justify-between px-2 text-neutral-50 text-xs text-medium hover:text-neutral-200 outline-brand-400 transition"
                    onClick={() => {
                      setIsOpen(false)
                      onChange(v)
                      setSearch(v)
                    }}
                  >
                    {trimLabel ? `${v.substring(0, 10)}...${v.slice(-10)}` : v}
                    {v === value && <Icon iconName="check" />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="w-full text-center text-neutral-50 text-xs text-medium">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default InputSearch
