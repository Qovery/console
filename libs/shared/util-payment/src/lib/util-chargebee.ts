import type { Component } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/base-types'
import type { Events } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/enums'
import type { CbToken, ComponentOptions } from '@chargebee/chargebee-js-types/cb-types/hosted_fields/common/types'
import type CbInstance from '@chargebee/chargebee-js-types/cb-types/models/cb-instance'
import Color from 'color'
import { CHARGEBEE_PUBLISHABLE_KEY } from '@qovery/shared/util-node-env'

interface ChargebeeTokenizeResult extends CbToken {
  card?: {
    last4: string
    brand: string
    expiry_month: number
    expiry_year: number
  }
}

type ChargebeeGlobal = {
  init(config: { site: string; publishableKey: string }): CbInstance
}

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
    const chargebeeGlobal = (window as Window & { Chargebee?: ChargebeeGlobal }).Chargebee
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
      chargebeeInstance
        .load('components')
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
        .catch(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.chargebee.com/v2/chargebee.js'
    script.async = true

    script.onload = () => {
      const chargebeeGlobal = (window as Window & { Chargebee?: ChargebeeGlobal }).Chargebee
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
      chargebeeInstance
        .load('components')
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(chargebeeInstance!)
        })
        .catch((error: Error) => {
          console.warn('Failed to load Chargebee components module:', error)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

export const fieldStyles: ComponentOptions['style'] = {
  base: {
    color: 'var(--color-neutral-400)',
    fontWeight: '400',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    fontSmoothing: 'antialiased',
    '::placeholder': {
      color: 'var(--color-neutral-350)',
    },
    ':focus': {
      color: 'var(--color-neutral-400)',
    },
  },
  invalid: {
    color: 'var(--color-red-500)',
    ':focus': {
      color: 'var(--color-red-500)',
    },
  },
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
): Promise<{
  numberField: Component
  expiryField: Component
  cvvField: Component
  tokenize: () => Promise<ChargebeeTokenizeResult>
  on: (event: Events, callback: () => void) => void
  destroy: () => void
}> {
  const cbInstance = await loadChargebee()

  if (!cbInstance) {
    throw new Error('Failed to load Chargebee instance')
  }

  // Load the components module before creating components
  await cbInstance.load('components')

  // Create card number field
  // Note: 'cardNumber', 'cardExpiry', 'cardCvv' are valid component types at runtime
  // but not defined in ComponentTypeRaw, so we use type assertion
  const numberField = cbInstance.createComponent(
    'cardNumber' as 'card',
    {
      currency: currency,
      style: fieldStyles,
      locale: 'en',
    } as Parameters<CbInstance['createComponent']>[1]
  ) as Component

  const expiryField = cbInstance.createComponent(
    'cardExpiry' as 'card',
    {
      currency: currency,
      style: fieldStyles,
      locale: 'en',
    } as Parameters<CbInstance['createComponent']>[1]
  ) as Component

  const cvvField = cbInstance.createComponent(
    'cardCvv' as 'card',
    {
      currency: currency,
      style: fieldStyles,
      locale: 'en',
    } as Parameters<CbInstance['createComponent']>[1]
  ) as Component

  await numberField.mount(`#${numberContainerId}`)
  await expiryField.mount(`#${expiryContainerId}`)
  await cvvField.mount(`#${cvvContainerId}`)

  const combinedComponent = {
    numberField,
    expiryField,
    cvvField,
    tokenize: (): Promise<ChargebeeTokenizeResult> => {
      return cbInstance.tokenize(numberField)
    },
    on: (event: Events, callback: () => void) => {
      // Only fire callback when all fields are ready
      let readyCount = 0
      const fireWhenAllReady = () => {
        readyCount++
        if (readyCount === 3 && event === 'ready') {
          callback()
        }
      }

      numberField.on?.(event, fireWhenAllReady)
      expiryField.on?.(event, fireWhenAllReady)
      cvvField.on?.(event, fireWhenAllReady)
    },
    destroy: () => {
      numberField.destroy?.()
      expiryField.destroy?.()
      cvvField.destroy?.()
    },
  }

  return combinedComponent
}

export const fieldCardStyles = () => {
  const styles = getComputedStyle(document.documentElement)
  const getColor = (color: string) => Color(styles.getPropertyValue(color)).rgb().string()

  return {
    base: {
      color: getColor('--neutral-12'),
      iconColor: getColor('--neutral-10'),
      fontWeight: '400',
      fontFamily: 'Roboto, Helvetica, sans-serif',
      fontSize: '14px',
      lineHeight: '1.25rem',
      letterSpacing: '0.0025em',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: getColor('--neutral-10'),
      },
      ':focus': {
        color: getColor('--neutral-12'),
      },
      ':hover': {
        color: getColor('--neutral-12'),
      },
    },
    invalid: {
      color: getColor('--negative-11'),
      iconColor: getColor('--negative-11'),
      ':focus': {
        color: getColor('--negative-11'),
      },
    },
  }
}

/**
 * Create and mount a Chargebee card component for secure tokenization
 * This creates iframe-based input fields that handle card data securely
 *
 * @param containerId - The ID of the container element where the component will be mounted
 * @param currency - Currency code in ISO 4217 format (e.g., 'USD', 'EUR'). Defaults to 'USD'
 * @returns Promise with the card component instance
 */
export async function createCardComponent(containerId: string, currency = 'USD'): Promise<Component> {
  const cbInstance = await loadChargebee()

  if (!cbInstance) {
    throw new Error('Failed to load Chargebee instance')
  }

  await cbInstance.load('components')

  const cardComponent = cbInstance.createComponent('card', {
    currency,
    style: fieldCardStyles(),
    classes: {
      focus: 'chargebee-field-focus',
      invalid: 'chargebee-field-invalid',
      empty: 'chargebee-field-empty',
      complete: 'chargebee-field-complete',
    },
    locale: 'en',
    placeholder: {
      number: '4111 1111 1111 1111',
      expiry: 'MM / YY',
      cvv: 'CVV',
    },
  })

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
export async function tokenizeCardComponent(cardComponent: Component): Promise<ChargebeeTokenResult> {
  return new Promise((resolve, reject) => {
    if (!cardComponent.tokenize) {
      reject(new Error('Tokenize method not available on component'))
      return
    }

    cardComponent
      .tokenize()
      .then((data: CbToken) => {
        if (data.token) {
          // Type assertion for card data since CbToken doesn't include card details
          const tokenData = data as ChargebeeTokenizeResult
          resolve({
            token: tokenData.token,
            card: {
              lastFourDigits: tokenData.card?.last4 || '',
              brand: tokenData.card?.brand || '',
              expiryMonth: tokenData.card?.expiry_month || 0,
              expiryYear: tokenData.card?.expiry_year || 0,
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
