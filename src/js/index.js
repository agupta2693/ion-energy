$(document).ready(function() {  

    var drawChart = function(dps) {

      console.log('inside func1 : ' + dps.length);

      var data = [];
      var dataSeries = { type: "scatter" };
      var dataPoints = [];
      dataSeries.dataPoints = dataPoints;
      data.push(dataSeries);

      console.log('inside func2 : ' + data[0].dataPoints.length);

      
      var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: false,
      title:{
        text: "Thermometer sensor data"
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

    console.log('inside func3 : ' + dps.length);

    for(var i in dps) {
      chart.data[0].addTo("dataPoints", {
        x: new Date(dps[i].weekDateInMillis),
        y:dps[i].totalValue/dps[i].totalInputs
      });
    }
  }
    
    $('#uploadBill').submit(function(e) {
        e.preventDefault(); 

        $("#output").empty().text("Finding Bill Amount...");  
  
        $(this).ajaxSubmit({  
  
            error: function(err) {  
                    $("#output").empty().text('Error: ' + err.responseText);  
            },  
  
            success: function(response) {  
                    console.log(response)  
                    $("#output").empty().text(response);  
            }  
        });  
    });

    $('#drawChartBtn').click(function() {
      $.getJSON('/getChartData', function(data) {
        console.log('request completed : ' + JSON.stringify(data[1]));
        drawChart(data); 
      });
    });

    $("#selectBill").change(function(){
        $("#output").empty();
    });


}); 