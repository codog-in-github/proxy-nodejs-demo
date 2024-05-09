const { eventCenter } = require('../helpers');
let pool = null;
class Pool {
    constructor(size) {
        if(pool) {
            throw new Error('Pool already exists');
        }
        this.max = size;
        this.pool = {};
        eventCenter.on('connection:new', connection => {
            this.add(connection);
        })
        eventCenter.on('connection:destroy', connection => {
            this.disconnect(connection)
        })
        eventCenter.on('connection:cmd@show_server', (connection, write) => {
            write(
                Object.keys(this.pool).join('\n')
            )
        })
        eventCenter.on('connection:connect', (connection, targetId) => {
            if(!this.pool[targetId]) {
                connection.write('fail')
                return;
            }
            connection.connect(this.pool[targetId])
        })
    }

    /**
     * @params {Connection} connection
     */
    add(connection) {
        if(this.isFull()) {
            throw new Error('Pool is full');
        }
        this.pool[connection.id] = connection;
    }

    isFull() {
        return Object.keys(this.pool).length >= this.max;
    }

    disconnect(connection) {
        if(!this.pool[connection.id]) {
            return
        }
        delete this.pool[connection.id];
        eventCenter.emit('connection:disconnect', connection);
    }

    destroy() {
        Object.keys(this.pool).forEach(id => {
            this.pool[id].destroy();
        });
        eventCenter.emit('pool:destroy', this)
    }
}

module.exports = pool = new Pool(20);
