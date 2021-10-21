import { removeVersionFromAppId } from '@vtex/api'

import { LINKED } from '../constants'
import { getCheckoutUICustom } from './checkoutUiCustom'

function parseFileFromURL(url: string) {
  const [, , maybeFileWithQuery] = url.split('/')
  const [maybeFile] = maybeFileWithQuery.split('?')

  return maybeFile
}

const CACHE = 60

export async function getSettingsFromContext(
  ctx: Context,
  next: () => Promise<any>
) {
  const {
    request: { url },
    vtex: { production },
  } = ctx

  const file = parseFileFromURL(url)

  if (!file || !(typeof file === 'string')) {
    throw new Error('Error parsing settings file from URL.')
  }

  const fileType =
    file.split('.').pop() === 'css' ? 'text/css' : 'text/javascript'

  let settingFile = ''
  const promisses = []

  if (!ctx.vtex.settings) {
    throw new Error(
      `Error getting settings from context when asking for file ${file}.`
    )
  }

  for (const settingsObject of ctx.vtex.settings) {
    const settingsDeclarer = removeVersionFromAppId(settingsObject.declarer)
    const allSettingsFromDeclarer = settingsObject[settingsDeclarer]

    if (settingsDeclarer === 'vtex.checkout-ui-custom') {
      try {
        promisses.push(getCheckoutUICustom(ctx, fileType))
      } catch (e) {
        throw new Error(`Error getting ${file} from MD or VB.`)
      }
    } else {
      settingFile += `\r\n/* source: <${settingsDeclarer}> */\r\n`
      if (allSettingsFromDeclarer[file] !== undefined) {
        settingFile += String(allSettingsFromDeclarer[file])
      }
    }
  }

  await Promise.all(promisses).then((res: any) => {
    res.forEach((element: string) => {
      settingFile += element
    })
  })

  if (!settingFile) {
    throw new Error(`Error getting setting ${file} from context.`)
  }

  const cacheType = LINKED
    ? 'no-cache'
    : `public, max-age=${production ? CACHE : 10}`

  ctx.set('cache-control', cacheType)
  ctx.set('content-type', fileType)
  ctx.status = 200
  ctx.body = settingFile

  await next()
}
