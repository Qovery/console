import { render } from '@testing-library/react'
import WebhookCrudModal from './webhook-crud-modal'

describe('WebhookCrudModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebhookCrudModal />)
    expect(baseElement).toBeTruthy()
  })
})
