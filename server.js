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

client.on('connect', function () {
    log("Connected to MQTT: " + mqttUri);
    log("Starting to listen on tcp://" + config.socket.host + ':' + config.socket.port);
    net.createServer(function(sock) {
        sock.on('data', function(streamData) {
            var data = streamData.toString();

            var json = validateJSON(data.replace(/^\s+|\s+$/g, ''));
            if (json && json.secret == config.socket.secret) {

                if (json.topic == undefined || json.message == undefined) {
                    failure(sock, "Valid json and secret, but no topic or message set");
                }

                client.publish(json.topic, json.message, {}, function() {
                    success(sock, json);
                });

            } else {
                failure(sock, "Invalid json or secret");
            }
        });
    }).listen(config.socket.port, config.socket.host);
});

function success(socket, json) {

    // Remove secret from object before logging
    delete json.secret;
    log("Success: " + JSON.stringify(json));

    writeResult(socket, {
        success: true
    });
}

function failure(socket, reason) {
    log("Failure from " + socket.remoteAddress + ": " + reason);
    writeResult(socket, {
        success: false
    });
}

function writeResult(socket, json) {
    socket.write(JSON.stringify(json) + "\n");
}

function log(message) {
    console.log((new Date().toISOString()) + ": " + message);
}

function validateJSON(body) {
    try {
        return JSON.parse(body);
    } catch(e) {
        return null;
    }
}