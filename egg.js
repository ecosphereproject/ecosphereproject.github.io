class Egg{
	constructor(x,y,DNA,parent1,parent2){
		this.size = 5;
		this.pos = createVector(x,y);
		this.DNA = JSON.parse(JSON.stringify(DNA));
		this.age = 0;
		this.hatchAge = Math.floor(random(500,800));
		this.noiseIndex = random(100);
		this.parent1 = parent1;
		this.parent2 = parent2;
		this.newShrimp = new Shrimp(this.pos,this.DNA,this.parent1,this.parent2);
	}

	update(){
		this.sink();
		this.hatch();
	}

	hatch(){
		if (this.age >= this.hatchAge){
			this.newShrimp = new Shrimp(this.pos,this.DNA,this.parent1,this.parent2);
			addShrimp(this.newShrimp);
			for (var i=0; i < eggPopulation.length; i++){
				if (eggPopulation[i] == this){
					eggPopulation.splice(i,1);
				}
			}
		}
		else{
			this.age ++;
		}

	}

	sink(){
		if (this.pos.y < h-8){
			if (this.pos.x > 2){
				this.noiseIndex += 0.01;
				this.pos.x += noise(this.noiseIndex)*Math.floor(random(-1,1));
			}
			
			this.pos.y += 1;
		}
	}

	draw(){
		var ageToHatch = map(this.age,0,this.hatchAge,0,1);
		var birthColor = color(240,100,100);
		var hatchColor = color(100,0,0);
		fill(lerpColor(birthColor,hatchColor,ageToHatch));
		ellipse(this.pos.x,this.pos.y,this.size,this.size);
	}


}