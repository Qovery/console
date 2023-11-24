import { renderWithProviders } from '@qovery/shared/util-tests'
import CodeEditor from './code-editor'

const example = `labels: 
  qovery.labels.service
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel
  mylabel: mylabel 

postgres: 
  dabatase_url: qovery.env.DATABASE_URL 
`

describe('CodeEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CodeEditor defaultValue={example} defaultLanguage="yaml" />)
    expect(baseElement).toBeTruthy()
  })
})
