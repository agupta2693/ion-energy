
app.controller('index_controller', function($scope, $http) {

  $('#loadingSign').hide();
  $scope.drawChart = function(dps) {

      var data = [];
      var dataSeries = { type: "scatter" };
      var dataPoints = [];
      dataSeries.dataPoints = dataPoints;
      data.push(dataSeries);
      
      var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: false,
      title:{
        text: "Thermometer sensor data - Weekly Average"
      },
      axisX: {
        labelFormatter: function (e) {
          return CanvasJS.formatDate( e.value, "DD MMM YY");
        }
      },
      axisY: {
        valueFormatString: "###.##",
        minimum: 64.5,
        maximum: 65.6,
        interval: 0.1
      },
      data: data
    });
    chart.render();

    for(var i in dps) {
      chart.data[0].addTo("dataPoints", {
        x: new Date(dps[i].weekDateInMillis),
        y:dps[i].totalValue/dps[i].totalInputs
      });
    }
  }

  $scope.getChartData = function() {
    $('#loadingSign').show();
    console.log('Fetching data');
    $http.get('/getChartData')
      .then(function(response) {
        console.log('Data received');
        $scope.batchData = response.data;
        $scope.drawChart($scope.batchData);
        $('#loadingSign').hide();
      });
  };

});
