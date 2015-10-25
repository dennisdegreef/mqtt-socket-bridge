mqtt-socket-bridge
===========

This node.js server listens on a socket and accepts certain formed JSON strings.
If the JSON string (including a secret) match a format, the message will be broadcasted to the MQTT server

Example
=======

Clone the repository
```bash
$ git clone https://github.com/dennisdegreef/mqtt-socket-bridge.git
$ cd mqtt-socket-bridge
$ npm install
```

Start up the server by editing the config.js first to suit your needs
```bash
$ $EDITOR config.js
$ node server.js
```

Or by using environment variables
```bash
$ MQTT_HOSTNAME="192.168.0.1" SOCKET_PORT="1337" node server.js
```

Pass some JSON to the server from your shell to test it
```bash
echo '{"secret":"youshouldchangethis","topic":"/example","message":"Hello world!"}' | nc 127.0.0.1 1445
```

