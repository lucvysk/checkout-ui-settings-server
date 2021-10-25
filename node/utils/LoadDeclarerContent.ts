/* eslint-disable max-params */
import { removeVersionFromAppId } from '@vtex/api'

import { getCheckoutUICustom } from '../middlewares/checkoutUiCustom'

export async function loadDeclarerContent(
  ctx: any,
  settingsObject: any,
  file: string,
  fileType: string
) {
  const settingsDeclarer = removeVersionFromAppId(settingsObject.declarer)
  let settingFile = `\r\n/* source: <${settingsDeclarer}> */\r\n`
  const allSettingsFromDeclarer = settingsObject[settingsDeclarer]
  const linkSettingFile = String(allSettingsFromDeclarer[file])

  if (settingsDeclarer === 'vtex.checkout-ui-custom') {
    try {
      settingFile += await getCheckoutUICustom(ctx, fileType)
    } catch (e) {
      throw new Error(`Error getting ${file} from MD or VB.`)
    }
  } else if (allSettingsFromDeclarer[file] !== undefined) {
    settingFile += String(allSettingsFromDeclarer[file])
  }

  return linkSettingFile ?? settingFile
}
