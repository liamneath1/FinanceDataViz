var request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
var loadedData = [];
var calcChanges = [];


/* JAVASCRIPT GLOBALS */

var maxPosChange = 0; 
var maxNegChange = 0; 
var maxChange = 0; 
var rates = [];
var minSpeed = 0.1;
var maxSpeed = 2; 


/* Processing GLOBALS */

ArrayList<float> calculatedRates = new ArrayList<float>(); 
StockCircle[] spots; // Declare array
int numSpots = 60; 
Vector<int> minColor = [100,206,255];
Vector<int> maxColor = [0,200,360];
Vector<int> halfWayColor = [40,220,250];
Vector<int> maxColorGain = [0,180,200];
Vecotr<int> maxColorLoss = [90,180,200];

int vizWidth = 750;
int vizHeight = 150; 


/*                   */

//////////////// JAVASCRIPT CODE //////////////////

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

function handleData(responseData ) {
    
    var object = makeJSObject(responseData);
   // console.log(object);
    loadedData=[];
    loadedData[0] = object;
    processData();
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
  //numSpots = 60;
  //setup();
  var dateFormat = d3.time.format('%Y-%m-%d');
  var startDate = undefined;
  var endDate = undefined;
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
            });
  console.log("SAYING HELLO FROM PROCESSING");
  for (i = 0; i < numSpots; i ++){
    var openingPrice = loadedData[0][i].open; 
    var closingPrice = loadedData[0][i].close;
    var percentChange = ((openingPrice - closingPrice)/openingPrice) * 100; 
    if (percentChange > 0 && percentChange > maxPosChange){
      maxPosChange = percentChange;
    } else if (percentChange < 0 && percentChange < maxNegChange){
      maxNegChange = percentChange; 
    }
    console.log("Calculated percentage change for " + i + " to be: " + percentChange);
    calcChanges[i] = percentChange;
  }
  console.log("Max positive change is: " + maxPosChange);
  console.log("Max negaitve change is: " + maxNegChange);
  // calcualte the rates by interpolating between the minimum (0 and the maxnimum)
  if (abs(maxPosChange) > abs(maxNegChange)){
    maxChange = abs(maxPosChange);
  } else {
    maxChange = abs(maxNegChange);
  }
  for (i = 0; i < numSpots; i ++){
    var frac = abs(calcChanges[i])/maxChange; 
    rates[i] = (minSpeed) *(1 - frac) + (maxSpeed) * frac; 
    calculatedRates.add(rates[i]);
  }
  console.log("Interpolated the rates boss!");
  console.log(rates);
  console.log(calculatedRates);
  updateSpots();
  
}
function updateSpots(){
  for (i = 0; i < numSpots ; i++){
    spots[i].updateParamaters(calculatedRates.get(i), calcChanges[i]);
  }
}
function setPeriod(suggested){
  numSpots = suggested;
}


function setTimePeriod(){
    console.log("UPDATED");
}








/////////////////////// Processing Code ///////////////////////////
void setup() {
  colorMode(HSB); 
  size(vizWidth+20, vizHeight);
  int dia = vizWidth/numSpots; // Calculate diameter
  spots = new StockCircle[numSpots]; // Create array
  for (int i = 0; i < spots.length; i++) {
    float x = dia/2 + i*dia + 5; 
    float rate = random(0.1, 2.0);    // just make it random at the start
    spots[i] = new StockCircle(x, vizHeight/2, dia, rate, 0);
  }
  noStroke();
}
void draw() {
  fill(0,0,300);
  stroke(153);
  strokeWeight(10);
  rect(0, 0, vizWidth + 20, vizHeight);
  strokeWeight(1);
  fill(0,200,360);
  for (int i=0; i < spots.length; i++) {
    spots[i].move(); // Move each object
    spots[i].display(); // Display each object
  }
}
class StockCircle {
  float x, y;         // X-coordinate, y-coordinate
  float diameter;     // Diameter of the circle
  float speed;        // Distance moved each frame
  int direction = 1;  // Direction of motion (1 is down, -1 is up)
  float percentChange; 
  float maxYLocation = -1; 
  float minYLocation = -1; 


  // Constructor
  StockCircle(float xpos, float ypos, float dia, float sp, float perChange) {
    x = xpos;
    y = ypos;
    diameter = dia;
    speed = sp;
    percentChange = perChange;

  }

  void move() {
    y += (speed * direction); 
    if (maxYLocation == -1){
      if ((y > (height - diameter/2)) || (y < diameter/2)) { 
        direction *= -1; 
      } 
    } else{
      if ((y > (maxYLocation - diameter/2)) || ((y - diameter/2) < minYLocation)){
        direction *= -1;
      }
    }
  }

  void display() {
     if (percentChange != 0){  // we need to interpolate the color is the percentage change has been set
       double [] color = interpolateColor(speed, percentChange);
       fill(color[0],color[1],color[2]);
     }
    ellipse(x, y, diameter, diameter);
  }

  void updateParamaters(float newSpeed, float perChange){
    speed = newSpeed;
    percentChange = perChange;
    if (percentChange > 0){
      maxYLocation = vizHeight; 
      minYLocation = vizHeight/2; 
      y = vizHeight/2 + diameter/2; 
    } else {
      maxYLocation = vizHeight/2
      minYLocation = 0;
      y = vizHeight/2 - diameter/2;
    }
  }

  double[]interpolateColor(double frac,double perChange){
    double [] vals = new double[3];
    float normalizedSpeed = frac/maxSpeed;
    if (perChange > 0){
      for (int i = 0; i < 3; i ++){
        vals[i] = halfWayColor[i] * (1- normalizedSpeed) + maxColorGain[i] *normalizedSpeed; 
      }
      return vals;
    } else {
      for (int i = 0; i < 3; i ++){
        vals[i] = (halfWayColor[i]) * (1 - normalizedSpeed) + maxColorLoss[i] *  normalizedSpeed; 
      }
    }
    return vals; 
  }

}