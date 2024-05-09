const fs = require('fs')
const path = require('path')
const logDir = path.join(__dirname, '../../logs')
const getTimeStr = () => {
  return new Date().toLocaleString()
}
const getLogFileName = () => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDay().toString().padStart(2, '0')
    return path.join(logDir, `${year}${month}${day}.log`)
}

function appendFile(fileName, data) {
    const fd = fs.openSync(fileName, 'a')
    fs.writeFileSync(fd, data + '\n')
    fs.closeSync(fd)
}
function write (msg = '', type = 'INFO') {
    const logContent = `[${getTimeStr()}] [${type}] ${msg}`
    appendFile(getLogFileName(), logContent)
}
write.i = (msg) => {
    write(msg, 'INFO')
}
write.e = (msg) => {
    write(msg, 'ERROR')
}
write.w = (msg) => {
    write(msg, 'WARN')
}
write.d = (msg) => {
    write(msg, 'DEBUG')
}
write.s = (msg) => {
    write(msg, 'SUCCESS')
}
exports.write = write
