/* eslint-disable @typescript-eslint/no-explicit-any */
export type BaseConfig = {
  // 当文件预览页面只有图片时的翻页方向
  pageTurnDirection4ImagesOnly: 'left2right' | 'right2left'
  // 页面设置
  page: {
    preview: 'default'
    tree: 'default'
  }
}

export type Config = BaseConfig & Record<string, any>

export type PartialConfig = Partial<Config>

export type FullConfig = {
  path: Record<
    string,
    {
      path: string
      config?: PartialConfig
    }
  >
  exclude?: string[]
  config?: PartialConfig
}
