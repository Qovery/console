// Code from https://github.com/testing-library/dom-testing-library/issues/140
import { buildQueries, getAllByRole, getNodeText } from '@testing-library/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isHTMLElement(element: any): element is HTMLElement {
  return element instanceof HTMLElement
}
const queryAllByDescriptionTerm = (container: HTMLElement, textMatch: string | RegExp) => {
  const hasText = (node: HTMLElement) => {
    const nodeText = getNodeText(node)
    return nodeText === textMatch || nodeText.match(textMatch)
  }
  return getAllByRole(container, 'definition').filter(
    (term) =>
      term.tagName === 'DD' && isHTMLElement(term.previousElementSibling) && hasText(term.previousElementSibling)
  )
}
const [
  queryByDescriptionTerm,
  getAllByDescriptionTerm,
  getByDescriptionTerm,
  findAllByDescriptionTerm,
  findByDescriptionTerm,
] = buildQueries(
  queryAllByDescriptionTerm,
  (c, name) => `Found multiple descriptions from term with name of ${name}`,
  (c, name) => `Unable to find a description from term with name of ${name}`
)
export {
  queryAllByDescriptionTerm,
  queryByDescriptionTerm,
  getAllByDescriptionTerm,
  getByDescriptionTerm,
  findAllByDescriptionTerm,
  findByDescriptionTerm,
}
