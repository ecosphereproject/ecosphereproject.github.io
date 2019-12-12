var shadowPointsA = [];
  var shadowPointsB = [];
function initTree(){
  var a = createVector(width / 2, height);
  var b = createVector(width / 2, height - h/4.25);
  var root = new Branch(a, b, 20);
  tree[0] = root;

  for (var i=0; i<40; i++){
    shadowPointsA
    tree.push(tree[i].branchA());
    //shadowPointsA.push(tree[i]);
    //vertex(tree[i].begin);
    tree.push(tree[i].branchB());
    //shadowPointsB.push(tree[i]);
  }
  //console.log(shadowPointsA);
  //endShape();
}

function Branch(begin, end, thickness) {
  this.begin = begin;
  this.end = end;
  this.finished = false;
  this.thickness = thickness;

  this.show = function() {
    stroke(60,0,0);
    strokeWeight(this.thickness);
    line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  }

  this.branchA = function() {
    var dir = p5.Vector.sub(this.end, this.begin);
    dir.rotate(PI / 7.5);
    dir.mult(0.67);
    var newEnd = p5.Vector.add(this.end, dir);
    var b = new Branch(this.end, newEnd, this.thickness*.67);
    shadowPointsA.push(b);
    return b;
  }
  this.branchB = function() {
    var dir = p5.Vector.sub(this.end, this.begin);
    dir.rotate(-PI / 4);
    dir.mult(0.67);
    var newEnd = p5.Vector.add(this.end, dir);
    var b = new Branch(this.end, newEnd, this.thickness*.67);
    shadowPointsB.push(b);
    return b;
  }
}