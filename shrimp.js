class Shrimp {
  constructor(pos,DNA,parent1,parent2){
    this.deathCounter = 255;
    this.selected = false;
    this.age = 0;
    this.size = 10;
    this.maxSize = 30;
    this.noiseIndex = random(100);
    this.visionDistance = 150;
    this.gender = Math.floor(random(2));
    this.fed = 10; //MATE - ROAM - FEED
    this.colors = [color(255,0,0,this.deathCounter),color(0,0,0,this.deathCounter),color(0,0,255,this.deathCounter),color(100,100,100,this.deathCounter)];
    this.moveChoice = 1; //initialize as roaming
    this.color = this.colors[this.moveChoice];
    this.skinColor = color(238,175,183,this.deathCounter);
    this.pos = pos;
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.DNA = JSON.parse(JSON.stringify(DNA)); // deep copy of what it is given
    this.speed = this.DNA[3].score;
    this.maxForce = 0.5;
    this.burnoutCounter = 0;
    this.burnoutMax = 100;
    this.roamTarget = null;
    this.velocity.setMag(this.speed);
    this.missionAccomplished = false;
    this.phases = [{name : "adolescent", ticks: 1000, bias : -1},{name : "adult", ticks: 3000, bias : 10},{name : "elderly", ticks: 5000, bias : 5}];
    this.phase = this.phases[0];
    this.wiggleIndex = random(100);
    this.children = new Array;
    this.parent1 = parent1;
    this.parent2 = parent2;

    //The DNA represents a weighting of each kind of
    //movements that the shrimp learns to make
    
    //Populate the weights for selection
    this.calcDNAWeights(); 
    
    this.selectNewTarget(); //Change target based on weights
  }

  getNumGens(){
    if (this.parent1 == null){
      return 1;
    }
    else{
      return this.parent1.getNumGens() + 1;
    }
  }

  hunger(){
    this.fed -= Math.max(1,this.speed);
  }

  updatePhenotype(){
    this.color = this.colors[this.moveChoice];
    if (this.size > 1 && this.size < this.maxSize){
      this.size = this.fed;
    }
  }

  calcDNAWeights(){
    var sum = 0;
    //Add up for a total of the scores
    for (var i=0; i < this.DNA.length-1; i++){
      sum += this.DNA[i].score;
    }for (var i=0; i < this.DNA.length-1; i++){
      this.DNA[i].weight = this.DNA[i].score / sum;
    }
  }

  updateAge(){
    this.age++;
    if (this.age < this.phases[0].ticks && this.phase != this.phases[0]){ //Adolescent
      this.phase = this.phases[0];
      this.DNA[0].score += this.phase.bias;
    }
    else if (this.age > this.phases[0].ticks && this.age < this.phases[1].ticks && this.phase != this.phases[1]){ //
      this.phase = this.phases[1];
      this.DNA[0].score += this.phase.bias;
    }
    else if (this.age > this.phases[1].ticks && this.phase != this.phases[2]){
      this.phase = this.phases[2]
      this.DNA[0].score += this.phase.bias;
    }
    else if (this.age > this.phases[2].ticks && this.phase != this.phases[2]){ //
      this.die();
    }
  }

  checkDeath(){
    //if starve or die of old age
    if (this.fed < 0 || (this.phase == this.phases[2] && this.age > this.phase.ticks)){
      this.die()
    }
  }

  die(){
    if (this. deathCounter > 0){
      this.deathCounter -= 10;
      this.colors = [color(255,0,0,this.deathCounter),color(0,0,0,this.deathCounter),color(0,0,255,this.deathCounter),color(100,100,100,this.deathCounter)];
      this.skinColor = color(238,175,183,this.deathCounter);
    }
    else{
      for (var i=0; i < shrimpPopulation.length; i++){
        if (shrimpPopulation[i] == this){
          shrimpPopulation.splice(i,1);
        }
      }
    }
    
  }

  // passiveStatChanges(){
  //   if(this.moveChoice == 0){
  //     this.maxSpeed = 2;
  //   }
  //   else{
  //     this.maxSpeed = 1;
  //   }

  // }

  action(){
    this.updateAge();
    //this.passiveStatChanges();
    this.updatePhenotype();
    this.move();
    this.feed();
    this.reproduce();
    this.checkDeath();
  }

  feed(){
    //if there's overlap
    for (var i=0; i < algaePopulation.length; i++){ 
      if (dist(algaePopulation[i].pos.x, algaePopulation[i].pos.y, this.pos.x, this.pos.y) < this.size/2){
        algaePopulation.splice(i,1); //kill algae
        this.eat(); //eat boost
        
      }
    }
  }

  eat(){
    this.fed ++;
    if (this.size < this.maxSize){
      this.size += 1;
    }
    this.updateScore(0,.5);
    this.missionAccomplished = true;
  }
 
  reproduce(other){
    var mate = null;
    if (this.enoughFoodToMate()){
      if (this.gender == 0){ //IF FEMALE
        for (var i=0; i < maleShrimp.length; i++){
          if(dist(this.pos.x,this.pos.y,maleShrimp[i].pos.x,maleShrimp[i].pos.y) < this.size && maleShrimp[i].enoughFoodToMate()){
            //FOUND A MATE
            mate = maleShrimp[i];
            break;
          }
        }
      }
      else{ //IF MALE
        for (var i=0; i < femaleShrimp.length; i++){
          if(dist(this.pos.x,this.pos.y,femaleShrimp[i].pos.x,femaleShrimp[i].pos.y) < this.size && femaleShrimp[i].enoughFoodToMate()){
              //FOUND A MATE
              mate = femaleShrimp[i];
              break;
          }
        }
      }

      if (mate != null){ //BEGIN MATING
        var childDNA = [
          {action : "mate", score : 0, weight : 0},
          {action : "roam", score : 0, weight : 0},
          {action : "food", score : 0, weight : 0},
          {action : "speed", score : 0, weight : 0}
        ];
        for (var i=0; i < this.DNA.length; i++){
          childDNA[i].score = Math.max(Math.floor( (this.DNA[i].score + mate.DNA[i].score)/2 + random(-2,2)),1); //Average the parent scores and some variance
        }
        //drop an egg
        var child = new Egg(this.pos.x,this.pos.y,childDNA,this,mate);
        eggPopulation.push(child);
        this.children.push(child);
        mate.children.push(child);
        //handle repricussions
        this.mate();
        mate.mate();
      }      

    }
  }

  getMateCost(){
    //female
    if (this.gender == 0){
      return 5;
    }
    else{ //Male
      return 5;
    }
  }

  enoughFoodToMate(){
    return this.getMateCost()*5 <= this.fed;
  }

  mate(){ 
    this.fed -= this.getMateCost();
    this.missionAccomplished = true;
  }

  isValidStep(x,y){
    for (var i=0; i<tree.length; i++){
      if (this.intersectsBranch(tree[i],x,y)){
        return false;
      }
    }
    return true;
  }

  isOutOfBounds(x,y){
    var b = 2;
    if (x<b || x > w-b || y < b || y > h-b){
      return true;
    }
    else{
      return false;
    }
  }
  isOutOfBoundsForReal(x,y){
    var b = 0;
    if (x<b || x > w-b || y < b || y > h-b){
      return true;
    }
    else{
      return false;
    }
  }

  keepOnScreen(closest) {
  //take in current closest and return it unchanged if not out of bounds
    var buffer = 10;
    if (this.pos.x < buffer) {
      closest = createVector(this.speed, this.velocity.y);
      //console.log(this.pos.x<d);
    } 
    else if (this.pos.x > w - buffer) {
      closest = createVector(-this.speed, this.velocity.y);
      //console.log("trigger2");
    }

    if (this.pos.y < buffer) {
      closest = createVector(this.velocity.x, this.speed);
      //console.log("trigger3");
    } 
    else if (this.pos.y > h - buffer) {
      closest = createVector(this.velocity.x, -this.speed);
      //console.log("trigger4");
    }
    // if (!this.isValidStep(this.pos.x,this.pos.y)){
    //   closest = createVector(-this.maxSpeed,this.velocity.x);
    // }
    return closest;
}

  intersectsBranch(branch, x, y){
    //length of line
    var len = dist(branch.begin.x,branch.begin.y,branch.end.x,branch.end.y);
    //dist from point to begining of line
    var d1 = dist(x,y,branch.begin.x,branch.begin.y);
    var d2 = dist(x,y,branch.end.x,branch.end.y);
    var buffer = .5;
    //dot product
    var dot = ( ( ((x-branch.begin.x)*(branch.end.x-branch.begin.x)) + ((y-branch.begin.y)*(branch.end.y-branch.begin.y)) )/pow(len,2));

    var closestX = branch.begin.x + (dot*(branch.end.x-branch.begin.x));
    var closestY = branch.begin.y + (dot*(branch.end.y-branch.begin.y));
    fill(0,0,255);
    ellipse(closestX,closestY,20,20);
    if (d1+d2 >= len-buffer && d1+d2 <= len+buffer && dist(x,y,closestX,closestY) < this.size/2){
      return true;//new PVector(closestX,closestY);
    }
    else{
      return false;
    }
  }

  applyForce(force){
    this.acceleration.add(force);
  }

  selectNewTarget(){
    var index = 0;
    var r = random(1);

    while (r > 0) {
      r = r - this.DNA[index].weight;
      index ++;
    }
    index --;
    this.moveChoice = index;

    this.missionAccomplished = false;
  }

  updateTarget(){
    //console.log(shrimpPopulation[0].moveChoice,shrimpPopulation[0].DNA[1].weight,shrimpPopulation[0].DNA[2].weight);
    this.burnoutCounter += 1;
    if (this.burnoutCounter > this.burnoutMax){
      this.selectNewTarget();
      this.burnoutCounter = 0;
    }
    if (parent.selected != null && parent.selected != undefined){
      //console.log(this.missionAccomplished);
    }
    if (!this.missionAccomplished){ // IF task has not been complete, continue
      if (this.moveChoice == 0){
        return this.findMate();
      }
      else if (this.moveChoice == 1){
        this.feed();
        return this.seek(this.roam(this.roamTarget));
      }
      else if (this.moveChoice == 2){
        this.feed();
        return this.findFood();
      }
      // else if (this.moveChoice == 3){
      //   return this.findTree();
      // }
    }
    else{
      this.updateScore(this.moveChoice,0);
      this.selectNewTarget();
    }
  }
  
  clicked(){
    if (dist(mouseX,mouseY,this.pos.x,this.pos.y) < this.size + 15){
      selected = this;
    }
  }

  updateScore(rewardCondition,value){

    if (this.missionAccomplished && this.DNA[rewardCondition].score + value > 0){
      if (value == 0){//Pass in zero if we want a default score, otherwise we will take the given value
        if (rewardCondition == 0){ //Mate
          value = 2;
        }
        else if (rewardCondition == 1){ // Roam
          value = 1;
        }
        else if(rewardCondition == 2){ // food hunt
          value = .5;
        }
        else{
          value = 0;
        }
      }
      this.DNA[rewardCondition].score += value; //Whatever got the food gets a score bump
    }
    this.calcDNAWeights();
  }

  move(){
    var target = this.updateTarget(); //Pick how to move based on moveChoice   
    this.applyForce(target);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.speed);
    this.pos.add(this.velocity);
    p5.Vector.mult(this.acceleration,0);
  }

  seek(target){
    //console.log(target.x,target.y);
    var desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.speed);
    var steer = p5.Vector.sub(desired, this.velocity);
    return steer;
  }

  roam(target){
    this.noiseIndex += 0.01;
    // this.burnoutCounter +=1; 
    var buffer = 10;
    var bounce = 50;

    if (target == null || (abs(this.pos.x-target.x) < 2 && abs(this.pos.y-target.y) < 2)){ // if i've made it to my goal
      //console.log("roaming");
      var x = noise(this.noiseIndex);
      var y = noise(this.noiseIndex+10000);
      x = map(x,0,1,-5,5);
      y = map(y,0,1,-5,5);
      if (this.pos.x+x < buffer){ // too far left
        x = bounce;
      }
      if (this.pos.x+x > w){ //too far right
        x = -bounce;
      }
      if (this.pos.y+y < buffer){ //too far up
        y = bounce;
      }
      if (this.pos.y+y > h){ // too far down
        y = -bounce;
      }
      target = createVector(this.pos.x+x,this.pos.y+y);

    }
    this.roamTarget = target;
    return this.roamTarget;
  }

  findMate(){
    var closest = null;
    var closestD = Infinity;
    
    var mate = null;
    if (this.enoughFoodToMate()){
      if (this.gender == 0){ //IF FEMALE
        for (var i=0; i < maleShrimp.length; i++){
          if(dist(this.pos.x,this.pos.y,maleShrimp[i].pos.x,maleShrimp[i].pos.y) < this.visionDistance*4 && maleShrimp[i].enoughFoodToMate()){
            //FOUND A MATE
            mate = maleShrimp[i];
            break;
          }
        }
      }
      else{ //IF MALE
        for (var i=0; i < femaleShrimp.length; i++){
          if(dist(this.pos.x,this.pos.y,femaleShrimp[i].pos.x,femaleShrimp[i].pos.y) < this.visionDistance*4 && femaleShrimp[i].enoughFoodToMate()){
              //FOUND A MATE
              mate = femaleShrimp[i];
              break;
          }
        }
      }
    }

    if (mate == null){
      //closest = this.roam();
      closest = this.pos;
      this.giveUp();
      //this.updateScore(this.moveChoice,-.25);
    }
    else{
      closest = mate.pos;
    }

    //closest = this.keepOnScreen(closest);
    return this.seek(closest);
  }
    

  findFood(){

    var buffer = 10;
    var closest = null;
    var closestD = Infinity;
    // Look at everything
    for (var i = 0; i < algaePopulation.length; i++) {
      // Calculate distance
      var d = dist(algaePopulation[i].pos.x,algaePopulation[i].pos.y, this.pos.x,this.pos.y);

      // If it's within perception radius and closer than pervious
      if (d < closestD && d <= this.visionDistance) {
        closestD = d;
        // Save it
        closest = algaePopulation[i].pos;
      }
    } 
    if (closest == null || closest == undefined){
      //closest = this.roam(closest);
      //closest = this.keepOnScreen();
      closest = this.pos;
      this.giveUp();
      //this.updateScore(this.moveChoice,-.25);
    }

    closest = this.keepOnScreen(closest);
    // If something was close
    return this.seek(closest);
}
  
  giveUp(){
     this.updateScore(this.moveChoice,-.25);
     this.moveChoice = 1;
     this.missionAccomplished = false;
  }
  
  draw(){
  	fill(this.color);
    noStroke();
  	if (this.gender == 0){
      rect(this.pos.x-this.size/2,this.pos.y-this.size/2,this.size,this.size);
    }
    else if (this.gender == 1){
      ellipse(this.pos.x,this.pos.y,this.size,this.size);
    }
  }

  hdDraw(){
    //MAKE A BALL AT THE END OF THE ANTANAE to show the color
    var x = this.pos.x;
    var y = this.pos.y;
    var colors = [color(250,50,120,this.deathCounter),color(50,100,250,this.deathCounter)];
    var size = this.size;
    strokeWeight(map(size,0,this.maxSize,0.25,1));
    stroke(150,50,50,150);
    noFill();
    //IF LEFT
    if (this.velocity.x < 0){
      stroke(this.color);
      arc(x-size/2,y-size/7,size,size/2,-PI*(2/3),0);
      noStroke();

      // GENDER Striped tail
      fill(colors[this.gender]); 
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x+size/2.5,y+size/2.3,size/3);
      //OTHER PARTS
      fill(this.skinColor);
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x+size/3.25,y+size/3.5,size/2.5);
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x+size/2,y+size/1.5,size/3.25);
      
      //AGE COLOR
      fill(lerpColor(this.skinColor,color(100,50,50,this.deathCounter),map(this.age,0,this.phases[2].ticks,0,1)));
      ellipse(x+size/6,y+size/10,size/2);
      //HEAD
      fill(this.skinColor);
      ellipse(x,y,size/2);
      
      fill(0);//EYE
      ellipse(x-size/6,y-size/7,size/10,size/10);
    }
    else{
      stroke(this.color);
      arc(x+size/2,y-size/7,size,size/2,PI,-PI*(1/3));
      noStroke();

      // GENDER Striped tail
      fill(colors[this.gender]); 
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x-size/2.5,y+size/2.3,size/3);
      //OTHER PARTS
      fill(this.skinColor);
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x-size/3.25,y+size/3.5,size/2.5);
      ellipse(Math.floor(random(-1,1))*2*noise(this.wiggleIndex)+x-size/2,y+size/1.5,size/3.25);
      
      //AGE COLOR
      fill(lerpColor(this.skinColor,color(100,50,50,this.deathCounter),map(this.age,0,this.phases[2].ticks,0,1)));
      ellipse(x-size/6,y+size/10,size/2);
      //HEAD
      fill(this.skinColor);
      ellipse(x,y,size/2);
      
      fill(0,0,0,this.deathCounter);//EYE
      ellipse(x+size/6,y-size/7,size/10,size/10);
    }
    
  }


}