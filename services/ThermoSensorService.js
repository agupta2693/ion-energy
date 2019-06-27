const ThermoSensor = require('../models/ThermoSensor');
const mongoose = require('mongoose');
const gridfs = require('gridfs-stream');
const fs = require('fs');
const moment = require('moment');
moment().format();

var gfs;

var connection = mongoose.connection;
connection.once('open', () => gfs = gridfs(connection.db));

gridfs.mongo = mongoose.mongo;

var checkIfThermoSensorExists = async function(thermoSensorName) {
	var result = await ThermoSensor.findOne({name : thermoSensorName});
	if(result) {
		return true;
	}
	else 
		return false;
};

var removeAll = function() {
	ThermoSensor.deleteMany({}, () => console.log('Deleted all ThermoSensors'));
};

var save = async function(thermoSensorName) {
	console.log('Saving ThermoSensor with name : ' + thermoSensorName);
	var t1 = new ThermoSensor({
		name : thermoSensorName
	});
	var thermoSensor = await t1.save();
	console.log(thermoSensor);

	var fileDir = __dirname + '/../batch_data/'+thermoSensorName+'.json';

	var writestream = gfs.createWriteStream({ filename: thermoSensorName });
	fs.createReadStream(fileDir).pipe(writestream);
	writestream.on('close', function (file) {
        console.log('File Created : ' + file.filename);
    });
};

var displayBatchDataLength = function(thermoSensorName) {
	return new Promise((res, rej) => {
		console.log('Fetching batch data for sensor : ' + thermoSensorName);
		var readstream = gfs.createReadStream({ filename: thermoSensorName });
		var data = '';
		readstream.on('data', function(d) {
			data +=d;
		});

		readstream.on('end', function() {
			var arr = JSON.parse(data);
			console.log('Sensor data length for ' + thermoSensorName + ' : '+ arr.length);
			res(arr);
		})
	})
};

var calculateWeeklyAverage = async function(arr) {
	console.log('Processing weekly average');
	var newArr = {};
		
	for(var i in arr) {
		var currentDate = moment(arr[i].ts)
		var weekNumber = currentDate.isoWeek() + '-' + currentDate.year();
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
	return newArr;
};

var getWeeklyAverageThermoSensorData = async function(callback) {
	var thermoSensor = await ThermoSensor.findOne({});
	console.log('Found data : ' + thermoSensor.name);
	var batch_data = await displayBatchDataLength(thermoSensor.name);
	var weeklyAverage = await calculateWeeklyAverage(batch_data);
	callback(weeklyAverage);
};

module.exports = {
	checkIfThermoSensorExists : checkIfThermoSensorExists,
	removeAll : removeAll,
	save : save,
	displayBatchDataLength : displayBatchDataLength,
	getWeeklyAverageThermoSensorData : getWeeklyAverageThermoSensorData
};