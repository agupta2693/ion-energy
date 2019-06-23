$(document).ready(function() {  

    var chart;
     var dataPoints = [ {
        x : new Date(),
        y : 22
      },
      {
        x : new Date(new Date().getTime() + 1000),
        y : 28
      }];

    var drawChart = function() {

      var data = [];
      var dataSeries = { type: "scatter" };
     
      dataSeries.dataPoints = dataPoints;
      data.push(dataSeries);
      
      chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: false,
        title:{
          text: "Thermometer sensor data"
        },
        toolTip:{
        contentFormatter: function (e) {
            var xValue = CanvasJS.formatDate( e.entries[0].dataPoint.x, "DD MMM HH:mm:ss.fff");
            return xValue + " - " + e.entries[0].dataPoint.y;
          }
      },
        axisX: {
          labelFormatter: function (e) {
            return CanvasJS.formatDate( e.value, "DD MMM HH:mm:ss.fff");
          },
          title : 'Time'
        },
        axisY: {
          minimum: 0,
          maximum: 100,
          interval: 10
        },
        data: data
      });
      chart.render();  
    }

    var connectSocket = function() {
      var socket = io.connect('http://localhost:8343');
      
      socket.on('connect', function(msg) {
        console.log('connected')
        socket.emit('subscribeToRealTimeSensorData');
      });

      socket.on('newSensorData', function(dps) {
        console.log('newSensorData : ' + JSON.stringify(dps));
        dataPoints.push({
          x: new Date(parseInt(dps.ts)),
          y: parseInt(dps.val)
        });
        chart.render();
      });

    }

    drawChart();
    connectSocket();

}); 