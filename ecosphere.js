var w = window.innerWidth;
var h = window.innerHeight;

function setup() {
  textFont('Courier New',32);
  worldAge = 0;
  createCanvas(w, h);
  shrimpPopulation = new Array;
  eggPopulation = new Array;
  femaleShrimp = new Array;
  maleShrimp = new Array;
  algaePopulation = new Array;
  bacteriaPopulation = new Array;
  popSize = 20;
  tree = [];
  initTree();
  initPopulations();
  //addShrimp();
  setInterval(triggerPassive,1000);
  setInterval(triggerHunger,2000);
  maxAlgae = 1000;
  selected = null;

  numShrimp = new Array();
  numAlgae = new Array();
  genelog = new Array();

  showStats = false;
  girls = 0;
  boys = 0;
  titleShow = 255;

}

function addShrimp(shrimp){
	femaleShrimp = new Array;
	maleShrimp = new Array;
	if (shrimp != null && shrimp != undefined){
		shrimpPopulation.push(shrimp);

		for (var i=0; i < shrimpPopulation.length; i++){
			if (shrimpPopulation[i].gender == 0){
				femaleShrimp.push(shrimpPopulation[i]);			
			}
			else{
				maleShrimp.push(shrimpPopulation[i]);
			}
		}
	}
	// console.log("female",femaleShrimp.length);
	// console.log("male",maleShrimp.length);
}



function pollData(){
	if (shrimpPopulation.length == 0 && eggPopulation.length == 0){
		reboundPopulation();
	}

	girls = 0;
	boys = 0;
	var historyPeriod = 30;
	numShrimp.push(shrimpPopulation.length);
	
	numAlgae.push(algaePopulation.length);
	var logDNA = [
	      {action : "Mate", score : 0, weight : 0},
	      {action : "Roam", score : 0, weight : 0},
	      {action : "Food", score : 0, weight : 0},
	      {action : "Speed", score : 0, weight : 0}
	    ]
	var numShrimpNow = shrimpPopulation.length;
	for (var i=0; i < numShrimpNow; i++){
		if (shrimpPopulation[i].gender == 0){
			girls ++;
		}
		else{
			boys ++;
		}
		for (var j=0; j < shrimpPopulation[i].DNA.length; j++){
			logDNA[j].weight += shrimpPopulation[i].DNA[j].weight;
			logDNA[j].score += shrimpPopulation[i].DNA[j].score;
		}
	}
	logDNA.forEach(gene => gene.weight /= numShrimpNow);
	genelog.unshift(logDNA);


	if (genelog.length > historyPeriod){
		genelog.pop();
		numAlgae.shift();
		numShrimp.shift();
	}

	//console.log(genelog);
	
}

function graphPopulation(){
	var graphWidth = 300;
	var graphHeight = 100;
	var graphYBump = h - graphHeight;
	var xBump = 50;

	if (numShrimp.length != 0){
		var lastShrimp = 0;
		var lastAlgae = 0;
		var biggestNumShrimp = Math.max(...numShrimp);
		//console.log(biggestNum);
		fill(0);
		noStroke();
		textSize(18);
		text("Shrimp & Algae Population Size",xBump-15,graphYBump-25);
		strokeWeight(2);
		stroke(0);
		line(xBump+graphWidth-10,graphYBump,xBump+graphWidth-10,graphYBump+graphHeight);


		strokeWeight(4);
		for (var i=1; i<numShrimp.length-1; i++) {

			var adjustedShrimp = map(numShrimp[i], 0, biggestNumShrimp, 0, 100);
			var adjustedAlgae = map(numAlgae[i], 0, maxAlgae, 0, 100);

			//console.log(adjustedNum);
			stroke(255,75,150,150);
			line(i*(graphWidth/numShrimp.length)+xBump, lastShrimp+graphYBump, (i+1)*(graphWidth/numShrimp.length)+xBump, (graphHeight - adjustedShrimp)+graphYBump);
			stroke(75,225,75,150);
			line(i*(graphWidth/numShrimp.length)+xBump, lastAlgae+graphYBump, (i+1)*(graphWidth/numShrimp.length)+xBump, (graphHeight - adjustedAlgae)+graphYBump);
			lastShrimp = graphHeight - adjustedShrimp;
			lastAlgae = graphHeight - adjustedAlgae;
		}
	}
}

