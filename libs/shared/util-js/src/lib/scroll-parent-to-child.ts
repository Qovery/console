export function scrollParentToChild(
  parent: HTMLDivElement | Element,
  child: HTMLDivElement | Element,
  heightOffset = 0
) {
  // Where is the parent on page
  const parentRect = parent.getBoundingClientRect()
  // What can you see?
  const parentViewableArea = {
    height: parent.clientHeight,
    width: parent.clientWidth,
  }

  // Where is the child
  const childRect = child.getBoundingClientRect()
  // Is the child viewable?
  const isViewable = childRect.top >= parentRect.top && childRect.bottom <= parentRect.top + parentViewableArea.height

  // if you can't see the child try to scroll parent
  if (!isViewable) {
    // Should we scroll using top or bottom? Find the smaller ABS adjustment
    const scrollTop = childRect.top - parentRect.top
    const scrollBot = childRect.bottom - parentRect.bottom
    if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
      // we're near the top of the list
      parent.scrollTop += scrollTop + heightOffset
    } else {
      // we're near the bottom of the list
      parent.scrollTop += scrollBot + heightOffset
    }
  }
}
