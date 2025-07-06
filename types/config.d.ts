export type BaseConfig = {
  // 当文件预览页面只有图片时的翻页方向
  pageTurnDirection4ImagesOnly: 'left2right' | 'right2left'
  // 页面设置
  page: {
    preview: 'default'
    tree: 'default'
  }
}

export type PartialConfig = Partial<BaseConfig>

export type Config = {
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
