import { useState } from 'react'

export function useScrollWithShadow() {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const onScrollHandler = (event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
    setScrollHeight(event.currentTarget.scrollHeight)
    setClientHeight(event.currentTarget.clientHeight)
  }

  function getBoxShadow() {
    const isBottom = clientHeight === scrollHeight - scrollTop
    const isTop = scrollTop === 0
    const isBetween = scrollTop > 0 && clientHeight < scrollHeight - scrollTop

    let boxShadow = 'none'
    const top = 'inset 0 8px 5px -5px rgb(200 200 200 / 1)'
    const bottom = 'inset 0 -8px 5px -5px rgb(200 200 200 / 1)'

    if (isTop) {
      boxShadow = bottom
    } else if (isBetween) {
      boxShadow = `${top}, ${bottom}`
    } else if (isBottom) {
      boxShadow = top
    }
    return boxShadow
  }

  return { boxShadow: getBoxShadow(), onScrollHandler }
}
