module.exports = {
    debug: process.env.DEBUG                  || false,
    socket: {
        host: process.env.SOCKET_HOST         || '127.0.0.1',
        port: process.env.SOCKET_PORT         || 1445,
        secret: process.env.SOCKET_SECRET     || 'youshouldchangethis'
    },
    mqtt: {
        namespace: process.env.MQTT_NAMESPACE || '',
        hostname: process.env.MQTT_HOSTNAME   || '127.0.0.1',
        port: process.env.MQTT_PORT           || 1883
    }
};
