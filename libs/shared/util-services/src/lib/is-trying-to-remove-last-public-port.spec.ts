import { isTryingToRemoveLastPublicPort } from './is-trying-to-remove-last-public-port'

const mockDomains = [
  {
    id: '1',
    domain: 'my-domain.com',
    generate_certificate: true,
    created_at: '2021-01-01',
  },
]

describe('isTryingToRemoveLastPublicPort', () => {
  describe('no domains are passed', () => {
    it('should return false', () => {
      const result = isTryingToRemoveLastPublicPort(
        'APPLICATION',
        [],
        {
          id: '1',
          publicly_accessible: true,
          internal_port: 80,
          protocol: 'HTTP',
        },
        []
      )

      expect(result).toBe(false)
    })
  })

  describe('some domains are passed', () => {
    describe('Application service', () => {
      it('should return false if the port is not the last publicly accessible port', () => {
        const result = isTryingToRemoveLastPublicPort(
          'APPLICATION',
          [
            {
              id: '1',
              publicly_accessible: false,
              internal_port: 80,
              protocol: 'HTTP',
            },
            {
              id: '2',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: false,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result).toBe(false)

        const result2 = isTryingToRemoveLastPublicPort(
          'APPLICATION',
          [
            {
              id: '1',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
            {
              id: '2',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: true,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result2).toBe(false)
      })

      it('should return true if the port is the last publicly accessible port', () => {
        const result = isTryingToRemoveLastPublicPort(
          'APPLICATION',
          [
            {
              id: '1',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: true,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result).toBe(true)

        const result2 = isTryingToRemoveLastPublicPort(
          'APPLICATION',
          [
            {
              id: '1',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
            {
              id: '2',
              publicly_accessible: false,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: true,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result2).toBe(true)
      })
    })

    describe('Helm service', () => {
      it('should return false if the port is not the last one', () => {
        const result = isTryingToRemoveLastPublicPort(
          'HELM',
          [
            {
              id: '1',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
            {
              id: '2',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: true,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result).toBe(false)
      })

      it('should return true if the port is the last publicly accessible port', () => {
        const result = isTryingToRemoveLastPublicPort(
          'HELM',
          [
            {
              id: '1',
              publicly_accessible: true,
              internal_port: 80,
              protocol: 'HTTP',
            },
          ],
          {
            id: '1',
            publicly_accessible: true,
            internal_port: 80,
            protocol: 'HTTP',
          },
          mockDomains
        )

        expect(result).toBe(true)
      })
    })
  })
})
