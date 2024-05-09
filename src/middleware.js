const net = require('net');
const Connection = require('./connection/Connection');
const pool = require('./connection/Pool');

net.createServer(socket => {
  new Connection(socket);
}).listen(3001)
