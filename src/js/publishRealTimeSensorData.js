$(document).ready(function() {  

    $('#publishData').click(function() {

      var x = $('#sensorValue').val();

      var data = {
        'ts' : new Date().getTime(),
        'val' : x
      }

      $.ajax({
        type: "POST",
        url: '/publishRealTimeSensorData',
        data: data,
        success: function() {
        } 
      });

    });


}); 