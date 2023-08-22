import { type MouseEvent, useEffect, useState } from 'react'
import Icon from '../icon/icon'
import Tag from '../tag/tag'
import Tooltip from '../tooltip/tooltip'

export interface TagCommitProps {
  commitId?: string
  withBackground?: boolean
  commitDeltaCount?: number
}

export function TagCommit(props: TagCommitProps) {
  const { commitId = '', withBackground, commitDeltaCount } = props
  const [hover, setHover] = useState(false)
  const [copied, setCopied] = useState(false)

  let displayCopy: ReturnType<typeof setTimeout> | undefined = undefined

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    setCopied(true)
    if (navigator.clipboard) navigator.clipboard.writeText(commitId)
    displayCopy = setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  useEffect(() => {
    return () => clearTimeout(displayCopy)
  }, [displayCopy])

  const contentTag = (
    <Tag
      data-testid="tag-commit"
      className={`border font-medium flex items-center justify-center ${withBackground ? 'bg-white' : ''} ${
        commitDeltaCount
          ? 'border-orange-500 text-orange-500'
          : 'border-element-light-lighter-500 text-zinc-350 hover:bg-element-light-lighter-400 w-[90px]'
      }`}
    >
      {!hover ? (
        <div className="w-4 mr-1">
          <Icon name="icon-solid-code-commit" className="mr-1" />
        </div>
      ) : (
        <div className="w-4 mr-1">
          <Icon name="icon-solid-copy" className="mr-1" />
        </div>
      )}
      {commitId.substring(0, 7)}
      {commitDeltaCount ? (
        <span className="bg-orange-500 text-white px-1 h-4 rounded-[34px] ml-1 inline-block">{commitDeltaCount}</span>
      ) : null}
    </Tag>
  )

  const copyTag = (
    <Tag
      data-testid="tag-commit"
      className="bg-green-500 text-white font-medium h-7 w-[70px] flex items-center justify-center"
    >
      <Icon name="icon-solid-check" className="mr-1 w-4" />
      Copied
    </Tag>
  )

  return (
    <Tooltip content="Copy">
      <div
        data-testid="tag-commit"
        className="block w-fit cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(e) => handleClick(e)}
      >
        {!copied ? contentTag : copyTag}
      </div>
    </Tooltip>
  )
}

export default TagCommit
