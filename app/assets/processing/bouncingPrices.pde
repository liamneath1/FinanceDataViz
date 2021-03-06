String request = "https://www.quandl.com/api/v3/datasets/WIKI/NDAQ/data.csv?api_key=1Y3h3-Q8VW1Z1tZXqhpH";
var loadedData = [];    // initial array of loaded data
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
StockCircle[] spots;    // Declare array
int numSpots = 90; 
Vector<int> minColor = [100,206,255];
Vector<int> maxColor = [0,200,360];
Vector<int> halfWayColor = [40,220,250];
Vector<int> maxColorGain = [0,180,200];
Vecotr<int> maxColorLoss = [90,180,200];
Pfont f;                // font for the labels on the graph!
int vizWidth = 750;
int vizHeight = 150; 
int canvasWidth = 850; 
int canvasHeight = 200; 
int labelsPresent = 0; 

String firstDate = "";
String lastDate = "";

int doNewFetch = 1; 

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
   return result; //object
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

//fetchData(request);

function processData(){
    console.log("PROCESSING DATA");
    console.log("THE REQUEST WAS" + request);
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
   handleProcessing();
}


function handleProcessing(){
 for (i = 0; i < numSpots; i ++){
        var openingPrice = loadedData[0][i].open; 
        var closingPrice = loadedData[0][i].close;
        var percentChange = ((openingPrice - closingPrice)/openingPrice) * 100; 
        if (percentChange > 0 && percentChange > maxPosChange){
          maxPosChange = percentChange;
        } else if (percentChange < 0 && percentChange < maxNegChange){
          maxNegChange = percentChange; 
        }
        calcChanges[i] = percentChange;
    }
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
    updateSpots();
    labelsPresent = 1; 
    firstDate = loadedData[0][0].dd.toDateString();
    lastDate = loadedData[0][numSpots].dd.toDateString();
    
}


function updateSpots(){
  for (i = 0; i < numSpots ; i++){
    spots[i].updateParamaters(calculatedRates.get(i), calcChanges[i]);
  }
}

/////////////////////// Processing Code ///////////////////////////

// modifies the number of balls (and hence the dates) that are 
// being shown in the canvas.
void updateInt(int i){
    numSpots = i;
    doNewFetch = 0;     
    setup();
}


// updates the ticket that the data is linked to
void updateTicket(string url){
    request = url;
    doNewFetch = 1;
    setup();
}


// draws the labels that make up the key
void drawLabels(){
    f = createFont("Arial",16,true);
    fill(255);
    textFont(f,16);                 
    fill(0);                        
    text("Gain",vizWidth + 25, 50);   
    text("Loss",vizWidth + 25, 125);
}



// creates the colour scale boxes that are 
// positioned to the left hand side of the screen
void drawColorScale(){
    int boxOffSet = 70; 
    int boxStart = boxOffSet + vizWidth;
    fill(0);
    for (int i = 0; i < 7; i++){
        double vals[]  = new double[3];
        if (i < 4){
            vals = interpolateColorT((3 - i)/3,-10);
        } else {
            vals = interpolateColorT( (i-3)/3,10);
        }
        fill(vals[0],vals[1],vals[2]);
        rect(boxStart,(i * 20) + 5,20,20);
    }   
}

// public function that attaches the date labels at
// either side of the canvas. 
void drawLabelsD(){
    if (labelsPresent > 0 ){
        stroke(255);   
        fill(0,0,300);
        rect(0,canvasHeight - 50,canvasWidth,50);
        f = createFont("Arial",16,true);
        textFont(f,16);
        fill(0);
        text(firstDate,0,canvasHeight - 20);
        text(lastDate,canvasWidth - 200,canvasHeight - 20);
    }    
}

// public function that interpolates for the colour scale
// that is on the right hand side of the visualization 
double[] interpolateColorT(double frac,int perChange){
    double [] vals = new double[3];
    if (perChange > 0){
      for (int i = 0; i < 3; i ++){
        vals[i] = halfWayColor[i] * (1- frac) + maxColorGain[i] *frac; 
      }
      return vals;
    } else {
      for (int i = 0; i < 3; i ++){
        vals[i] = (halfWayColor[i]) * (1 - frac) + maxColorLoss[i] *  frac; 
      }
    }
    return vals; 
}

void setup() {
  colorMode(HSB); 
  background(0,0,300);          // white background
  size(canvasWidth, canvasHeight);
  int dia = vizWidth/numSpots;  // calculate diameter
  spots = new StockCircle[numSpots]; // Create array
  for (int i = 0; i < spots.length; i++) {
    float x = dia/2 + i*dia + 5; 
    float rate = random(0.1, 2.0);    // just make it random at the start
    spots[i] = new StockCircle(x, vizHeight/2, dia, rate, 0);
  }
  if (doNewFetch == 1){         // no need to do a completely new Quandl fetch 
    fetchData(request);         // if we are just changing the number of balls
  } else {                      // i.e the time period that is being displayed
    handleProcessing();
  }
  noStroke();
}

// Main draw loop that is called by Processing.js, 
void draw() {
  fill(0,0,300);
  stroke(153);
  strokeWeight(5);
  rect(0, 0, vizWidth + 20, vizHeight);
  strokeWeight(1);
  line(0, (vizHeight)/2,vizWidth + 20, vizHeight/2); 
  
  stroke(255);                                                  // we need a rectangle
  rect(vizWidth+20,0,canvasWidth - (vizWidth + 20),vizHeight);
  stroke(153);
  fill(0,200,360);
  for (int i=0; i < spots.length; i++) {
    spots[i].move(); // Move each object
    spots[i].display(); // Display each object
  }
  drawLabels();     // draw the labels
  drawColorScale(); // draw the colour scale 
  drawLabelsD();    // draw the dates 
}


// StockCircle is really a wrapper around a particle class. It encapsulates
// the interpolation,movement and display methods all needed for a proper
// particle class. 

class StockCircle {
  float x, y;         // X-coordinate, y-coordinate
  float diameter;     // Diameter of the circle
  float speed;        // Distance moved each frame
  int direction = 1;  // Direction of motion (1 is down, -1 is up)
  float percentChange; 
  float maxYLocation = -1; 
  float minYLocation = -1; 


  // Constructor for the StockCircle function 
  StockCircle(float xpos, float ypos, float dia, float sp, float perChange) {
    x = xpos;
    y = ypos;
    diameter = dia;
    speed = sp;
    percentChange = perChange;
  }

  // moves the particle along it's 2D dimension (y-axis). This function
  // also ensures that the balls do not leave the scene and stop at the
  // center 
  void move() {
    y += (speed * direction); 
    if (maxYLocation == -1){
      if ((y > (vizHeight - diameter/2)) || (y < diameter/2)) { 
        direction *= -1; 
      } 
    } else{
      if ((y > (maxYLocation - diameter/2)) || ((y - diameter/2) < minYLocation)){
        direction *= -1;
      }
    }
  }
  
  // main drawing function that is needed to display something 
  void display() {
     if (percentChange != 0){  // we need to interpolate the color is the percentage change has been set
       double [] color = interpolateColor(speed, percentChange);
       fill(color[0],color[1],color[2]);
     }
    ellipse(x, y, diameter, diameter);
  }
  
  // public function that allows one to update the paramtaers of the particles after
  // they have been created. Needed to create the paramaters
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
  
  // Inteprolates the colour based on the percentage change and the interpolated speed. 
  // positive changes get green, negative changes get red. 
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