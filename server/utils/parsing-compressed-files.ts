import tryCatch from '~/utils/tryCatch'
import Zip from 'adm-zip'
import tar from 'tar-stream'
import rar from 'node-unrar-js'
import { readFileSync, createReadStream } from 'fs'

const compressedExtensions = ['zip', 'tar', 'rar']

/** 当前文件是压缩文件 */
export const isCompressedFile = (pathName: string): boolean => {
  const parts = pathName.split('/')
  if (parts.length === 0) return false
  const lastPart = parts[parts.length - 1]
  const ext = lastPart.split('.').pop()?.toLowerCase()
  return compressedExtensions.includes(ext ?? '')
}

/** 当前文件、文件夹在压缩文件内 */
export const inCompressedFile = (pathName: string): boolean => {
  const parts = pathName.split('/')
  parts.pop() // 移除最后一个部分
  if (parts.length === 0) return false
  const hasCompressedExt = parts.some((part) => {
    const ext = part.split('.').pop()?.toLowerCase()
    return compressedExtensions.includes(ext ?? '')
  })
  return hasCompressedExt
}

/** 将路径分解为压缩文件路径和其他路径 */
export function splitCompressedPath(pathName: string): {
  compressedFilePath: string
  otherPath: string[]
} {
  const parts = pathName.split('/')
  if (parts.length === 0) return { compressedFilePath: '', otherPath: [] }
  let compressedFilePath = ''
  let otherPath: string[] = []

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    const ext = part.split('.').pop()?.toLowerCase()
    if (compressedExtensions.includes(ext ?? '')) {
      compressedFilePath = parts.slice(0, i + 1).join('/')
      otherPath = parts.slice(i + 1)
      break
    }
  }

  return { compressedFilePath, otherPath }
}

/** 读取 zip 目录 */
export function readZipEntries(
  zipFilePath: string,
  path: string[]
  // password?: string
): {
  entries: { name: string; type: 'file' | 'directory' }[]
  error?: string
} {
  const [archive, error1] = tryCatch(() => new Zip(zipFilePath))
  if (error1) {
    return { entries: [], error: error1.message }
  }
  const folderPath = path.length > 0 ? path.join('/') + '/' : ''
  const entries: { name: string; type: 'file' | 'directory' }[] = []
  const seen = new Set<string>()
  for (const entry of archive.getEntries()) {
    if (!entry.entryName.startsWith(folderPath) || entry.entryName === folderPath) continue
    const rel = entry.entryName.slice(folderPath.length)
    if (rel === '' || (rel.includes('/') && rel.split('/')[0] === '')) continue
    const first = rel.split('/')[0]
    if (seen.has(first)) continue
    seen.add(first)
    if (rel.endsWith('/')) {
      entries.push({ name: first, type: 'directory' })
    } else if (!rel.includes('/')) {
      entries.push({ name: first, type: 'file' })
    } else {
      entries.push({ name: first, type: 'directory' })
    }
  }
  return { entries: Array.from(entries) }
}

/** 读取 zip 内文件 */
export function readZipFile(
  zipFilePath: string,
  pathArr: string[]
): { content: Buffer | null; error?: string } {
  const [archive, error1] = tryCatch(() => new Zip(zipFilePath))
  if (error1) {
    return { content: null, error: error1.message }
  }

  const fileName = pathArr.pop() ?? ''

  if (!fileName) {
    return { content: null, error: 'No file name provided' }
  }

  const folderPath = pathArr.length > 0 ? pathArr.join('/') + '/' : ''
  const entryName = folderPath + fileName
  const entry = archive.getEntry(entryName)
  if (!entry) {
    return { content: null, error: `File ${entryName} not found in zip archive` }
  }
  if (entry.isDirectory) {
    return { content: null, error: `Entry ${entryName} is a directory, not a file` }
  }
  const content = entry.getData()
  if (!content) {
    return { content: null, error: `Failed to read content of ${entryName}` }
  }
  return { content }
}