function graphGenes(){
	var graphWidth = 300;
	var graphHeight = 100;
	var graphYBump = h - graphHeight;
	var graphXBump = w - graphWidth;
	var colors = [color(255,150,150),color(150,255,150),color(150,150,255)];
	var lastSet = new Array
	
	strokeWeight(4);
	if (genelog.length > 1){
		
		for (var i=1; i < genelog.length; i++){
			for (var j=0; j<genelog[i].length; j++){
				if (j < 3){
					//console.log(genelog[i-1]);
					stroke(colors[j]);
					line(i*(graphWidth/genelog.length)+graphXBump, graphHeight- map(genelog[i-1][j].weight,0,1,0,graphHeight)+graphYBump, (i+1)*(graphWidth/genelog.length)+graphXBump, (graphHeight - map(genelog[i][j].weight,0,1,0,graphHeight))+graphYBump);
				
				}
				// else{
				// 	noStroke();
				// 	text("Avg. Speed",graphXBump+15-graphWidth/2,graphYBump-25);
				// 	text(genelog[i][j].score,-15+graphXBump-graphWidth/4,graphYBump-5);
				// }
				
			}
		}
		strokeWeight(2);
		stroke(0);
		line(graphXBump+10,graphYBump,graphXBump+10,graphYBump+graphHeight);
		noStroke();
		textSize(14);
		text("1.0",graphXBump-25,graphYBump+5);
		text("0.5",graphXBump-25,graphYBump+graphHeight/2);
		text("0.0",graphXBump-25,graphYBump+graphHeight-5);
		fill(colors[0]);
		text("Mate",-15+graphXBump+graphWidth/4,graphYBump-5);
		fill(colors[1]);
		text("Roam",-15+graphXBump+graphWidth/2,graphYBump-5);
		fill(colors[2]);
		text("Food",-15+graphXBump+3*graphWidth/4,graphYBump-5);

		textSize(18);
		fill(0);
		text("Avg. Population Gene Weight",graphXBump-15,graphYBump-25);


	}

}

function triggerPassive(){

	//Trigger shrimp brains
	//shrimpPopulation.forEach(shrimp => {shrimp.selectNewTarget();});

	//Algae Feeding
	algaePopulation.forEach(algae => {algae.feed();});
	//Trigger Hunger
	
	worldAge ++;
	pollData();
	//Kill
	cullPopulations();
}

function triggerHunger(){
	shrimpPopulation.forEach(shrimp => {shrimp.hunger();});
}

function triggerSystem(){

	//Trigger Movement & Mating
	shrimpPopulation.forEach(shrimp => {shrimp.action();});
	algaePopulation.forEach(algae => {algae.reproduce();});
	eggPopulation.forEach(egg => {egg.update()})
}


function initPopulations(){
	
	// for (var i = 0; i < 50; i++){
		var startSpeed = Math.floor(random(1,3));
		starterShrimpDNA = [
	      {action : "Mate", score : 1, weight : 0},
	      {action : "Roam", score : 1, weight : 0},
	      {action : "Food", score : 1, weight : 0},
	      {action : "Speed", score : startSpeed, weight : 0}
	    ]
	// 	//shrimpPopulation.push(new Shrimp(createVector(random(w),random(h)),starterShrimpDNA));
	// 	addShrimp(new Shrimp(createVector(random(w),random(h)),starterShrimpDNA,null,null));
	// }
	for (var i = 0; i < 50; i++){
		addEgg(random(w),random(h));
	}
	for (var i = 0; i < popSize*20; i++){
		algaePopulation.push(new Algae(random(w),random(h)));
	}
	
}

function addEgg(x,y){
	var startSpeed = Math.floor(random(1,3));
	starterEggDNA = [
      {action : "Mate", score : 1, weight : 0},
      {action : "Roam", score : 1, weight : 0},
      {action : "Food", score : 1, weight : 0},
      {action : "Speed", score : startSpeed, weight : 0}
    ];
    if (x == null && y == null){
    	x = mouseX;
    	y = mouseY;
    }
    eggPopulation.push(new Egg(x,y,starterEggDNA,null,null));
}

function drawTitle(){
	titleShow --;
	textStyle(BOLD);
	fill(0,0,0,titleShow);
	textAlign(CENTER);
	textSize(60);
	text("Ecosphere",w/2,h/6);
	textSize(30);
	textStyle(NORMAL);
	fill(0,0,0,titleShow+120);
	text("Griffin Tang",w/2,h/4);
	textSize(20);
	if (!showStats){
		fill(0,0,0,titleShow+240);
		text("press any key for stats",w/2,h/3.1);
	}
	
	textAlign(LEFT);

}


