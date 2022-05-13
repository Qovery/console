import React, { useEffect, useState } from 'react'
import Icon from '../icon/icon'
import Tag from '../tag/tag'
import Tooltip from '../tooltip/tooltip'

export interface TagCommitProps {
  commitId?: string
}

export function TagCommit(props: TagCommitProps) {
  const { commitId = '' } = props
  const [hover, setHover] = useState(false)
  const [copied, setCopied] = useState(false)

  let displayCopy: ReturnType<typeof setTimeout>

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setCopied(true)
    navigator.clipboard.writeText(commitId)
    displayCopy = setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  useEffect(() => {
    return () => clearTimeout(displayCopy)
  }, [])

  const contentTag = (
    <Tag className="border border-element-light-lighter-500 text-text-400 font-medium hover:bg-element-light-lighter-400">
      {!hover ? (
        <Icon name="icon-solid-code-commit" className="mr-1" />
      ) : (
        <Icon name="icon-solid-copy" className="mr-1" />
      )}
      {commitId.substring(0, 5)}
    </Tag>
  )

  const copyTag = (
    <Tag className="bg-success-500 text-white font-medium">
      <Icon name="icon-solid-check" className="mr-1" />
      Copied
    </Tag>
  )

  return (
    <Tooltip content="Copy">
      <div
        data-testid="tagcommit"
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
