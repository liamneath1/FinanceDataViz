/*
Basic stocks/indexs to include!
*/
var request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH"; 
var ticketLoaded = "NDAQ";
var ticketCompare;
// MAKE THIS DYNAMIC

var loadedData = [];    // big array containing raw data
var info; 
/*
GLOBAL VARIABLES
*/
var numOverlap = 0;

var yearlyDimension;
var cf = crossfilter();
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
var volumeDimension;
var volumeGroup;
var highGroup;
var lowGroup;

var nameToTicker ={};



/**
    Various Charts That Make The Dashboard! 
**/

var gainOrLossChart = dc.pieChart('#gain-loss-chart');
var quarterChart = dc.pieChart('#quarter-chart');
var fluctuationChart = dc.barChart('#fluctuation-chart');
var closingPriceChart = dc.compositeChart('#closing-price-chart');
var volumeChart = dc.lineChart('#volume-chart');
var highLowChart = dc.barChart('#high-low-chart');


/**
**/

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
    fetchData("https://www.quandl.com/api/v3/datasets/WIKI/" + ticketLoaded + "/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH");
    document.getElementById('ticketCode').value = '';
    document.getElementById('companyName').value = '';
    ticketCompare = undefined;
    document.getElementById('compareStockInformation').innerHTML="";
    numOverlap = 0;
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
    if(numOverlap===1){
        loadedData[1] = object;
        overlapData();
    }else{
        loadedData[0] = object;
        processData();
        console.log(volumeByDateGroup);

    }
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




function loadCompany(method){
    numOverlap = 0;
    d3.selectAll("svg").remove();
    var settings;
    var ticketCode;
    if(method==='ticket'){
        ticketCode = document.getElementById('ticketCode').value.toUpperCase();
        var ticketurl = '/tickerNameQuery/' + ticketCode;
        console.log(ticketurl);
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

        $('#gain-loss-chart').empty();
        $('#quarter-chart').empty();
        $('#fluctuation-chart').empty();
        $('#closing-price-chart').empty();
        $('#volume-chart').empty();
        
        fluctuation.filterRange([-50000,50000]);
        cf.remove();
        dc.renderAll();
        dc.redrawAll();

        request = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticketCode +"/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
        fetchData(request);
        ticketLoaded = ticketCode;
        updateInfo('stockInformation');
        document.getElementById('ticketCode').value = '';
        document.getElementById('companyName').value = '';
    });
}


function compareCompany(){
        d3.selectAll("svg").remove();
        var settings;
        var ticketCode;
        if(document.getElementById('ticketCode').value ===''){
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
        }else{
            ticketCode = document.getElementById('ticketCode').value.toUpperCase();
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
        }
        $.ajax(settings).done(function (response) {
            ticketCode = response[0].tickername;
            ticketCode = ticketCode.replace(/\s/g, '');

            $('#gain-loss-chart').empty();
            $('#quarter-chart').empty();
            $('#fluctuation-chart').empty();
            $('#closing-price-chart').empty();
            
            dc.renderAll();
            dc.redrawAll();

            request = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticketCode +"/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
            numOverlap = 1;
            fetchData(request);
            ticketCompare = ticketCode;
            updateInfo('compareStockInformation');
            document.getElementById('ticketCode').value = '';
            document.getElementById('companyName').value = '';
        });
}
    
    //call the fetch_data



function fetchAndAdd(chartReference){
    if (chartReference === 'A'){
        document.getElementById("A").style.display = 'block'; 
        document.getElementById("B").style.display = 'none';  
        document.getElementById("C").style.display = 'none'; 
    }else if (chartReference === 'B'){
        document.getElementById("A").style.display = 'none'; 
        document.getElementById("B").style.display = 'block';  
        document.getElementById("C").style.display = 'none'; 
    }else if (chartReference === 'C'){
        document.getElementById("A").style.display = 'none'; 
        document.getElementById("B").style.display = 'none';  
        document.getElementById("C").style.display = 'block'; 
    }else if (chartReference === 'D'){

    }
}



function processData(){
    var startDate = undefined;
    var endDate = undefined;
    var date = undefined;
    while(true){
        if (loadedData[0] != null ){
            var max_vol = 0;
            var dateFormat = d3.time.format('%Y-%m-%d');
            loadedData[0].forEach(function (d,i){
                d.close = +d.Close;    //nudging these variables into 
                d.open = +d.Open;      //numbers 
                d.high = +d.High;
                d.low = +d.Low;
                d.volume = +d.Volume;
                d.dd = dateFormat.parse(d.Date);// attempt to parse the data

                if(startDate === undefined && d.Date!=null){
                    startDate = d.Date;
                    endDate = d.Date;
                }
               
                if (d.dd == null){
                    console.log("DATE IS NULL")
                    loadedData[0].splice(i,1);      // remove the object from the 
                } else {
                    d.month = d.dd.getMonth();
                    if(d.Date < startDate && d.Date!=null){
                        startDate = d.Date;
                    }else if(d.Date > endDate){
                        endDate = d.Date;
                    }
                }
                if(d.volume > max_vol){
                    max_vol = d.volume;
                    date = d.Date;
                }
            });
            console.log("volume" + max_vol + " " + date);

            // starting crossfilter stufff

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

            volumeDimension = cf.dimension(function (d){
                //console.log(d.volume);
                return d.volume; 
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
            quarterChart
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


            volumeGroup = volumeByDate.group().reduceSum(function(d){
                    return d.volume;
                }
            );
            
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

            highGroup = volumeByDate.group().reduceSum(function(d){
                return d.high;
            });

            lowGroup = volumeByDate.group().reduceSum(function(d){
                return d.low;
            });

            
             closingPriceChart
                .width(990)
                .height(150)
                .margins({ top: 10, right: 10, bottom: 20, left: 40 })
                .dimension(volumeByDate)
                .transitionDuration(1000)
                .elasticY(true)
                .brushOn(true)
                .mouseZoomable(true)
                .valueAccessor(function (d) {
                    return d.value;
                })
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .compose([
                    dc.lineChart(closingPriceChart).group(volumeByDateGroup)
                ]);

            /**
            closingPriceChart
                .width(990) 
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
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .xAxis();
            */


            volumeChart
                .width(420) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
                .height(180)
                .renderArea(true)
                .renderHorizontalGridLines(true)
                .mouseZoomable(true)
                //.rangeChart(timeSelectChart)
                .brushOn(true)
                .transitionDuration(1000)
                .margins({top: 10, right: 10, bottom: 20, left: 40})
                .dimension(volumeByDate)
                .group(volumeGroup)
                .elasticY(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .xAxis();


            highLowChart
                .width(1160)
                .height(250)
                .margins({ top: 10, right: 10, bottom: 20, left: 40 })
                .dimension(volumeByDate)
                .transitionDuration(500)
                .elasticY(true)
                .brushOn(false)
                .valueAccessor(function (d) {
                    return d.value;
                })
                .group(highGroup)
                .stack(lowGroup)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]));

            
            dc.renderAll();
            dc.redrawAll();
            break;
        } else {
            break;
        }
    
    }   
}

