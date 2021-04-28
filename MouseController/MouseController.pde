import java.awt.*;
import java.util.Date;

import http.requests.*;
Robot robot;

int xdir = 1;
int ydir = 1;

long now = 0;
int waitTime = 200;

float scaleDown = 0.25;

PVector mouse;
float[] xy = {0, 0};

void settings() {
  size(int(displayWidth*scaleDown), int(displayHeight*scaleDown));
}

void setup() {
  mouse = new PVector(displayWidth/2, displayHeight/2);
  try { 
    robot = new Robot();
  } 
  catch(Exception e) {
    println(e);
  }
  background(0);
  GetRequest get = new GetRequest("http://localhost:3000/reset"); 
  get.send();
  surface.setLocation(1250, 200);
}

void draw() {
  scale(scaleDown);
  strokeWeight(4.0/scaleDown);
  stroke(255);
  mouse.x += xy[0];
  mouse.y += xy[1];
  ;
  mouse.x = constrain(mouse.x, 0, displayWidth);
  mouse.y = constrain(mouse.y, 0, displayHeight);

  robot.mouseMove(int(mouse.x), int(mouse.y));

  point(mouse.x, mouse.y);
  if (millis() - now > waitTime) {
    GetRequest get = new GetRequest("http://localhost:3000/mouse"); 
    get.send();
    String moveTo = get.getContent();
    xy = float(moveTo.split(","));
    float expand = 50;
    xy[0] = map(xy[0], 0, 1, -xdir * expand, xdir * expand);
    xy[1] = map(xy[1], 0, 1, -ydir * expand, ydir * expand);
    now = millis();
  }

  if (frameCount % 60 == 0) {
    GetRequest get = new GetRequest("http://localhost:3000/reset"); 
    get.send();
    if (random(1) < 0.5) 
      xdir *= -1;
    if (random(1) < 0.5) 
      ydir *= -1; 
    println("reset");
  }
}
