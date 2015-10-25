var config = {};

config.debug  = process.env.DEBUG || false;
config.socket = {};
config.mqtt   = {};

config.socket.host   = process.env.SOCKET_HOST   || '127.0.0.1';
config.socket.port   = process.env.SOCKET_PORT   || 1445;
config.socket.secret = process.env.SOCKET_SECRET || 'youshouldchangethis';

config.mqtt.namespace = process.env.MQTT_NAMESPACE || '';
config.mqtt.hostname  = process.env.MQTT_HOSTNAME  || '127.0.0.1';
config.mqtt.port      = process.env.MQTT_PORT      || 1883;

module.exports = config;
