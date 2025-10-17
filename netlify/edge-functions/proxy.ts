import type { Config, Context } from "@netlify/edge-functions";

export const config: Config = { path: '/proxy/*' }

const Preflight: ResponseInit = {
  status: 204,
  headers: new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
    'access-control-allow-headers': 'authorization',
    'access-control-max-age': '1728000',
  })
}

const NotFound: ResponseInit = {
  status: 404,
  headers: new Headers({
    'access-control-allow-origin': '*',
  })
}

const whitelist = [
  'https://registry.npmjs.org/',
  'https://npm.pkg.github.com/',
  'https://registry.npmmirror.com/',
]

export default async (request: Request, _context: Context) => {
  if (request.method === 'OPTIONS' && request.headers.has('access-control-request-headers'))
    return new Response(null, Preflight)

  const url = new URL(request.url)
  const target_ = url.href.slice(url.origin.length + '/proxy/'.length).replace(/^https?:\/+/, 'https://')

  if (whitelist.some(prefix => target_.startsWith(prefix))) {

    let target: URL
    try {
      target = new URL(target_)
    } catch {
      return new Response(null, NotFound)
    }

    const headers = new Headers(request.headers)
    headers.set('Host', target.host)
    headers.set('Referer', target.origin)

    const response = await fetch(target, {
      method: request.method,
      headers: headers,
      body: request.body,
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('access-control-allow-origin', '*')
    responseHeaders.set('access-control-allow-credentials', 'true')
    responseHeaders.delete('content-security-policy')
    responseHeaders.delete('content-security-policy-report-only')
    responseHeaders.delete('clear-site-data')

    return new Response(response.body, { status: response.status, headers: responseHeaders })
  }

  return new Response(null, NotFound)
}
