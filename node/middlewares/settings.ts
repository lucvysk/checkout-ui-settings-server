import { removeVersionFromAppId } from '@vtex/api'

import { LINKED } from '../constants'

function parseFileFromURL(url: string) {
  const maybeFileWithQuery = url.split('/')[2]
  const maybeFile = maybeFileWithQuery.split('?')[0]
  return maybeFile
}
const parseBuffer = (buffer: Buffer) => buffer.toString()


const DATA_ENTITY = 'checkoutcustom'
const CACHE = 60

export async function getSettingsFromContext(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { masterdata, vbase },
    request: { url },
    vtex: { workspace, production, logger },
  } = ctx

  const file = parseFileFromURL(url)

  if (!file || !(typeof file === 'string')) {
    throw new Error('Error parsing settings file from URL.')
  }
  const fileType = file.split('.').pop() === 'css' ? 'text/css' : 'text/javascript'

  let mdFiles: any = []
  let settingFile = ''

  if (!ctx.vtex.settings) {
    throw new Error(`Error getting settings from context when asking for file ${file}.`)
  }

  for (let i = 0; i < ctx.vtex.settings.length; i++) {

    const settingsObject = ctx.vtex.settings[i] ? ctx.vtex.settings[i] : null

    const settingsDeclarer = removeVersionFromAppId(settingsObject.declarer)
    const allSettingsFromDeclarer = settingsObject[settingsDeclarer]


    if (settingsDeclarer === 'vtex.checkout-ui-custom') {
      settingFile += allSettingsFromDeclarer[file]

      try {
        const field = fileType === 'text/css' ? 'cssBuild' : 'javascriptBuild'

        const vbFile = await vbase.getFile('checkoutuicustom', `${workspace}-${field}`)
          .then((res: any) => {return res.data})
          .catch((error) => {
            if(!error.response || error.response.status !== 404) {
              logger.error({message: `Error retrieving VBase file ${workspace}-${field}`})
            }
            return null
          })

        if (vbFile) {
          settingFile += parseBuffer(vbFile)
        }

        if (!vbFile) {
          const schemas = await masterdata.getSchemas().then((res: any) => res.data)
          if (schemas && schemas.length) {
            mdFiles = await masterdata.searchDocuments({
              dataEntity: DATA_ENTITY,
              fields: [field],
              sort: 'creationDate DESC',
              schema: schemas.sort(function (a: any, b: any) {
                return a.name > b.name ? -1 : 1
              })[0].name,
              where: `workspace=${workspace}`,
              pagination: {
                page: 1,
                pageSize: 1,
              },
            })
            if (mdFiles && mdFiles.length) {
              settingFile += mdFiles[0][field]
            }
          }
        }
      } catch (e) {
        throw new Error(`Error getting ${file} from MD or VB.`)
      }
    } else {
      settingFile += "\r\n/* source: <" + settingsDeclarer + "> */\r\n"
      if (allSettingsFromDeclarer[file] !== undefined) {
        settingFile += allSettingsFromDeclarer[file]
      }
    }
  }

  if (!settingFile) {
    throw new Error(`Error getting setting ${file} from context.`)
  }

  const cacheType = LINKED ? 'no-cache' : 'public, max-age=' + (production ? CACHE : 10)

  ctx.set('cache-control', cacheType)
  ctx.set('content-type', fileType)
  ctx.status = 200
  ctx.body = settingFile

  await next()
}
