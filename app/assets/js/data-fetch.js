/*
Basic stocks/indexs to include!
*/
var request = "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH"; 
var ticketLoaded = "FB";
// MAKE THIS DYNAMIC

var loadedData = [];    // big array containing raw data
var info; 
/*

GLOBAL VARIABLES

*/

var nameToTicker ={};
///////////////////

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


function resetViz(){
    fetchData("https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH");
    document.getElementById('ticketCode').value = '';
    document.getElementById('companyName').value = '';
    ticketLoaded = "NDAQ";
    updateInfo();
}

var settings = {
       "async": true,
       "crossDomain": true,
       "dataType": "json",
       "url": "/testQuery/",
       "method": "GET",
       "headers": {
         "accept": "application/json",
         "x-mashape-key": "APIKEY"
       }
    };
console.log("RESPONSE");
$.ajax(settings).done(function (response) {
    var text ="";
    var result ="\"";
    var text2 = "";
    var listofResponse = [];
    var listOfCompanyNames = [];
    for(var i = 0; i < response.length; i++){
        listofResponse[i] = (response[i].tickername).trim();
        listOfCompanyNames[i] = (response[i].companyname).trim();
        nameToTicker[response[i].companyname] = response[i].tickername;
    }
    var ticCode = document.getElementById("ticketCode");
    var cmpName = document.getElementById("companyName");
    var awesomeplete = new Awesomplete(ticCode, {
	   list: ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"]
    });
    var awesomepleteC = new Awesomplete(cmpName, {
	   list: ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"]
    });
    awesomepleteC.list = listOfCompanyNames;
    awesomeplete.list = listofResponse;
});





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

/**
    Various Charts That Make The Dashboard! 
**/

var gainOrLossChart = dc.pieChart('#gain-loss-chart');
var quarterChart = dc.pieChart('#quarter-chart');
var fluctuationChart = dc.barChart('#fluctuation-chart');
var closingPriceChart = dc.lineChart('#closing-price-chart');

//var timeSelectChart = dc.barChart('#date-select-chart');



function loadCompany(method){
    d3.selectAll("svg").remove();
    var settings;
    var ticketCode;
    if(method==='ticket'){
        ticketCode = document.getElementById('ticketCode').value;
        var ticketurl = '/tickerNameQuery/' + ticketCode;
        settings = {
           "async": true,
           "crossDomain": true,
           "dataType": "json",
           "url": ticketurl,
           "method": "GET",
           "headers": {
             "accept": "application/json",
             "x-mashape-key": "APIKEY"
           }
         };
    }else if(method==='company'){
        var companyName = document.getElementById('companyName').value;
        var companyurl = "/companyNameQuery/" + companyName;
        settings = {
           "async": true,
           "crossDomain": true,
           "dataType": "json",
           "url": companyurl,
           "method": "GET",
           "headers": {
             "accept": "application/json",
             "x-mashape-key": "APIKEY"
           }
         };
    }

    $.ajax(settings).done(function (response) {
        ticketCode = response[0].tickername;
        ticketCode = ticketCode.replace(/\s/g, '');
        cf.remove();
        console.log(fluctuation);
        $('#gain-loss-chart').empty();
        $('#quarter-chart').empty();
        $('#fluctuation-chart').empty();
        $('#closing-price-chart').empty();
        gainOrLossChart.resetSvg();
        quarterChart.resetSvg();
        fluctuationChart.resetSvg();
        closingPriceChart.resetSvg();


       fluctuation = null;
       fluctuationGroup = null;
        request = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticketCode +"/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
        fetchData(request);
        ticketLoaded = ticketCode;
        updateInfo();
    });

    
    //call the fetch_data
}


