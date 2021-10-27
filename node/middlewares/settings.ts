import { LINKED } from '../constants'
import { loadDeclarerContent } from '../utils/LoadDeclarerContent'

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

  if (!ctx.vtex.settings) {
    throw new Error(
      `Error getting settings from context when asking for file ${file}.`
    )
  }

  const contents = await Promise.all(
    ctx.vtex.settings.map((settings: any) =>
      loadDeclarerContent(ctx, settings, file, fileType)
    )
  )

  const settingFile = contents.join('\r\n')

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
