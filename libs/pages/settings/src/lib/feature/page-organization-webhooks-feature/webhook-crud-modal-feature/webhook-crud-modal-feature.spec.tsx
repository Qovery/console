import { render } from '@testing-library/react'
import WebhookCrudModalFeature from './webhook-crud-modal-feature'

describe('WebhookCrudModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebhookCrudModalFeature />)
    expect(baseElement).toBeTruthy()
  })
})
