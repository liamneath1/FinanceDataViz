StockCircle[] spots; // Declare array
void setup() {
  size(700, 100);
  int numSpots = 20; // Number of objects
  int dia = width/numSpots; // Calculate diameter
  spots = new StockCircle[numSpots]; // Create array
  float [] rates = {0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.8,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0};
  for (int i = 0; i < spots.length; i++) {
    float x = dia/2 + i*dia;
    //float rate = random(0.1, 2.0);
    float rate = rates[i];
    // Create each object
    spots[i] = new StockCircle(x, 50, dia, rate);
  }
  noStroke();
}
void draw() {
  fill(0, 12);
  rect(0, 0, width, height);
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

  // Constructor
  StockCircle(float xpos, float ypos, float dia, float sp) {
    x = xpos;
    y = ypos;
    diameter = dia;
    speed = sp;
  }
    
  void move() {
    y += (speed * direction); 
    if ((y > (height - diameter/2)) || (y < diameter/2)) { 
      direction *= -1; 
    } 
  }
  
  void display() {
    ellipse(x, y, diameter, diameter);
  }
}