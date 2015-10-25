/**
 *
 * This application transforms socket messages into MQTT messages
 *
 * @author  Dennis de Greef <github@link0.net>
 * @license MIT
 *
 * Requires JSON structure for each request according to the following format (on a single line)
 *
 * {
 *     secret: "youshouldchangethis",
 *     topic: "/user/example/foo",
 *     message: "This is a message for the queue"
 * }
 *
 * in which you'll get a response with a boolean whether the request was accepted
 *
 * {
 *     success: true
 * }
 *
 */
var mqtt     = require('mqtt');
var net      = require('net');
var config   = require('./config');

var mqttUri  = 'mqtt://' + config.mqtt.hostname + ':' + config.mqtt.port;
var client   = mqtt.connect(mqttUri);

client.on('connect', onMqttConnection);

/**
 * When the MQTT connection is established, this function is called
 */
function onMqttConnection() {
    log("Connected to MQTT: " + mqttUri);

    net.createServer(onSocketServer).listen(config.socket.port, config.socket.host);
}

/**
 * When the socket server is created, this function is called
 *
 * @param socket
 */
function onSocketServer(socket) {
    log("Listening on tcp://" + config.socket.host + ':' + config.socket.port);
    socket.on('data', handleMessage);
}

/**
 * Handle method for messages on the socket
 *
 * @param streamData
 * @returns {*}
 */
function handleMessage(streamData) {
    // streamData is a Buffer, we wan't to parse a string
    var data = streamData.toString();

    // Validate the JSON after 'trimming'
    var json = validateJSON(data.replace(/^\s+|\s+$/g, ''));

    // Json must be valid
    if (!json) {
        return failure("Invalid JSON");
    }

    // Secret must match that if the config
    if (json.secret != config.socket.secret) {
        return failure("Incorrect secret");
    }

    // JSON must contain a topic for the MQTT publish
    if (json.topic == undefined) {
        return failure("Missing topic in JSON");
    }

    // JSON must contain a message for the MQTT publish
    if (json.message == undefined) {
        return failure("Missing message in JSON");
    }

    // Publish the message onto the MQTT connection
    client.publish(json.topic, json.message, {}, function() {
        return success(sock, json);
    });

}

/**
 * Called when call is succesfull
 *
 * @param socket
 * @param json
 */
function success(socket, json) {

    // Remove secret from object before logging
    delete json.secret;
    log("Success: " + JSON.stringify(json));

    writeResult(socket, {
        success: true
    });
}

/**
 * Called when something is wrong with handling the message
 *
 * @param socket
 * @param reason
 */
function failure(socket, reason) {
    log("Failure from " + socket.remoteAddress + ": " + reason);
    writeResult(socket, {
        success: false
    });
}

/**
 * Writes the result back to the original socket
 *
 * @param socket
 * @param json
 */
function writeResult(socket, json) {
    socket.write(JSON.stringify(json) + "\n");
}

/**
 * Like console.log, but prepends a time
 * @param message
 */
function log(message) {
    console.log((new Date().toISOString()) + ": " + message);
}

/**
 * Returns the given body if it is valid JSON, otherwise null
 *
 * @param body
 * @returns string|null
 */
function validateJSON(body) {
    try {
        return JSON.parse(body);
    } catch(e) {
        return null;
    }
}