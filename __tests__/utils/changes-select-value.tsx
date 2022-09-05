import { act, fireEvent, getByRole, getByTestId } from '@testing-library/react'

export function simulateSpaceKeyClick(element: Element) {
  fireEvent.keyDown(element, { key: ' ' })
  fireEvent.keyUp(element, { key: ' ' })
}

export async function changeSelectValueByLabel(
  baseElement: HTMLElement,
  selectTestId: string,
  value: string
): Promise<void> {
  simulateSpaceKeyClick(getByTestId(getByTestId(baseElement, selectTestId), 'input-select-button'))

  const itemToSelect = getByRole(baseElement, 'option', {
    name: value,
  })
  await act(() => {
    fireEvent.click(itemToSelect)
  })
}
