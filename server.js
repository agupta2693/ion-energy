const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ThermoSensorService = require('./services/ThermoSensorService');


async function saveThermoSensorIfNotExists(thermoSensorName) {
	var thermoSensorExists = await ThermoSensorService.checkIfThermoSensorExists(thermoSensorName);
	console.log(thermoSensorName + ' : ' + thermoSensorExists);
	if(thermoSensorExists) {
		ThermoSensorService.displayBatchDataLength(thermoSensorName);
	}
	else {
		var thermoSensor = await ThermoSensorService.save(thermoSensorName);
	}
}

function checkForNewBatchDataAndStoreIt() {
	fs.readdir('./batch_data/', (err, fileNames) => {
		if(err) {
			console.error('Error while reading directory :', err);
			return;
		}

		fileNames.forEach(async function(fileName) {
			console.log('fileName:' + fileName);
			var fileNameArray = fileName.split('.');
			if(fileNameArray[1] == "json" && fileNameArray.length == 2) {
				thermoSensorName = fileNameArray[0];
				saveThermoSensorIfNotExists(thermoSensorName);
			}
			else {
				console.error('Invalid fileName : ' + fileName);
			}
		});
	});
}

mongoose.connect('mongodb://localhost:27017/ion-energy')
	.then((err) => {
		console.log('Connected to mongodb database...');
		checkForNewBatchDataAndStoreIt();
		//ThermoSensorService.removeAll();
	})
	.catch((err) => console.error('Error while connectiong to mongodb:', err));

const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('*/js', express.static(__dirname + '/src/js'));
app.use('*/vendor', express.static(__dirname + '/src/vendor'));
app.use('*/img', express.static(__dirname + '/src/static/img'));

moment().format();
var realTimeSensorDataSubscribers = {};

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/real-time-sensor-data', (req, res) => {
	res.sendFile(__dirname + '/views/realTimeSensor.html');
});

app.get('/publish-real-time-data', (req, res) => {
	res.sendFile(__dirname + '/views/publishRealTimeSensorData.html');
});

app.post('/publishRealTimeSensorData', (req, res) => {
	console.log("Real time data receiived : " + JSON.stringify(req.body));
	for(var i in realTimeSensorDataSubscribers) {
		var socket = realTimeSensorDataSubscribers[i];
		socket.emit('newSensorData', req.body);
	}
	res.send(req.body);
});

app.get('/getChartData', (req, res) => {
	
	var callback = function(data) {
		console.log("Sending Response");
		res.send(data);
	};
	ThermoSensorService.getWeeklyAverageThermoSensorData(callback);
});

io.on('connection', function(socket) {
    console.log('Client connected...' + socket.id);

    socket.on('subscribeToRealTimeSensorData', function() {
        realTimeSensorDataSubscribers[socket.id] = socket;
        console.log('Total Subscribers : ' + Object.keys(realTimeSensorDataSubscribers).length);
    });

    socket.on('disconnect', function() {
        console.log('Client disconnected...' + socket.id);
        delete realTimeSensorDataSubscribers[socket.id];
        console.log('Total Subscribers : ' + Object.keys(realTimeSensorDataSubscribers).length);
    });
});


server.listen('8343', function() {
	console.log('Server listenning on port 8343 ...');
});