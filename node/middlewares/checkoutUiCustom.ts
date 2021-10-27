const parseBuffer = (buffer: Buffer) => buffer.toString()

const DATA_ENTITY = 'checkoutcustom'

export async function getCheckoutUICustom(ctx: Context, fileType: string) {
  const {
    clients: { masterdata, vbase },
    vtex: { workspace, logger },
  } = ctx

  const field = fileType === 'text/css' ? 'cssBuild' : 'javascriptBuild'
  let settingFile = ''
  let mdFiles: any = []

  const vbFile = await vbase
    .getFile('checkoutuicustom', `${workspace}-${field}`)
    .then((res: any) => res.data)
    .catch((error: { response: { status: number } }) => {
      if (!error.response || error.response.status !== 404) {
        logger.error({
          message: `Error retrieving VBase file ${workspace}-${field}`,
        })
      }

      return null
    })

  if (vbFile) {
    settingFile += parseBuffer(vbFile)
  }

  if (!vbFile) {
    logger.info({
      message: 'checkout-ui-custom fallback to MD',
    })
    const schemas = await masterdata.getSchemas().then((res: any) => res.data)

    if (schemas?.length) {
      mdFiles = await masterdata.searchDocuments({
        dataEntity: DATA_ENTITY,
        fields: [field],
        sort: 'creationDate DESC',
        schema: schemas.sort((a: any, b: any) => {
          return a.name > b.name ? -1 : 1
        })[0].name,
        where: `workspace=${workspace}`,
        pagination: {
          page: 1,
          pageSize: 1,
        },
      })
      if (mdFiles?.length) {
        settingFile += String(mdFiles[0][field])
      }
    }
  }

  return settingFile
}
