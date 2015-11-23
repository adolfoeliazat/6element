"use strict";

require('es6-shim');

var path 		= require('path');
var bodyParser	= require('body-parser');
var express 	= require('express');
var app 		= express();

var networks = require('./database/models/networks.js');
var search = require('./searchFiles.js');
var stats = require('./statsFiles.js');
var dictionary = require('../data/dictionary.json');

var PORT = process.env.VIRTUAL_PORT ? process.env.VIRTUAL_PORT: 3500;
// var DEBUG = process.env.NODE_ENV === "development";

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}))

app.use('/', express.static(path.join(__dirname, '../src')));
app.use("/css/leaflet.css", 	express.static(path.join(__dirname, '../node_modules/leaflet/dist/leaflet.css')));
app.use("/images-leaflet", 	express.static(path.join(__dirname, '../node_modules/leaflet/dist/images')));
app.use("/css/material/", 	express.static(path.join(__dirname, '../node_modules/material-design-lite')));

app.get('/Citizen-browserify-bundle.js', function(req, res){
    res.sendFile(path.join(__dirname, '../Citizen-browserify-bundle.js'));
});

app.post('/search', search);
app.post('/stats', stats);
app.get('/networks', function(req, res){
	networks.getAll()
	.then(function(data){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
	})
	.catch(function(err){
		console.log('/networks error', err);
		res.status(500).send(err);
	});
});

var categoriesStr = JSON.stringify(dictionary);
app.get('/categories', function(req, res){
    res.setHeader('Content-Type', 'application/json');
	res.send(categoriesStr);
});


app.listen(PORT, function () {
    console.log('Server running on', [
        'http://localhost:',
        PORT
    ].join(''));
});

