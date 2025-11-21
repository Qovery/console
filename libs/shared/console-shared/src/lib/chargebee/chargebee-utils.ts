/**
 * Chargebee.js integration utilities
 * Provides functions to load and interact with Chargebee.js for secure payment processing
 * Chargebee handles the payment gateway (Stripe) tokenization internally
 */
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import { CHARGEBEE_PUBLISHABLE_KEY } from '@qovery/shared/util-node-env'

const CHARGEBEE_SITE = 'qovery'

let chargebeeInstance: CbInstance | null = null
let chargebeeLoadPromise: Promise<CbInstance> | null = null

/**
 * Load Chargebee.js script dynamically
 * This ensures we only load the script once and reuse the instance
 */
export function loadChargebee(): Promise<CbInstance> {
  // Return existing promise if already loading
  if (chargebeeLoadPromise) {
    return chargebeeLoadPromise
  }

  // Return existing instance if already loaded
  if (chargebeeInstance) {
    return Promise.resolve(chargebeeInstance)
  }

  chargebeeLoadPromise = new Promise((resolve, reject) => {
    // Check if Chargebee is already loaded globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chargebeeGlobal = (window as any).Chargebee
    if (chargebeeGlobal) {
      chargebeeInstance = chargebeeGlobal.init({
        site: CHARGEBEE_SITE,
        publishableKey: CHARGEBEE_PUBLISHABLE_KEY,
      })
      if (!chargebeeInstance) {
        reject(new Error('Failed to initialize Chargebee'))
        return
      }
      // Load components module for React wrapper
      ;(chargebeeInstance as any)
        .load('components')
        .then(() => {
          resolve(chargebeeInstance!)
        })
        .catch((error: Error) => {
          resolve(chargebeeInstance!)
        })
      return
    }

    // Load Chargebee.js script
    const script = document.createElement('script')
    script.src = 'https://js.chargebee.com/v2/chargebee.js'
    script.async = true

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chargebeeGlobal = (window as any).Chargebee
      if (!chargebeeGlobal) {
        reject(new Error('Chargebee.js failed to load'))
        return
      }

      chargebeeInstance = chargebeeGlobal.init({
        site: CHARGEBEE_SITE,
        publishableKey: CHARGEBEE_PUBLISHABLE_KEY,
      })
      if (!chargebeeInstance) {
        reject(new Error('Failed to initialize Chargebee'))
        return
      }
      // Load components module for React wrapper
      ;(chargebeeInstance as any)
        .load('components')
        .then(() => {
          resolve(chargebeeInstance!)
        })
        .catch((error: Error) => {
          console.warn('Failed to load Chargebee components module:', error)
          resolve(chargebeeInstance!)
        })
    }

    script.onerror = () => {
      reject(new Error('Failed to load Chargebee.js script'))
    }

    document.head.appendChild(script)
  })

  return chargebeeLoadPromise
}

/**
 * Get the Chargebee instance (must be loaded first)
 */
export function getChargebeeInstance(): CbInstance | null {
  return chargebeeInstance
}

export interface CardDetails {
  number: string
  cvv: string
  expiryMonth: number
  expiryYear: number
}

export interface ChargebeeTokenResult {
  token: string
  card: {
    lastFourDigits: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }
}

/**
 * Create and mount individual Chargebee field components for more control over layout
 * This creates separate iframe-based input fields for number, expiry, and CVV
 *
 * @param numberContainerId - The ID of the container element for the card number field
 * @param expiryContainerId - The ID of the container element for the expiry field
 * @param cvvContainerId - The ID of the container element for the CVV field
 * @param currency - Currency code in ISO 4217 format (e.g., 'USD', 'EUR'). Defaults to 'USD'
 * @returns Promise with an object containing all field components and a tokenize method
 */
