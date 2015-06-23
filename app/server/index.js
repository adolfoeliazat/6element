"use strict";

require('es6-shim');
require('better-log').install();

var fs = require('fs');

var hardCodedSensors = require("./hardCodedSensors.js");
var decoder = require('6sense/src/codec/decodeFromSMS.js');

var path = require('path');
var express = require('express');
var app = express();
var http = require('http');
var compression = require('compression');
var bodyParser = require('body-parser');
var xml = require('xml');

var database = require('../database');
var dropAllTables = require('../database/management/dropAllTables');
var createTables = require('../database/management/createTables');
var fillDBWithFakeData = require('./fillDBWithFakeData.js');

var PORT = 4000;
var DEBUG = process.env.DEBUG ? process.env.DEBUG : false;

var debug = function() {
    if (DEBUG) {
        console.log("DEBUG from 6element server:");
        console.log.apply(console, arguments);
        console.log("==================");
    };
}

function rand(n){
    return Math.floor(n*Math.random());
}

dropAllTables()
    .then(createTables)
    .then(fillDBWithFakeData)
    // .then(hardCodedSensors)
    .catch(debug('drop and create'));

var server = http.Server(app);
var io = require('socket.io')(server);

io.set('origins', '*:*');

var socket = false;

io.on('connection', function(_socket) {
    socket = _socket;
});


app.use(compression());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use("/css/leaflet.css", express.static(path.join(__dirname, '../../node_modules/leaflet/dist/leaflet.css')));
app.use("/socket.io.js", express.static(path.join(__dirname, '../../node_modules/socket.io/node_modules/socket.io-client/socket.io.js')));
app.use("/css", express.static(path.join(__dirname, '../client/css')));
app.use("/images", express.static(path.join(__dirname, '../client/images')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/browserify-bundle.js', function(req, res){
    res.sendFile(path.join(__dirname, '../client/browserify-bundle.js'));
});


app.get('/live-affluence', function(req, res){
    database.complexQueries.currentRecyclingCenterAffluences()
        .then(function(data){
            res.send(data);
        })
        .catch(debug('/live-affluence'));
    
});


var socketMessage;

// endpoint receiving the sms from twilio
app.post('/twilio', function(req, res) {

    debug("Received sms from ", req.body.From, req.body.Body );

    // find sensor id by phone number
    database.Sensors.findByPhoneNumber(req.body.From)
        .then(function(sensor){
            if (sensor){
                debug("Found corresponding sensor: ", sensor);
                var body = req.body.Body;
                // decode message
                decoder(body)
                    .then(function(decodedMsg){

                        console.log("decoded msg ", decodedMsg);

                        // [{"date":"2015-05-20T13:48:00.000Z","signal_strengths":[]},{"date":"2015-05-20T13:49:00.000Z","signal_strengths":[]},{"date":"2015-05-20T13:50:00.000Z","signal_strengths":[]},{"date":"2015-05-20T13:51:00.000Z","signal_strengths":[]},{"date":"2015-05-20T13:52:00.000Z","signal_strengths":[]}]

                        Promise.all(decodedMsg.map(function(message){

                            var messageContent = {
                                'sensor_id': sensor.id,
                                'signal_strengths': message.signal_strengths,
                                'measurement_date': message.date
                            };
                            console.log("decoded msg ", decodedMsg);
                            socketMessage = Object.assign({}, messageContent);
                            socketMessage['installed_at'] = sensor.installed_at;

                            // persist message in database
                            var persitP = database.SensorMeasurements.create(messageContent);

                            return persitP;

                        }))
                        .then(function(id){
                            debug("Storage SUCCESS");
                            res.set('Content-Type', 'text/xml');
                            res.send(xml({"Response":""}));

                            // SOCKET IO
                            if (socket){
                                socket.emit('data', socketMessage);
                            }
                        })
                        .catch(function(id){
                            console.log("Storage FAILURE: ", id);
                            res.set('Content-Type', 'text/xml');
                            res.send(xml({"Response":""}));
                        });
                    })
                    .catch(function(error){
                        console.log("Error in decoding: ", error);
                    });
            } else {
                console.log("No sensor corresponding to this number.");
            }
        })
        .catch(function(error){
            console.log("Error in findByPhoneNumber: ", error);
        });   
});



app.get('/recycling-center/:rcId', function(req, res){
    var rcId = Number(req.params.rcId);
    
    database.complexQueries.getRecyclingCenterDetails(rcId)
        .then(function(data){
            res.send(data);
        })
        .catch(debug('/recycling-center/'+req.params.rcId));
});

io.on('connection', function(socket) {
    console.log('Socket io Connexion');

    setInterval(function(){
        var id = Math.floor(Math.random() * 28);
        console.log('emitting', id);
        socket.emit('data', {
            sensor_id: Math.floor(Math.random() * 28),
            signal_strengths: [10, 10, 10],
            measurement_date: new Date(),
            installed_at: id
        });
    }, 2000);
});

server.listen(PORT, function () {
    console.log('Server running on', [
        'http://localhost:',
        PORT
    ].join(''));
});
