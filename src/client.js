const net = require('net');
const readline = require('readline');
const socket = net.createConnection(3001, function () {
    console.log('Connected');
})
let currentSocket = null
const stdio = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function cmdParser(data) {
    if(data === 'DISCONNECT') {
        currentSocket.destroy()
        currentSocket = null
    }
}
socket.on('data', function (data) {
    const msg = data.toString()
    if(msg.startsWith('CMD:')) {
        cmdParser(msg.substring(4))
    }
})

socket.on('close', function () {
    process.exit()
})
stdio.on('line', function (input) {
    if(['\\q', 'exit', 'quit'].includes(input)) {
        socket.end()
        process.exit()
    }
    socket.write('CMD:' + input)
})

net.createServer(function (con) {
    if(!currentSocket) {
        con.end('only one connection')
    }
    con.on('data', function (data) {
        socket.write(data)
    })
    con.on('close', function () {
        currentSocket = null
        socket.end()
    })
    socket.on('data', function (data) {
        con.write(data)
    })
    socket.on('error', function () {
        con.end()
    })
}).listen(3002)