export async function createIndividualCardFields(
  numberContainerId: string,
  expiryContainerId: string,
  cvvContainerId: string,
  currency = 'USD'
): Promise<any> {
  const cbInstance = await loadChargebee()

  if (!cbInstance) {
    throw new Error('Failed to load Chargebee instance')
  }

  // Load the components module before creating components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (cbInstance as any).load('components')

  // Common styles for all fields to match your design system
  const fieldStyles = {
    base: {
      color: '#333333',
      fontWeight: '400',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#9CA3AF',
      },
      ':focus': {
        color: '#333333',
      },
    },
    invalid: {
      color: '#EF4444',
      ':focus': {
        color: '#EF4444',
      },
    },
  }

  // Create card number field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const numberField = (cbInstance as any).createComponent('cardNumber', {
    currency: currency,
    styles: fieldStyles,
    placeholder: '1234 1234 1234 1234',
    locale: 'en',
  })

  // Create expiry field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expiryField = (cbInstance as any).createComponent('cardExpiry', {
    currency: currency,
    styles: fieldStyles,
    placeholder: 'MM / YY',
    locale: 'en',
  })

  // Create CVV field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cvvField = (cbInstance as any).createComponent('cardCvv', {
    currency: currency,
    styles: fieldStyles,
    placeholder: 'CVV',
    locale: 'en',
  })

  // Mount all fields
  await numberField.mount(`#${numberContainerId}`)
  await expiryField.mount(`#${expiryContainerId}`)
  await cvvField.mount(`#${cvvContainerId}`)

  // Create a combined component object for easier management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const combinedComponent: any = {
    numberField,
    expiryField,
    cvvField,
    // Combined tokenize method - Chargebee requires calling tokenize on the instance, not individual fields
    tokenize: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (cbInstance as any).tokenize()
    },
    // Combined ready event handler
    on: (event: string, callback: () => void) => {
      // Only fire callback when all fields are ready
      let readyCount = 0
      const fireWhenAllReady = () => {
        readyCount++
        if (readyCount === 3 && event === 'ready') {
          callback()
        }
      }

      numberField.on(event, fireWhenAllReady)
      expiryField.on(event, fireWhenAllReady)
      cvvField.on(event, fireWhenAllReady)
    },
    // Combined destroy method
    destroy: () => {
      numberField.destroy?.()
      expiryField.destroy?.()
      cvvField.destroy?.()
    },
  }

  return combinedComponent
}

/**
 * Create and mount a Chargebee card component for secure tokenization
 * This creates iframe-based input fields that handle card data securely
 *
 * @param containerId - The ID of the container element where the component will be mounted
 * @param currency - Currency code in ISO 4217 format (e.g., 'USD', 'EUR'). Defaults to 'USD'
 * @returns Promise with the card component instance
 */
export async function createCardComponent(containerId: string, currency = 'USD'): Promise<any> {
  const cbInstance = await loadChargebee()

  if (!cbInstance) {
    throw new Error('Failed to load Chargebee instance')
  }

  // Load the components module before creating components
  // This is required by Chargebee.js v2 to avoid "modules not loaded" error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (cbInstance as any).load('components')

  // Create a card component with currency configuration
  // Currency is required to determine which gateway configuration to use
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardComponent = (cbInstance as any).createComponent('card', {
    currency: currency,
    // Styling options to match the design system
    styles: {
      base: {
        color: '#383E50', // neutral-400
        fontWeight: '400',
        fontFamily: 'Roboto, Helvetica, sans-serif',
        fontSize: '14px', // text-sm
        lineHeight: '1.25rem',
        letterSpacing: '0.0025em',
        fontSmoothing: 'antialiased',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        // Remove default padding/margin
        padding: '0',
        margin: '0',
        '::placeholder': {
          color: '#67778E', // neutral-350
        },
        ':focus': {
          color: '#383E50', // neutral-400
        },
        ':hover': {
          color: '#383E50',
        },
      },
      invalid: {
        color: '#FF6240', // red-500
        ':focus': {
          color: '#FF6240',
        },
      },
    },
    // Classes to style the container to match input design
    classes: {
      base: 'chargebee-field-base',
      focus: 'chargebee-field-focus',
      invalid: 'chargebee-field-invalid',
      empty: 'chargebee-field-empty',
      complete: 'chargebee-field-complete',
    },
    // Layout configuration - set to stacked for vertical alignment
    layout: {
      type: 'stacked',
    },
    // Locale and placeholder options
    locale: 'en',
    placeholder: {
      number: '4111 1111 1111 1111',
      expiry: 'MM / YY',
      cvv: 'CVV',
    },
  })

  // Mount the component to the specified container
  await cardComponent.mount(`#${containerId}`)

  return cardComponent
}

/**
 * Tokenize the card data using a mounted Chargebee card component
 * The component must be created and mounted first using createCardComponent()
 *
 * @param cardComponent - The mounted Chargebee card component instance
 * @returns Promise with the tokenization result
 */
export async function tokenizeCardComponent(cardComponent: any): Promise<ChargebeeTokenResult> {
  return new Promise((resolve, reject) => {
    cardComponent
      .tokenize()
      .then((data: any) => {
        if (data.token) {
          resolve({
            token: data.token,
            card: {
              lastFourDigits: data.card?.last4 || '',
              brand: data.card?.brand || '',
              expiryMonth: data.card?.expiry_month || 0,
              expiryYear: data.card?.expiry_year || 0,
            },
          })
        } else {
          reject(new Error('No token returned from Chargebee'))
        }
      })
      .catch((error: Error) => {
        reject(error)
      })
  })
}