function fetchAndAdd(chartReference){
    if (chartReference === 'A'){
        fluctuationChart = dc.barChart('#fluctuation-chart');

        fluctuationChart
                .width(420)
                .height(180)
                .margins({top: 10, right: 50, bottom: 30, left: 40})
                .dimension(fluctuation)
                .group(fluctuationGroup)
                .elasticY(true)
                .centerBar(true)
                .gap(1)
                .round(dc.round.floor)
                .x(d3.scale.linear().domain([-25,25]))
                .renderHorizontalGridLines(true);
            
            fluctuationChart.xAxis().tickFormat(
                function (v) { return v + '%'; });
            fluctuationChart.yAxis().ticks(10);  
            var volumeByDate = cf.dimension(function(d){
               return (d.dd); 
            });
            
    }else if (chartReference === 'B'){
        console.log("b");
        fluctuationChart.resetSvg();

        fluctuationChart
                .width(420)
                .height(180)
                .margins({top: 10, right: 50, bottom: 30, left: 40})
                .dimension(volumeByDate)
                .group(volumeByDateGroup)
                .elasticY(true)
                .centerBar(true)
                .gap(1)
                .round(dc.round.floor)
                .x(d3.scale.linear().domain([-25,25]))
                .renderHorizontalGridLines(true);
    }else if (chartReference === 'C'){

    }else if (chartReference === 'D'){

    }
}



var yearlyDimension;
var cf;
var all;
var dateDimension;
var moveMonths;
var monthlyMoveGroup;
var volumeByMonthGroup;
var indexAvgByMonthGroup;
var gainOrLoss;
var gainOrLossGroup;
var fluctuation;
var fluctuationGroup;
var volumeByDate;
var volumeByDateGroup;
var quarter;
var quarterGroup;
var dayOfWeek;
var dayOfWeekGroup;


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
                d.volume = +d.Volume;
                d.dd = dateFormat.parse(d.Date);    // attempt to parse the data
                if (d.dd == null){
                    console.log("DATE IS NULL")
                    loadedData[0].splice(i,1);      // remove the object from the 
                } else {
                    d.month = d.dd.getMonth();
                }
            });
            cf = crossfilter(loadedData[0]);
            all = cf.groupAll();
            
            // fetching the yearly dimension 
            yearlyDimension = cf.dimension(function (d){
                //console.log(d.dd);
                if (d.dd != null){
                    return d3.time.year(d.dd).getFullYear();
                } else {
                    console.log ("Returning NULL");
                    return 0;
                }
            });
            console.log('Printing the yearly dimension!');
            console.log(yearlyDimension.top(Infinity));
         
            // dimension by full date
            dateDimension = cf.dimension(function (d){
                return d.dd; 
            });
            // dimension by month 
            moveMonths = cf.dimension(function (d){
                //console.log(d.month);
                //return d.month;
               return  d.dd.getMonth();
            }); 
            monthlyMoveGroup = moveMonths.group().reduceSum(function (d){
                console.log("MOVEMENT ->" + Math.abs(d.close - d.open))
                return Math.abs(d.close - d.open);
            });
            
            volumeByMonthGroup = moveMonths.group().reduceSum(function (d){
                //console.log(d.volume/500);
                return d.volume/ 500; 
            });
            console.log(volumeByMonthGroup.top(Infinity));
            
            
            indexAvgByMonthGroup = moveMonths.group().reduce(
                function (p, v) {
                    ++p.days;
                    p.total += (v.open + v.close) / 2;
                    p.avg = Math.round(p.total / p.days);
                    return p;
                },
                function (p, v) {
                    --p.days;
                    p.total -= (v.open + v.close) / 2;
                    p.avg = p.days ? Math.round(p.total / p.days) : 0;
                    return p;
                },
                function () {
                    return {days: 0, total: 0, avg: 0};
                }
            );
            
            gainOrLoss = cf.dimension(function (d){
                if (d.open > d.close){
                    return 'Loss';
                } else {
                    return 'Gain';
                }
                //return d.open > d.close ? 'Loss' : 'Gain';
            });
            gainOrLossGroup = gainOrLoss.group();
            
            fluctuation = cf.dimension(function (d){
               return Math.round((d.close - d.open)/d.open * 100);
            });
            
            fluctuationGroup = fluctuation.group(); 
            
            quarter = cf.dimension(function (d){
                var month = d.dd.getMonth();
                if (month <= 2){
                    return 'Q1';
                } else if (month > 3 && month <= 5){
                    return 'Q2';
                } else if (month > 5 && month <= 8){
                    return 'Q3';
                } else{
                    return 'Q4';
                }
            });
            quarterGroup = quarter.group().reduceSum(function (d){
               return d.volume;  
            });
            
            dayOfWeek = cf.dimension(function (d){
                var day = d.dd.getDay();
                var name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                return day + '.' + name[day];
            });
            dayOfWeekGroup = dayOfWeek.group();
            
            console.log(fluctuation);
            gainOrLossChart
                .width(180)
                .height(180)
                .radius(80)
                .dimension(gainOrLoss)
                .group(gainOrLossGroup)
                .label(function (d){
                    if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.data.key)){
                        return d.data.key + '(0%)';
                    }
                    var label = d.data.key;
                    if (all.value()){
                        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
                    }
                    return label;  
                });
            quarterChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
                .width(180)
                .height(180)
                .radius(80)
                .innerRadius(30)
                .dimension(quarter)
                .group(quarterGroup);
            
            fluctuationChart
                .width(420)
                .height(180)
                .margins({top: 10, right: 50, bottom: 30, left: 40})
                .dimension(fluctuation)
                .group(fluctuationGroup)
                .elasticY(true)
                .centerBar(true)
                .gap(1)
                .round(dc.round.floor)
                .x(d3.scale.linear().domain([-25,25]))
                .renderHorizontalGridLines(true);
            
            fluctuationChart.xAxis().tickFormat(
                function (v) { return v + '%'; });
            fluctuationChart.yAxis().ticks(10);  
            volumeByDate = cf.dimension(function(d){
               return (d.dd); 
            });
            
            
            volumeByDateGroup = volumeByDate.group().reduce(
                function reduceAdd (p,v){ 
                    return p += v.close;
                }, 
                function reduceRemove(p,v){
                    return p -= v.close;  
                },
                function reduceInitial(){
                    return 0;
                }
            );
            
            closingPriceChart
                .width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
                .height(150)
                .renderArea(true)
                .renderHorizontalGridLines(true)
                .mouseZoomable(true)
                //.rangeChart(timeSelectChart)
                .brushOn(true)
                .transitionDuration(1000)
                .margins({top: 10, right: 10, bottom: 20, left: 40})
                .dimension(volumeByDate)
                .group(volumeByDateGroup)
                .elasticY(true)
                .x(d3.time.scale().domain([new Date(2000,6,18), new Date(2017,11,31)]))
                .xAxis();
            
            dc.renderAll();
            dc.redrawAll();
            break;
        } else {
            break;
        }
    
    }   
}

