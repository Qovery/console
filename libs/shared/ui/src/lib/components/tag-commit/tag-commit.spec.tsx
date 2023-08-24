import { render } from '__tests__/utils/setup-jest'
import TagCommit, { type TagCommitProps } from './tag-commit'

let props: TagCommitProps

beforeEach(() => {
  props = {
    commitId: 'aaa',
  }
})

describe('TagCommit', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TagCommit {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