/** 
Takes two stock data's and presents them in the same graph. 
*/
function overlapData(){

    console.log("calling overlap data");
    var startDate = undefined;
    var endDate = undefined;
    var totalData = [];
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
                d.dd = dateFormat.parse(d.Date);// attempt to parse the data

                if(startDate === undefined && d.Date!=null){
                    startDate = d.Date;
                    endDate = d.Date;
                }
               
                if (d.dd == null){
                    console.log("DATE IS NULL")
                    loadedData[0].splice(i,1);      // remove the object from the 
                } else {
                    d.month = d.dd.getMonth();
                    if(d.Date < startDate && d.Date!=null){
                        startDate = d.Date;
                    }else if(d.Date > endDate){
                        endDate = d.Date;
                    }
                }
                d.company = ticketLoaded;
                totalData.push(d);

            });
            var startDate1;
            loadedData[1].forEach(function (d,i){
                d.close = +d.Close;    //nudging these variables into 
                d.open = +d.Open;      //numbers 
                d.high = +d.High;
                d.low = +d.Low;
                d.volume = +d.Volume;
                d.dd = dateFormat.parse(d.Date);// attempt to parse the data

                if(startDate1 === undefined && d.Date!=null){
                    startDate1 = d.Date;
                    endDate = d.Date;
                }
               
                if (d.dd == null){
                    console.log("DATE IS NULL")
                    loadedData[0].splice(i,1);      // remove the object from the 
                } else {
                    d.month = d.dd.getMonth();
                    if(d.Date < startDate1 && d.Date!=null){
                        startDate1 = d.Date;
                    }else if(d.Date > endDate){
                        endDate = d.Date;
                    }
                }
                d.company = ticketCompare;
                totalData.push(d);
            });
            console.log(totalData);

            console.log("startDate" + startDate + "  " + "enddate" + endDate);
            cf = crossfilter(totalData);
            all = cf.groupAll();
     
            console.log('Printing the yearly dimension!');
            console.log(yearlyDimension.top(Infinity));
         
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

            var volumeByDateGroup1 = volumeByDate.group().reduce(
                function reduceAdd (p,v){ 
                    return p += v.close;
                }, 
                function reduceRemove(p,v){
                    return p -= v.close;  
                },
                function reduceInitial(){
                    return 0;
                }
            )

            volumeGroup = volumeByDate.group().reduceSum(function(d){
                    return d.volume;
                }
            );

   
            var start_date;
            if(startDate < startDate1){
                start_date = startDate;
            }else{
                start_date = startDate1;
            }

            closingPriceChart
                .width(990)
                .height(150)
                .margins({ top: 10, right: 10, bottom: 20, left: 40 })
                .dimension(volumeByDate)
                .transitionDuration(1000)
                .elasticY(true)
                .brushOn(true)
                .mouseZoomable(true)
                .valueAccessor(function (d) {
                    return d.value;
                })
                .x(d3.time.scale().domain([dateFormat.parse(start_date), dateFormat.parse(endDate)]))
                .compose([
                    dc.lineChart(closingPriceChart).group(volumeByDateGroup),
                    dc.lineChart(closingPriceChart).group(volumeByDateGroup1)
                ]);
            
            dc.renderAll();
            dc.redrawAll();
            break;
        } else {
            break;
        }
    
    }   
    


}

function updateInfo(stockInfoBox){
    var box = document.getElementById(stockInfoBox);
    var ticket;
    if(stockInfoBox === 'stockInformation'){
        ticket = ticketLoaded;
    }else{
        ticket = ticketCompare;
    }
    var ticketurl = '/tickerNameQuery/' + ticket;
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
        innerHTML += "<p><b>Ticker Code</b> : " + ticket + "</p>";
        innerHTML += "<p><b>Company Name</b> : " + response[0].companyname + "</p>";
        innerHTML += "<p><b>Industry</b> : " + response[0].industry + "</p>";
        innerHTML += "<p><b>Sector</b> : " + response[0].sector + "</p>";
        innerHTML += "<p><b>Market Cap</b> : " + response[0].marketcap + "</p>";
        box.innerHTML = innerHTML;
    });
}        

         
updateInfo("stockInformation");



