import java.awt.*;
import java.util.Date;

import http.requests.*;
Robot robot;

long now = 0;
int waitTime = 100;

float scaleDown = 0.25;

PVector mouse = new PVector(0, 0);
float[] xy = {0, 0};

void settings() {
  size(640, 480);
}

void setup() {
  try { 
    robot = new Robot();
  } 
  catch(Exception e) {
    println(e);
  }
  background(0);
  GetRequest get = new GetRequest("http://localhost:3000/reset"); 
  get.send();
}

void draw() {
  translate(width/2,height/2);
  strokeWeight(4);
  stroke(255);
  mouse.x = lerp(xy[0], mouse.x, 0.9);
  mouse.y = lerp(xy[1], mouse.y, 0.9);
  point(mouse.x, mouse.y);
  if (millis() - now > waitTime) {
    GetRequest get = new GetRequest("http://localhost:3000/mouse"); 
    get.send();
    String moveTo = get.getContent();
    xy = float(moveTo.split(","));
    xy[0] = map(xy[0],0,1,-width,width);
    xy[1] = map(xy[1],0,1,-height,height);
    now = millis();
  }

  if (frameCount % 320 == 0) {
    GetRequest get = new GetRequest("http://localhost:3000/reset"); 
    get.send();
    println("reset");
  }
}
