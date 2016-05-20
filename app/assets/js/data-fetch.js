/*
Basic stocks/indexs to include!
*/
var request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";

var loadedData = [];    // big array containing raw data

function makeJSObject(csv){
  var lines=csv.split("\n");
  var result = [];
  var headers=lines[0].split(",");
  for(var i=1;i<lines.length;i++){
	  var obj = {};
	  var currentline=lines[i].split(",");
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }
	  result.push(obj);
  }
  //console.log(result);
   return result; //object
  //console.log( JSON.stringify(result)); //JSON
}

/*
    On succesful execution of fetchData(), this function 
    is called to handle the processing of the page data 
    returned
*/
function handleData(responseData ) {
    // Do what you want with the data
    //console.log(responseData);
    var object = makeJSObject(responseData);
    object.forEach(function (d){
                   console.log(d.Open);
                   });
}

/*
    Wrapper function that encapsulates an asynchronus HTTP request specified
    by the string httpRequest. 
*/
function fetchData(httpRequest){
    $.ajax({
        url: httpRequest,
        success: function ( data, status, XHR ) {
            handleData(data);
        }
    });
}

fetchData(request);









//var margin = {top: 30, right: 20, bottom: 30, left: 50}, 
//    width = 600 - margin.left - margin.right,
//    height = 270 - margin.top - margin.bottom;
//
//// set the true ranges of x and y
//var x = d3.time.scale().range([0,width]);
//var y = d3.scale.linear().range([height, 0]);
//
//// define the axes
//var xAxis = d3.svg.axis().scale(x)
//            .orient("botom").ticks(5);
//var yAxis = d3.svg.axis().scale(y)
//            .orient("left").ticks(5);
//var valueline = d3.svg.line()
//    .



//function foo() {
//    // RETURN the promise
//    return fetch("https://www.quandl.com/api/v3/datasets/WIKI/FB/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH").then(function(response){
//        console.log("WORKED");
//        return response; // process it inside the `then`
//    
//    });
//}
//
//foo().then(function(response){
//    console.log(response);
//    
//});










