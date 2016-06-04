var request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH"; 
var ticketLoaded = "NDAQ";  // The NASDAQ (Financial Tracking Company) is the default ticker loaded. 
var ticketCompare;

/*
    GLOBAL VARIABLES
*/

var loadedData = [];    // big array containing raw data
var info; 
var subgraphLoaded = 'A';
var subgraphs = ['A','B','C'];

var numOverlap = 0;

var yearlyDimension;   
var cf = crossfilter(); // common crossfilter variable that is initally zeroed
var all;
var dateDimension;
var moveMonths;
var monthlyMoveGroup;
var volumeByMonthGroup;
var indexAvgByMonthGroup;
var gainOrLoss;         // indicator of a gain or loss happened in the opening price
var gainOrLossGroup;    // day on day
var fluctuation;
var fluctuationGroup;   // how much does the 
var volumeByDate;       // amount of stocks sold each day 
var volumeByDateGroup;

var closingPriceByDate;
var closingPriceGroup;
var openingPriceGroup; 


var quarter;            // dimension that partitions the year into various quarters
var quarterGroup;   
var volumeDimension;    // dimension that partitions the 
var volumeGroup;
var highGroup;          // group that indicates the highs on a daily basis 
var lowGroup;           // group that indicates the lows on a daily basis

var nameToTicker ={};
var bound = false;

/**
    Various Charts That Make The Dashboard! 
**/

var gainOrLossChart = dc.pieChart('#gain-loss-chart');      // filtering by the amount of money 
var quarterChart = dc.pieChart('#quarter-chart');           // pie-chart that filters by quarter
var fluctuationChart = dc.barChart('#fluctuation-chart');   // bar-chart that filters by change in price
var closingPriceChart = dc.compositeChart('#closing-price-chart');
var volumeChart = dc.compositeChart('#volume-chart');            // filtering by amount of transactions
var highLowChart = dc.compositeChart('#high-low-chart');         // filtering by the change in the daily price


/**
    Helper function that takes the csv file given to it and
    outputs a javascript object that is made according to the
    headers in the file. 
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
   return result; //object
}

/**
    Globaly declared object that serves as the template when 
    interacting with our Postgres SQL database. This is used
    to fetch additional company information
**/
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

/**
    Asynchronus javascript call that we make to OUR server
    in order to surface the ticker name and ticker code. We 
    decided to save this in the browser since the awesomeplete
    class automatically does the filtering for us. Furthermore,
    the current databse is small enough to load it in once!
**/
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
	   list: ["Ada"]
    });
    var awesomepleteC = new Awesomplete(cmpName, {
	   list: ["Ada"]
    });
    awesomepleteC.list = listOfCompanyNames;        // update both lists. 
    awesomeplete.list = listofResponse;
});




/**
    On succesful execution of fetchData(), this function 
    is called to handle the processing of the page data 
    returned. 
**/
function handleData(responseData ) {
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
/**
    Wrapper function that encapsulates an asynchronus HTTP request specified
    by the string httpRequest. 
**/
function fetchData(httpRequest){
    $.ajax({
        url: httpRequest,
        success: function ( data, status, XHR ) {
            handleData(data);
        }
    });
}
fetchData(request); // CALL TO LOAD INITIAL NASDAQ ticker code data made here!



/**
    Implements client determined loading of companies. It also ensures
    that all graphs are cleared before any new data is added. 
**/
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
        document.getElementById("earnings").innerHTML = "";

        $('#gain-loss-chart').empty();
        $('#quarter-chart').empty();
        $('#fluctuation-chart').empty();
        $('#closing-price-chart').empty();
        $('#volume-chart').empty();

        gainOrLossChart.resetSvg();
        quarterChart.resetSvg();
        fluctuationChart.resetSvg();
        closingPriceChart.resetSvg();
        volumeChart.resetSvg();
        
        fluctuation.filterRange([-50000,50000]);

        d3.select(".btn-btn").remove();
        cf.remove();
        dc.renderAll();
        dc.redrawAll();

        request = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticketCode +"/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
        
        fetchData(request);
        setNewBallTicket(request);          // need to update the bouncingPrice.pde as well 
        ticketLoaded = ticketCode;
        updateInfo('stockInformation');
        document.getElementById('ticketCode').value = '';
        document.getElementById('companyName').value = '';
    });
}

