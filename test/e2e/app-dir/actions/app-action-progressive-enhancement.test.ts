/* eslint-disable jest/no-standalone-expect */
import { nextTestSetup } from 'e2e-utils'
import { check } from 'next-test-utils'
import type { Response } from 'playwright'

describe('app-dir action progressive enhancement', () => {
  const { next } = nextTestSetup({
    files: __dirname,
    dependencies: {
      react: 'latest',
      nanoid: 'latest',
      'react-dom': 'latest',
      'server-only': 'latest',
    },
  })

  it('should support formData and redirect without JS', async () => {
    let responseCode
    const browser = await next.browser('/server', {
      disableJavaScript: true,
      beforePageLoad(page) {
        page.on('response', (response: Response) => {
          const url = new URL(response.url())
          const status = response.status()
          if (url.pathname.includes('/server')) {
            responseCode = status
          }
        })
      },
    })

    await browser.eval(`document.getElementById('name').value = 'test'`)
    await browser.elementByCss('#submit').click()

    await check(() => {
      return browser.eval('window.location.pathname + window.location.search')
    }, '/header?name=test&hidden-info=hi')

    expect(responseCode).toBe(303)
  })

  it('should support actions from client without JS', async () => {
    const browser = await next.browser('/server', {
      disableJavaScript: true,
    })

    await browser.eval(`document.getElementById('client-name').value = 'test'`)
    await browser.elementByCss('#there').click()

    await check(() => {
      return browser.eval('window.location.pathname + window.location.search')
    }, '/header?name=test&hidden-info=hi')
  })
})
