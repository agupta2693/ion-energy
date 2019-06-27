const mongoose = require('mongoose');

const thermoSensorSchema = new mongoose.Schema({
	name : String
});

const ThermoSensor = mongoose.model('ThermoSensor', thermoSensorSchema);

module.exports = ThermoSensor;