function updateInfo(){
    var box = document.getElementById("stockInformation");
    var ticketurl = '/tickerNameQuery/' + ticketLoaded;
    var innerHTML = "";
    settings = {
       "async": true,
       "crossDomain": true,
       "dataType": "json",
       "url": ticketurl,
       "method": "GET",
       "headers": {
         "accept": "application/json",
         "x-mashape-key": "APIKEY"
       }
     };
    
    $.ajax(settings).done(function (response) {
        innerHTML += "<h2> Stock Information </h2>";
        innerHTML += "<p><b>Ticker Code</b> : " + ticketLoaded + "</p>";
        innerHTML += "<p><b>Company Name</b> : " + response[0].companyname + "</p>";
        innerHTML += "<p><b>Industry</b> : " + response[0].industry + "</p>";
        innerHTML += "<p><b>Sector</b> : " + response[0].sector + "</p>";
        innerHTML += "<p><b>Market Cap</b> : " + response[0].marketcap + "</p>";
        box.innerHTML = innerHTML;
    });
}
         
updateInfo();
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



////////////////////
//$("#ticketCode").keypress(function(e) {
//    var curr = document.getElementById("ticketCode").value
//    console.log(curr + String.fromCharCode(e.which) )
//     var settings = {
//       "async": true,
//       "crossDomain": true,
//       "dataType": "json",
//       "url": "/testQuery/",
//       "method": "GET",
//       "headers": {
//         "accept": "application/json",
//         "x-mashape-key": "APIKEY"
//       }
//     }
//     console.log("RESPONSE")
//     $.ajax(settings).done(function (response) {
//       console.log(response);
//         var dataList = document.getElementById("datalist1");
//         console.log(datalist1);
//         var text ="";
//         for(var i = 0; i < 4; i++){
//             text += "<option value=\"" + (response[i].tickername).trim() +"\">";
//         }
//         console.log(text);
//         dataList.innerHTML = text;
//         document.getElementById("ticketCode").focus();
//     });
    
    
    
//    $.ajax({
//          dataType: "jsonp",
//          url: "arcane-springs-65260.herokuapp.com/testQuery",
//          }).done(function ( data ) {
//          console.log(data);
//    });
    
    
    
//});


