class Algae {
	constructor(x,y,DNA){
		this.pos = createVector(x,y);
		this.color = color(100,255,100,100);
		this.fed = random(10);
		this.size = 5;
		this.range = 300;
		this.growThreshold = 10;
		this.growCost = 10;
		this.children = new Array;
		this.DNA = JSON.parse(JSON.stringify(starterShrimpDNA));
	}

	feed(){
		this.fed ++;
	}

	isOutOfBoundsForReal(x,y){
	    var b = 10;
	    if (x<b || x > w-b || y < b || y > h-b){
	      return true;
	    }
	    else{
	      return false;
	    }
  	}

	reproduce(){
		if (algaePopulation.length <= parent.maxAlgae){ //If algae isnt overpopulated
			if (this.fed >= this.growThreshold){ //If it has more food than it needs
				this.fed -= this.growCost;
				var childX = random(-this.range,this.range) + this.pos.x;
				var childY = this.pos.y+random(-this.range,this.range);
				var child = new Algae(childX, childY, this.DNA);
				algaePopulation.push(child);
			}
		}
	}

	draw(){
	  	fill(this.color);
	  	noStroke();
	  	ellipse(this.pos.x,this.pos.y,this.size);
  }
}


