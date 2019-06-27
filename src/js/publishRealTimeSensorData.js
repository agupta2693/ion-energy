app.controller('publish_real_time_data_controller', function($scope, $http) {
  
  $scope.sensorValue = 50;

  $scope.publishData = function() {
    var data = {
      'ts' : new Date().getTime(),
      'val' : $scope.sensorValue
    };

    $http.post('/publishRealTimeSensorData', data)
      .then(function(response) {
        alert('Sensor Value Published!');
      })
  }
});
