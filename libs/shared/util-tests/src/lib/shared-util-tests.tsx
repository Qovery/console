// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { queries, render, within } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import userEvent from '@testing-library/user-event'
import * as customQueries from './custom-queries'

const allQueries = {
  ...queries,
  ...customQueries,
}

const customScreen = within(document.body, allQueries)
const customWithin = (element: Parameters<typeof within>[0]) => within(element, allQueries)
function customRender(
  ...arg: Parameters<typeof render>
): { userEvent: ReturnType<typeof userEvent.setup> } & ReturnType<typeof render> {
  return {
    userEvent: userEvent.setup(),
    ...render(...arg),
  }
}

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
export * from '@testing-library/react'
export { customScreen as screen, customWithin as within, customRender as render }
