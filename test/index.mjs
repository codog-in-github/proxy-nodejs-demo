import net from 'net'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

const INDEX = 'index.html'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, 'static')

/**
 * 逐行读取字符串
 * @param {string} data
 * @param {(lineStr?:string, lineNumber?:number) => void} callback
 */
function readLine(data, callback) {
  let line = ''
  let lineNumber = 0
  for(let i = 0; i < data.length; i++) {
    if(data[i] === '\r') {
      continue
    } if(data[i] === '\n') {
      callback(line, lineNumber)
      lineNumber++;
      line = '';
    } else {
      line = line.concat(data[i])
    }
  }
}

/**
 * 获取请求的文件
 * @param {string} url http请求文件路径
 * @returns {string|null} 文件绝对路径
 */
function getRequestFileFullPath(url) {
  let requestFile = path.join(ROOT , url)
  if(!fs.existsSync(requestFile)) {
    return null
  }
  if(fs.statSync(requestFile).isDirectory()) {
    requestFile = path.join(requestFile, INDEX)
    if(!fs.existsSync(requestFile)) {
      return null
    }
  }
  if(!requestFile.startsWith(ROOT)) {
    return null
  }
  return requestFile
}

/**
 * 解析HTTP请求
 * @param {string} data
 * @returns {{headers: {}, filePath: string, content: string}}
 */
function praseHTTP (data) {
  const headers = {}
  let filePath = ''
  let content = ''
  let cb = function readFirstLine (line) {
    const [method, url, version] = line.split(/\s+/)
    filePath = getRequestFileFullPath(url)
    cb = function readOtherHeaders (line) {
      if(line === '') {
        cb = function readMessage (line) {
          content += line
        }
      } else {
        const [key, value] = line.split(':')
        headers[key.trim()] = value.trim()
      }
    }
  }
  readLine(data, (line) => cb(line))
  return { headers, filePath, content }
}

/**
 *
 * @param {string} file
 * @param {?number} bufferSize
 * @returns {Buffer[]}
 */
function readFileBuffer(file, bufferSize = 1024) {
  const buffers = []
  const fd = fs.openSync(file, 'r')
  while(true) {
    const buffer = Buffer.alloc(bufferSize)
    const bytesRead = fs.readSync(fd, buffer, 0, bufferSize, null)
    if(bytesRead === 0) {
      break
    }
    buffers.push(buffer)
  }
  return buffers
}

/**
 * 响应HTTP请求
 * @param {{ filePath: string }} response
 * @param {(data: string | Buffer) => void} write
 */
function writeResponse(response, write) {
  const { filePath } = response
  const code = filePath ? 200 : 404
  let contentType =  filePath
      ? `Content-Type: ${getContentType(filePath)}\r\n`
      : 'Content-Type: text/plain\r\n'
  write(`HTTP/1.1 ${code}\r\n` +
      contentType +
      `\r\n\r\n`)
  if(filePath) {
    write(fs.readFileSync(filePath))
  } else {
    write('404 Not Found')
  }
}

function getContentType(file) {
  const ext = path.extname(file)
  switch(ext) {
    case '.html':
      return 'text/html'
    case '.css':
      return 'text/css'
    case '.js':
      return 'text/javascript'
    case '.json':
      return 'application/json'
    case '.png':
      return 'image/png'
    case '.jpg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case'.ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}

net.createServer((socket) => {
  socket.on('data', (data) => {
    data = data.toString()
    let request = null
    try {
      request = praseHTTP(data)
    } catch (e) {
      socket.destroy()
      return
    }
    writeResponse({ filePath: request.filePath }, (data) => {
      socket.write(data)
    })
    socket.end()
  })
}).listen(3000)