function draw() {
  triggerSystem();
  background(250);
  drawTree();
  drawCritters();
  drawTitle();
  if (showStats){
  	titleShow = 255;
  	drawSelection();
  	graphPopulation();
	graphGenes();
	pieChart(100,[femaleShrimp,maleShrimp]);
  }
  
}

function mouseClicked(){
	shrimpPopulation.forEach(shrimp => {shrimp.clicked()});
	addEgg();
}

function drawSelection(){
	fill(0);
	noStroke();
    textSize(18)
    var xPos = w/2+120;
    text("Selected:",xPos,height-125);

	if (selected != null && selected != undefined){
	    noFill();
	    strokeWeight(1);
	    stroke(150,150,150);
	    var gCol = [color(250,50,120),color(50,100,250)];
	    ellipse(selected.pos.x,selected.pos.y,selected.visionDistance,selected.visionDistance);
	    for (var i=0; i < selected.children.length; i++){
	    	stroke(200,200,0,200);
	    	ellipse(selected.children[i].pos.x,selected.children[i].pos.y,selected.children[i].newShrimp.size*2);
	    }
	    if (selected.parent1 != null && selected.parent2 != null && selected.parent1.deathCounter > 1 && selected.parent2.deathCounter > 1){
	    	console.log('mama no dead');
	    	stroke(gCol[selected.parent1.gender]);
			ellipse(selected.parent1.pos.x,selected.parent1.pos.y,selected.parent1.size*2);
			stroke(gCol[selected.parent2.gender]);
			ellipse(selected.parent2.pos.x,selected.parent2.pos.y,selected.parent2.size*2);
	    }

		fill(0);
		noStroke();
		textSize(15);
		text("Size: "+selected.fed,xPos,h-103);
		text("Children: "+selected.children.length,xPos+95,h-103);
	    text("Age: "+selected.phase.name +" ("+selected.age+")",xPos,h-83);
	    text("(Gen " +selected.getNumGens()+")",xPos+120,height-125)
	    
	    for(var i=0; i < selected.DNA.length; i++){
	        //console.log(selected.DNA[i].weight);
	        fill(0);
	        if (selected.moveChoice == i){
	        	fill(100,100,255);
	        }
	        text(selected.DNA[i].action+": "+selected.DNA[i].weight.toFixed(2)+" (Score: "+selected.DNA[i].score+")",xPos,h-63+20*i);
	    }
	}
	else{
    textSize(13)
    text("Click a shrimp!",xPos+25,height-95);
	}
}

function pieChart(diameter, data) {
  textSize(18);
  fill(0);
  noStroke();
  text("Gender Ratio",w/2-2.5*diameter-9 ,height-diameter-25);
  angles = [map(girls,0,shrimpPopulation.length,0,360),map(boys,0,shrimpPopulation.length,0,360)];
  colors = [color(250,50,120),color(50,100,250)];
  var lastAngle = 0;
  fill(colors[0]);
  ellipse(w/2-diameter*2-10+ 15,height - diameter/2 - 10 , diameter,diameter);
  fill(colors[1]);
  arc(
      w/2-diameter*2-10 + 15,
      height - diameter/2 - 10,
      diameter,
      diameter,
      0,
      radians(angles[1])
    );
}

function reboundPopulation(){
	for (var i = 0; i < 50; i++){
		addEgg(random(w),random(h));
	}
}

function keyPressed() {
  showStats = !showStats;
}

function drawCritters(){
	shrimpPopulation.forEach(shrimp => {shrimp.hdDraw();});
	algaePopulation.forEach(algae => {algae.draw();});
	//bacteriaPopulation.forEach(bacteria => {bacteria.draw();});
	eggPopulation.forEach(egg => {egg.draw()});
}

function drawTree(){
	//Draw Branches
	tree.forEach(branch => {branch.show();});
}

function cullPopulations(){
	//Kill for starvation
	//shrimpPopulation = shrimpPopulation.filter(shrimp => shrimp.fed > 0 );
	//Kill for out of bounds
	shrimpPopulation = shrimpPopulation.filter(shrimp => !shrimp.isOutOfBoundsForReal(shrimp.pos.x,shrimp.pos.y));
	if (selected != null){
		if (selected.children.length > 0){
		//console.log(selected.children[0].newShrimp);
	}
	}
	
	if (selected != null && selected.deathCounter < 1){
		//console.log("i dead");
		selected = null;
	}
	shrimpPopulation.forEach(shrimp => shrimp.children.filter(child => child.newShrimp.deathCounter > 1));
	algaePopulation = algaePopulation.filter(algae => !algae.isOutOfBoundsForReal(algae.pos.x,algae.pos.y));
	//console.log(shrimpPopulation.length)
}