/** 读取 tar 目录 - 未测试 */
export async function readTarEntries(
  tarFilePath: string,
  path: string[]
): Promise<{
  entries: { name: string; type: 'file' | 'directory' }[]
  error?: string
}> {
  const extract = tar.extract()
  const folderPath = path.length > 0 ? path.join('/') + '/' : ''
  const entries: { name: string; type: 'file' | 'directory' }[] = []
  const seen = new Set<string>()
  return new Promise((resolve) => {
    extract.on('entry', (header, stream, next) => {
      if (!header.name.startsWith(folderPath) || header.name === folderPath) {
        stream.resume()
        return next()
      }
      const rel = header.name.slice(folderPath.length)
      if (rel === '' || (rel.includes('/') && rel.split('/')[0] === '')) {
        stream.resume()
        return next()
      }
      const first = rel.split('/')[0]
      if (seen.has(first)) {
        stream.resume()
        return next()
      }
      seen.add(first)
      if (header.type === 'directory' || rel.includes('/')) {
        entries.push({ name: first, type: 'directory' })
      } else {
        entries.push({ name: first, type: 'file' })
      }
      stream.resume()
      next()
    })
    extract.on('finish', () => {
      resolve({ entries })
    })
    extract.on('error', (err) => {
      resolve({ entries: [], error: err.message })
    })
    createReadStream(tarFilePath).pipe(extract)
  })
}

/** 读取 rar 目录 - 未测试 */
export async function readTarFile(
  tarFilePath: string,
  pathArr: string[]
): Promise<{ content: Buffer | null; error?: string }> {
  const fs = await import('fs')
  const { createReadStream } = fs
  const extract = tar.extract()
  const fileName = pathArr.pop() ?? ''
  if (!fileName) {
    return { content: null, error: 'No file name provided' }
  }
  const folderPath = pathArr.length > 0 ? pathArr.join('/') + '/' : ''
  const entryName = folderPath + fileName
  return new Promise((resolve) => {
    let found = false
    const chunks: Buffer[] = []
    extract.on('entry', (header, stream, next) => {
      if (header.name === entryName && header.type === 'file') {
        found = true
        stream.on('data', (chunk) => chunks.push(chunk))
        stream.on('end', () => {
          resolve({ content: Buffer.concat(chunks) })
        })
        stream.on('error', (err) => {
          resolve({ content: null, error: err.message })
        })
      } else {
        stream.resume()
        next()
      }
    })
    extract.on('finish', () => {
      if (!found) {
        resolve({ content: null, error: `File ${entryName} not found in tar archive` })
      }
    })
    extract.on('error', (err) => {
      resolve({ content: null, error: err.message })
    })
    createReadStream(tarFilePath).pipe(extract)
  })
}

