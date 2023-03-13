import Ansi from 'ansi-to-react'
import { ReactNode } from 'react'

export const convertToAnsi = (content = ''): ReactNode => {
  return (
    <Ansi className="code-ansi" linkify>
      {content}
    </Ansi>
  )
}
