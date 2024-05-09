const net = require('net');
const toServerSocket = net.createConnection(3001, function () {
    console.log('Server Connected');
})
let toLocalSocket = null

function cmdParser(data) {
    if(data.startsWith('OPEN_PORT@')){
        const port = data.substring(10);
        toLocalSocket = net.createConnection(port, function () {
            console.log('local Connected @' + port);
        })
        toLocalSocket.on('data', data => {
            toServerSocket.write(data);
        })
        toLocalSocket.on('close', () => {
            console.log('local closed')
            toServerSocket.write('DISCONNECT');
            toLocalSocket = null;
        })
        toLocalSocket.on('error', () => {
            console.log('local error')
            toServerSocket.write('DISCONNECT');
            toLocalSocket = null;
        })
    }
}
toServerSocket.on('data', data => {
    const msg = data.toString();
    if(msg.startsWith('CMD:')) {
        cmdParser(msg.substring(4))
    } else if (toLocalSocket) {
        toLocalSocket.write(data);
    }
})
