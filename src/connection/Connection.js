const { PRNG, log} = require("../helpers");
const { eventCenter } = require("../helpers");
const rand = PRNG(Date.now())
const pool = require("./Pool");
class Connection {
    static STATUS_CONNECTED = 1;
    static STATUS_WAITING = 2;

    static PROXY_FORWARD = 1;
    static PROXY_REVERSE = 2;

    waitOk = false;
    /**
     * @type {Connection}
     */
    proxy = null;

    /**
     *
     * @param {socket} socket
     * @param {1|2} proxyType
     */
    constructor(socket, proxyType = Connection.PROXY_FORWARD) {
        this.socket = socket;
        this.status = Connection.STATUS_WAITING;
        this.type = proxyType;
        this.idGenerator()
        this.onData = this.onData.bind(this);
        this.onError = this.onError.bind(this);
        this.onEnd = this.onEnd.bind(this);
        socket.on('error', this.onError);
        socket.on('close', this.onEnd);
        socket.on('data', this.onData);
        eventCenter.emit('connection:new', this);
    }

    idGenerator() {
        const len = 8;
        this.id = rand(16 ** len)
            .toString(16)
            .padStart(len, '0');
    }

    onData (data) {
        let msg = data.toString();
        if(msg.startsWith('CMD:')) {
            this.cmdParser(msg.substring(4))
        } else if(this.status === Connection.STATUS_CONNECTED) {
            this.proxy.write(data)
        }
    }

    /**
     * @param {string} data
     */
    cmdParser(data) {
        if(data === 'DISCONNECT'){
            eventCenter.emit('connection:disconnect', this);
        } else if (data === 'SHOW_SERVER'){
            eventCenter.emit('connection:cmd@show_server', this, data => {
                this.write(data)
            })
        } else if(data.startsWith('OPEN_PORT@')){
            this.proxy.write('CMD:' + data)
        } if(data.startsWith('CONNECT@')){
            const id= data.substring(8)
            eventCenter.emit('connection:connect', this, id);
        }
    }

    connect(connection) {
        if(this.status === Connection.STATUS_CONNECTED) {
            return;
        }
        this.proxy = connection;
        this.status = Connection.STATUS_CONNECTED;
        this.proxy.connect(this);
    }

    /**
     * @param {Error} err
     */
    onError(err) {
        log.write.e(err.stack.toString())
        this.destroy();
    }

    onEnd() {
        this.destroy()
    }

    write(data) {
        this.socket.write(data);
    }

    sendProxy(data) {
        this.write(data);
    }
    destroy() {
        this.socket.destroy();
        eventCenter.emit('connection:destroy', this);
    }
}

module.exports = Connection;