/** 读取 rar 目录 - 未测试 */
export async function readRarEntries(
  rarFilePath: string,
  path: string[]
): Promise<{ entries: { name: string; type: 'file' | 'directory' }[]; error?: string }> {
  let archiveData: ArrayBuffer
  try {
    const buf = readFileSync(rarFilePath)
    archiveData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  } catch (err) {
    return { entries: [], error: (err as Error).message }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let extractor: any
  try {
    extractor = await rar.createExtractorFromData({ data: archiveData })
  } catch (err) {
    return { entries: [], error: (err as Error).message }
  }
  const folderPath = path.length > 0 ? path.join('/') + '/' : ''
  const entries: { name: string; type: 'file' | 'directory' }[] = []
  const seen = new Set<string>()
  const result = await extractor.getFileList()
  if (result[0].state !== 'SUCCESS') {
    return { entries: [], error: 'Failed to read rar file list' }
  }
  for (const entry of result[1].fileHeaders) {
    if (!entry.name.startsWith(folderPath) || entry.name === folderPath) continue
    const rel = entry.name.slice(folderPath.length)
    if (rel === '' || (rel.includes('/') && rel.split('/')[0] === '')) continue
    const first = rel.split('/')[0]
    if (seen.has(first)) continue
    seen.add(first)
    if (entry.flags.directory || rel.includes('/')) {
      entries.push({ name: first, type: 'directory' })
    } else {
      entries.push({ name: first, type: 'file' })
    }
  }
  return { entries }
}

/** 读取 rar 内文件 - 未测试 */
export async function readRarFile(
  rarFilePath: string,
  pathArr: string[]
): Promise<{ content: Buffer | null; error?: string }> {
  let archiveData: ArrayBuffer
  try {
    const buf = readFileSync(rarFilePath)
    archiveData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  } catch (err) {
    return { content: null, error: (err as Error).message }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let extractor: any
  try {
    extractor = await rar.createExtractorFromData({ data: archiveData })
  } catch (err) {
    return { content: null, error: (err as Error).message }
  }
  const fileName = pathArr.pop() ?? ''
  if (!fileName) {
    return { content: null, error: 'No file name provided' }
  }
  const folderPath = pathArr.length > 0 ? pathArr.join('/') + '/' : ''
  const entryName = folderPath + fileName
  const result = await extractor.extractFiles([entryName])
  if (result[0].state !== 'SUCCESS') {
    return { content: null, error: `File ${entryName} not found in rar archive` }
  }
  const file = result[1].files.find(
    (f: { fileHeader: { name: string } }) => f.fileHeader.name === entryName
  )
  if (!file) {
    return { content: null, error: `File ${entryName} not found in rar archive` }
  }
  if (file.fileHeader.flags.directory) {
    return { content: null, error: `Entry ${entryName} is a directory, not a file` }
  }
  return { content: Buffer.from(file.extractorStream.readAll()) }
}

/**
 * 统一读取压缩包目录
 */
export async function readCompressedEntries(
  filePath: string,
  path: string[]
): Promise<{ entries: { name: string; type: 'file' | 'directory' }[]; error?: string }> {
  const type = filePath.split('.').pop()?.toLowerCase()
  if (!type || !['zip', 'tar', 'rar'].includes(type)) {
    return { entries: [], error: 'Unsupported archive type' }
  }
  if (type === 'zip') {
    return readZipEntries(filePath, path)
  }
  if (type === 'tar') {
    return await readTarEntries(filePath, path)
  }
  if (type === 'rar') {
    return await readRarEntries(filePath, path)
  }
  return { entries: [], error: 'Unsupported archive type' }
}

/**
 * 统一读取压缩包内文件
 */
export async function readCompressedFile(
  filePath: string,
  pathArr: string[]
): Promise<[Buffer, undefined] | [undefined, Error]> {
  const type = filePath.split('.').pop()?.toLowerCase()
  if (!type || !['zip', 'tar', 'rar'].includes(type)) {
    return [void 0, new Error('Unsupported archive type')]
  }

  if (type === 'zip') {
    const { content, error } = readZipFile(filePath, pathArr)
    if (error || !content) {
      return [void 0, new Error(error)]
    }
    return [content, void 0]
  }
  if (type === 'tar') {
    const { content, error } = await readTarFile(filePath, [...pathArr])
    if (error || !content) {
      return [void 0, new Error(error)]
    }
    return [content, void 0]
  }
  if (type === 'rar') {
    const { content, error } = await readRarFile(filePath, [...pathArr])
    if (error || !content) {
      return [void 0, new Error(error)]
    }
    return [content, void 0]
  }
  return [void 0, new Error('Unsupported archive type')]
}

/** 获取压缩包内指定文件的字节大小 */
export async function getCompressedFileSize(
  filePath: string,
  pathArr: string[]
): Promise<number | undefined> {
  const type = filePath.split('.').pop()?.toLowerCase()
  if (!type || !['zip', 'tar', 'rar'].includes(type)) return undefined
  if (type === 'zip') {
    const [archive, error1] = tryCatch(() => new Zip(filePath))
    if (error1) return undefined
    const fileName = pathArr[pathArr.length - 1]
    const folderPath = pathArr.length > 1 ? pathArr.slice(0, -1).join('/') + '/' : ''
    const entryName = folderPath + fileName
    const entry = archive.getEntry(entryName)
    if (!entry || entry.isDirectory) return undefined
    return entry.header.size
  }
  if (type === 'tar') {
    return await new Promise((resolve) => {
      const extract = tar.extract()
      const fileName = pathArr[pathArr.length - 1]
      const folderPath = pathArr.length > 1 ? pathArr.slice(0, -1).join('/') + '/' : ''
      const entryName = folderPath + fileName
      let found = false
      extract.on('entry', (header, stream, next) => {
        if (header.name === entryName && header.type === 'file') {
          found = true
          resolve(header.size)
          stream.resume()
        } else {
          stream.resume()
          next()
        }
      })
      extract.on('finish', () => {
        if (!found) resolve(undefined)
      })
      extract.on('error', () => resolve(undefined))
      createReadStream(filePath).pipe(extract)
    })
  }
  if (type === 'rar') {
    try {
      const buf = readFileSync(filePath)
      const archiveData = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractor: any = await rar.createExtractorFromData({ data: archiveData })
      const result = await extractor.getFileList()
      if (result[0].state !== 'SUCCESS') return undefined
      const fileName = pathArr[pathArr.length - 1]
      const folderPath = pathArr.length > 1 ? pathArr.slice(0, -1).join('/') + '/' : ''
      const entryName = folderPath + fileName
      const entry = result[1].fileHeaders.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => e.name === entryName && !e.flags.directory
      )
      if (!entry) return undefined
      return entry.unpackedSize
    } catch {
      return undefined
    }
  }
  return undefined
}
