/*
Basic stocks/indexs to include!
*/
var request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";

var loadedData = [];    // big array containing raw data
var info; 

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
   // console.log(object);
    loadedData[0] = object;
    processData();
    
    /*object.forEach(function (d){
                   console.log(d.Open);
                   });*/
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

function processData(){
    while(true){
        console.log("Entered loop");
        if (loadedData[0] != null ){
            var dateFormat = d3.time.format('%Y-%m-%d');
            
            loadedData[0].forEach(function (d,i){
                d.close = +d.Close;    //nudging these variables into 
                d.open = +d.Open;      //numbers 
                d.high = +d.High;
                d.low = +d.Low;
                d.dd = dateFormat.parse(d.Date);    // attempt to parse the data
                if (d.dd == null){
                    console.log("DATE IS NULL")
                    loadedData[0].splice(i,1);      // remove the object from the 
                } 
            });
            var cf = crossfilter(loadedData[0]);
            var all = cf.groupAll();
            
            // fetching the yearly dimension 
            var yearlyDimension = cf.dimension(function (d){
                //console.log(d.dd);
                if (d.dd != null){
                    return d3.time.year(d.dd).getFullYear();
                } else {
                    console.log ("Returning NULL");
                    return 0;
                }
                
            });
            
            
            
            console.log(loadedData[0]);

            break;
        } else {
            break;
        }
    
    }   
}
// Additional way to make HTTP request
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










