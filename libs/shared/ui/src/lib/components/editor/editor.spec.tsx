import { renderWithProviders } from '@qovery/shared/util-tests'
import Editor from './editor'

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

describe('Editor', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Editor defaultValue={example} defaultLanguage="yaml" />)
    expect(baseElement).toBeTruthy()
  })
})
