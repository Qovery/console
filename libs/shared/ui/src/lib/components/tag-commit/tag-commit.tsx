import { type MouseEvent, useEffect, useState } from 'react'
import Icon from '../icon/icon'
import Tag from '../tag/tag'
import Tooltip from '../tooltip/tooltip'

export interface TagCommitProps {
  commitId?: string
  withBackground?: boolean
  commitDeltaCount?: number
}

// TODO: This should be a button
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
      className={`flex items-center justify-center border font-medium ${withBackground ? 'bg-white dark:bg-transparent' : ''} ${
        commitDeltaCount
          ? 'border-orange-500 text-orange-500'
          : 'w-[90px] border-neutral-250 text-neutral-350 hover:bg-neutral-200 dark:text-neutral-50 dark:hover:bg-neutral-400'
      }`}
    >
      {!hover ? (
        <div className="mr-1 w-4">
          <Icon iconName="code-commit" iconStyle="regular" className="mr-1" />
        </div>
      ) : (
        <div className="mr-1 w-4">
          <Icon iconName="copy" className="mr-1" />
        </div>
      )}
      {commitId.substring(0, 7)}
      {commitDeltaCount ? (
        <span className="ml-1 inline-block h-4 rounded-[34px] bg-orange-500 px-1 text-white">{commitDeltaCount}</span>
      ) : null}
    </Tag>
  )

  const copyTag = (
    <Tag
      data-testid="tag-commit"
      className="flex h-7 w-[70px] items-center justify-center bg-green-500 font-medium text-white"
    >
      <Icon iconName="check" iconStyle="regular" className="mr-1 w-4" />
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
