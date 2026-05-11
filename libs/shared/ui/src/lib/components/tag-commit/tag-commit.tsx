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
      className={`flex items-center justify-center border font-medium ${withBackground ? 'bg-background' : ''} ${
        commitDeltaCount
          ? 'border-negative-strong text-negative'
          : 'w-[90px] border-neutral text-neutral-subtle hover:bg-surface-neutral-subtle'
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
        <span className="ml-1 inline-block h-4 rounded-[34px] bg-surface-negative-solid px-1 text-neutral-contrasted">
          {commitDeltaCount}
        </span>
      ) : null}
    </Tag>
  )

  const copyTag = (
    <Tag
      data-testid="tag-commit"
      className="flex h-7 w-[70px] items-center justify-center bg-surface-positive-solid font-medium text-neutral-contrasted"
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
