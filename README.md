<h1 align="center">local cloud</h1>

## 说明

指定本地文件挂载到局域网服务器，所有局域网内设备访问。

可通直接在浏览器预览图片、文本、视频和音频文件。

## 特性

## 运行

### 安装 node

[直接安装 node](https://nodejs.org/en/download)

[使用 nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

[使用 fnm](https://github.com/Schniz/fnm?tab=readme-ov-file#installation)

### 克隆本分支到本地

```shell
git clone git@github.com:XunJiJiang/local-cloud.git
```

添加[挂载路径和排除文件]()

> [!TIP]
>
> 挂载路径需要绝对路径
>
> 排除文件匹配格式与 `gitignore` 相同

### 安装依赖

```bash
bun i
```

### 运行 Node.js 服务器

在项目根目录打开终端

```bash
npm run dev
```

## 免责声明 (Disclaimer)

1. local-cloud 主要用于学习和技术交流，请在遵守当地法律法规和版权政策的前提下使用。严禁用于非法目的。
2. 用户应对使用本工具处理的任何内容负责，包括确保拥有处理这些内容的合法权利。
3. 对于因使用或无法使用本项目而造成的任何直接或间接损失，项目作者不承担任何责任。

## 开源许可

项目采用 [MIT License](./LICENSE) 开源许可，详情请查阅 LICENSE 文件。
