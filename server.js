const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const moment = require('moment');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('*/js', express.static(__dirname + '/src/js'));
app.use('*/vendor', express.static(__dirname + '/src/vendor'));

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

var readFile = function(callback) {
	fs.readFile('./THERM0001.json', 'utf8', (err, data) => {
		console.log('Reading done');
		var arr = JSON.parse(data);
		console.log(arr.length);
		
		var newArr = {};
		var yearStartMillis = arr[0].ts;
		var oneYearInMillis = 365*24*60*60*1000;
		var yearEndMillis = yearStartMillis + oneYearInMillis;
		
		for(var i in arr) {
			if(arr[i].ts < yearEndMillis) {
				var weekNumber = moment(arr[i].ts).week();
				if(newArr[weekNumber]) {
					newArr[weekNumber].totalValue += arr[i].val;
					newArr[weekNumber].totalInputs++;
				}
				else {
					newArr[weekNumber] = {
						totalValue : arr[i].val,
						totalInputs : 1,
						weekDateInMillis : arr[i].ts
					};
				}
			}
		}
		callback(newArr);
	});
}

app.get('/getChartData', (req, res) => {
	
	var callback = function(data) {
		console.log("Sending Response");
		res.send(data);
	};
	readFile(callback);
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