/**
    Implementation of the 'multi-holder' box that is at the top
    right corner. Once a user clicks on any of the provided 
    variables we use CSS to make one chart appear and the other
    disappear.
**/
function fetchAndAdd(chartReference){
    subgraphLoaded = chartReference;
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

/**
    Wrapper function that takes the array of loaded objects and places them 
    on the charts. This process involves nudging the JSON object, creating 
    various dimensions and then finally binding the data to the charts

**/
function processData(){
    var startDate = undefined;
    var endDate = undefined;
    var date = undefined;
    while(true){
        if (loadedData[0] != null ){
            var max_vol = 0;
            var max_diff = 0;
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
                if(d.high-d.low > max_diff){
                    max_diff = d.high-d.low;
                }
            });

            // Crossfilter Dimension and Grouping Begin 
            cf = crossfilter(loadedData[0]);
            all = cf.groupAll();
            
            // Creating the yearly dimension
            yearlyDimension = cf.dimension(function (d){
                if (d.dd != null){
                    return d3.time.year(d.dd).getFullYear();
                } else {
                    return 0;
                }
            });
            // Creating the volume dimension 
            var volumeDateDimension = cf.dimension(function(d){
                return d.dd;
            });
            volumeDimension = cf.dimension(function (d){
                return d.volume; 
            });

            
            // Creating the volume by date dimension       
            volumeByDate = cf.dimension(function(d){
                return (d.dd);                  
            });
            volumeGroup = volumeDateDimension.group().reduce(
                function reduceAdd (p,v){ 
                    return p += v.volume/1000;      // scale the volume!
                }, 
                function reduceRemove(p,v){
                    return p -= v.volume/1000;  
                },
                function reduceInitial(){
                    return 0;
                }
            );
            
            
            
            
            closingPriceByDate = cf.dimension(function(d){
               return (d.dd); 
            });
            closingPriceGroup = closingPriceByDate.group().reduce(
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
            openingPriceByDate = cf.dimension(function (d){
                 return (d.dd); 
                
            });
            openingPriceGroup = openingPriceByDate.group().reduce(
                function reduceAdd (p,v){ 
                    return p += v.open;
                }, 
                function reduceRemove(p,v){
                    return p -= v.open;  
                },
                function reduceInitial(){
                    return 0;
                }
            );
            
            
            
            console.log("RETURNING THE GROUP");
            console.log(closingPriceGroup.top(Infinity));

            // Creating the dimension by full date
            dateDimension = cf.dimension(function (d){
                return d.dd; 
            });
            // Creating the dimension by month 
            moveMonths = cf.dimension(function (d){
               return  d.dd.getMonth();
            }); 
            monthlyMoveGroup = moveMonths.group().reduceSum(function (d){
                return Math.abs(d.close - d.open);
            });
            volumeByMonthGroup = moveMonths.group().reduceSum(function (d){
                return d.volume/ 1000; 
            });
            
            
            
            
            
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
            
            // Creating the gain/loss chart 
            gainOrLoss = cf.dimension(function (d){
                if (d.open > d.close){
                    return 'Loss';
                } else {
                    return 'Gain';
                }
            });
            gainOrLossGroup = gainOrLoss.group();
            
            
            
            // Creating the fluctuation grouping 
            fluctuation = cf.dimension(function (d){
               return Math.round((d.close - d.open)/d.open * 100);
            });
            fluctuationGroup = fluctuation.group(); 
            
            
            
            var highLowDimension = cf.dimension(function(d){
                return d.dd;
            });
            var highLowGroup = highLowDimension.group().reduceSum(function (d){
                return ((d.high-d.low)/d.high)*100;
            });
            
            
            // Creating the quarterly group and dimension         
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
            
            
            // Creating all the linked charts now!
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
                .width(550)
                .height(220)
                .margins({top: 10, right: 50, bottom: 30, left: 50})
                .dimension(fluctuation)
                .group(fluctuationGroup)
                .elasticY(true)
                .centerBar(true)
                .brushOn(false)
                .gap(1)
                .round(dc.round.floor)                
                .x(d3.scale.linear().domain([-25,25]))
                .renderHorizontalGridLines(true);

            fluctuationChart.xAxis().tickFormat(
                function (v) { return v + '%'; }
                );
            fluctuationChart.yAxis().ticks(10);  


            closingPriceChart
                .width(990)
                .height(200)
                .margins({ top: 10, right: 10, bottom: 60, left: 50 })
                .dimension(closingPriceByDate)
                .transitionDuration(1000)
                .elasticY(true)
                .brushOn(false)                
                .mouseZoomable(true)
                .renderHorizontalGridLines(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .compose([
                    dc.lineChart(closingPriceChart).group(closingPriceGroup)
                    
                ]);
            
            volumeChart
                .width(550)
                .height(220)
                .margins({ top: 10, right: 10, bottom: 60, left: 50 })
                .dimension(volumeDateDimension)
                .transitionDuration(1000)
                .elasticY(true)
                .brushOn(false)                
                .mouseZoomable(true)
                .renderHorizontalGridLines(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .compose([
                    dc.lineChart(volumeChart).group(volumeGroup)
                ]);
            /*
            volumeChart
                .width(550)
                .height(200)
                .renderHorizontalGridLines(true)
                .mouseZoomable(true)
                .brushOn(true)
                .transitionDuration(1000)
                .margins({top: 30, right: 10, bottom: 30, left: 80})
                .renderHorizontalGridLines(true)
                .dimension(volumeDateDimension)
                .group(volumeGroup)
                .elasticY(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .xAxis();
            */

            highLowChart
                .width(550)
                .height(220)
                .margins({ top: 10, right: 10, bottom: 60, left: 50 })
                .dimension(highLowDimension)
                .transitionDuration(1000)
                .elasticY(true)
                .brushOn(false)                
                .mouseZoomable(true)
                .renderHorizontalGridLines(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .compose([
                    dc.lineChart(highLowChart).group(highLowGroup)
                ]);

/*
             highLowChart
                .width(550)
                .height(200)
                .renderHorizontalGridLines(true)
                .mouseZoomable(true)
                .brushOn(true)
                .transitionDuration(1000)
                .margins({top: 10, right: 10, bottom: 40, left: 60})
                .renderHorizontalGridLines(true)
                .dimension(highLowDimension)
                .group(highLowGroup)
                .elasticY(true)
                .x(d3.time.scale().domain([dateFormat.parse(startDate), dateFormat.parse(endDate)]))
                .xAxis();
                */

            subgraphs.forEach(
                function(d,i){
                    if(d === subgraphLoaded){
                        document.getElementById(d).style.display = 'block'; 
                    }else{
                        document.getElementById(d).style.display = 'none';  
                    }
                });
            // Rendering the dc.charts
            dc.renderAll();
            addAllLabels();     // after we render we can finally add the labels      
            dc.redrawAll();     // redraw after we add the labels
            break;
        } else {
            break;
        }
    
    }   
}
function AddXAxis(chartToUpdate, displayText,x,y){
    chartToUpdate.svg()
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", x)
    .attr("y", y)
    .text(displayText);
}
function AddYAxis(chartToUpdate,displayText,x,y){
    chartToUpdate.svg()
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", x)
    .attr("y", y)

    .text(displayText);
}
/**
    Adds critical x and y graph labels to each dc.js
    chart that has been rendered using the AddXAxis and 
    AddYAxis method defined above.
**/
function addAllLabels(){
    // Closing Price Chart Axes // 
    AddXAxis(closingPriceChart, "Date",closingPriceChart.width()/2,closingPriceChart.height() -20);
    AddYAxis(closingPriceChart, "Closing Price ($US)",-80,20);
    // Flucturation Chart Axes //
    AddXAxis(fluctuationChart,"Percentage Change In Price",fluctuationChart.width()/2,fluctuationChart.height());
    AddYAxis(fluctuationChart,"Count",-80,15);
    // Volume Traded Per Day // 
    AddXAxis(volumeChart,"Date",volumeChart.width()/2,volumeChart.height() + 0);
    AddYAxis(volumeChart,"Units Traded (Thousands)",-90,15);
    // Highlow Chart //
    AddXAxis(highLowChart,"Date",highLowChart.width()/2,highLowChart.height() + 0);
    AddYAxis(highLowChart,"Percentage Difference (%)",-90,15);  
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
                .height(200)
                .margins({ top: 10, right: 10, bottom: 0, left: 40 })
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
        innerHTML += "<div style=\"display:inline\">";
        innerHTML += "<div>";
        innerHTML += "<h2> Stock Information </h2>";
        innerHTML += "<p><b>Ticker Code</b> : " + ticket + "</p>";
        innerHTML += "<p><b>Company Name</b> : " + response[0].companyname + "</p>";
        innerHTML += "<p><b>Industry</b> : " + response[0].industry + "</p>";
        innerHTML += "<p><b>Sector</b> : " + response[0].sector + "</p>";
        innerHTML += "<p><b>Market Cap</b> : " + response[0].marketcap + "</p>";
        innerHTML += "</div>";
        innerHTML += "<hr>";
        innerHTML += "<div>";
        innerHTML += "<h3>Predict Earnings to Date</h3>";
        innerHTML += "<p>This service allows users to input an investment amount and date for the stock loaded, and displays the total earnings made from the stock to date, the net earnings, and a graph displaying the percent change in earnings to date.</p>";
        innerHTML += "<p>Investment Amount : $ <input type = \"text\" id = \"investment\"></p>";
        innerHTML += "<p>Investment Date (mm/dd/yyyy) : <input type = \"text\" id = \"dateBought\"></p>";
        innerHTML += "<button class = \"button\" onClick= \"predictEarnings()\">Predict Earnings</button>";
        innerHTML += "</div>";
        innerHTML += "</div>";
        box.innerHTML = innerHTML;
    });
}        

function predictEarnings(){
    var investment = document.getElementById("investment").value;
    var dateBought = document.getElementById("dateBought").value;
    var date_parts = dateBought.split("/");
    if(date_parts[0].length!==2 || date_parts[1].length!==2 || date_parts[2].length!=4){
        document.getElementById("earnings").innerHTML = "Please use correct date format as specified above.";
        return;
    }
    var date = date_parts[2] + "-" + date_parts[0] + "-" + date_parts[1];
    var numBought;
    var found = false;
    var max_date = date;
    var curr_price;

    var toDateData = [];
    var data = loadedData[0];
    for( var i = data.length-1; i >=0 ; i--){
        var d = data[i];
        if(d.Date === date){
            found = true;
            numBought = Math.floor(investment/d.open);
            d.earnings = numBought*d.close;
        }
        if(d.Date > date){
            d.earnings = numBought*d.close;
            d.percent_change = ((d.earnings - investment)/investment)*100;
            toDateData.push(d);
        }
        if(d.Date > max_date){
            max_date = d.Date;
            curr_price = d.close;
        }
    }

    if(!found){
        document.getElementById("earnings").innerHTML = "Sorry, Quandl does not have data for that day.";
        return;
    }else{
        var earnings = (numBought*curr_price).toFixed(2);
        var text = "<p>Earnings: $" + (earnings) + "</p>";
        console.log(earnings);
        console.log(earnings-investment);
        if(earnings-investment < 0){
            text += "<p>Net Earnings: -$" + (0-(earnings - investment).toFixed(2)) + "</p>";
        }else{      
            text += "<p>Net Earnings: $" + (earnings - investment).toFixed(2) + "</p>";
        }
        text += "<p>Percent Change : " + (((earnings-investment)/investment)*100).toFixed(2)+ "%";
        text += "<h4>Percent Change in Earnings</h4><div id=\"earnings-chart\"></div>"
        document.getElementById("earnings").innerHTML = text;
    }

    var cf1 = crossfilter(toDateData);
    var earningsDateDimension = cf1.dimension(function(d){return d.dd;});
    var earningsDateGroup = earningsDateDimension.group().reduceSum(function(d){return d.percent_change});

    var earningChart = dc.lineChart("#earnings-chart", "mygroup");
    var dateFormat = d3.time.format('%Y-%m-%d');



    earningChart
        .width(500)
        .height(180)
        .renderHorizontalGridLines(true)
        .mouseZoomable(true)
        .brushOn(false)
        .transitionDuration(1000)
        .margins({top: 10, right: 10, bottom: 20, left: 40})
        .renderHorizontalGridLines(true)
        .dimension(earningsDateDimension)
        .group(earningsDateGroup)
        .elasticY(true)
        .x(d3.time.scale().domain([dateFormat.parse(date), dateFormat.parse(max_date)]))
        .xAxis();

        earningChart.yAxis().tickFormat(
            function (v) { return v + '%'; }
        );
    dc.renderAll("mygroup");

}
    

updateInfo("stockInformation");




var showButton = function(){
    if(gainOrLossChart.filters().length > 0 ||
       quarterChart.filters().length > 0 ||
       fluctuationChart.filters().length > 0 ||
       closingPriceChart.filters().length > 0 ||
       volumeChart.filters().length > 0 ||
       highLowChart.filters().length > 0){
        d3.select(".btn-btn")
              .remove();

        d3.select("#reset-button")
            .append("button")
            .attr("type","button")
            .attr("class","btn-btn")
            .append("div")
            .attr("class","label")
            .text(function(d) { return "Reset";})
            .on("click", function(){
                gainOrLossChart.filter(null);
                quarterChart.filter(null);
                fluctuationChart.filter(null);
                closingPriceChart.filter(null);
                volumeChart.filter(null);
                highLowChart.filter(null);

                dc.redrawAll();
            })
    }else{
        d3.select(".btn-btn")
          .remove();
    };
};


gainOrLossChart.on('filtered', function(){showButton();});
quarterChart.on('filtered', function(){showButton();});
fluctuationChart.on('filtered', function(){showButton();});
closingPriceChart.on('filtered', function(){showButton();});
volumeChart.on('filtered', function(){showButton();});
highLowChart.on('filtered', function(){showButton();});




/**
    Interfacing function that speaks with the processing codem it calls
    updateInt() which resets the number of balls (and hence time period)
    that is currently being exammined. 
**/
function setTimePeriod(){
    var pjs = Processing.getInstanceById('sketch');
     if(pjs!=null) {
       pjs.updateInt(  parseInt(document.getElementById("numOfBalls").value));
       bound = true; }
    if(!bound) setTimeout(bindJavascript, 250);
}

/**
    Setting the financial resource that is being looked at by
    making a call to updateTicket() which is defined in the 
    processing code.
**/

function setNewBallTicket(url){
    var pjs = Processing.getInstanceById('sketch');
    if (pjs != null){
        pjs.updateTicket(url);
        bound = true;}
    if (!bound) setTimeout(setNewTicket,250); 
}


