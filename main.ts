/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />

function init() {
	testGraphics();
}

function testLinq() : Bounds {
	var entity = new Entity([new Block(new Loc(0,0)), new Block(new Loc(10,10)), new Block(new Loc(20,20)), new Block(new Loc(30,30))]);
	return entity.getBounds();
}

function testGraphics() {
	var stage = new createjs.Stage("demoCanvas");

	var rectangle = new createjs.Shape();
	rectangle.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, 100, 100, 2);
	rectangle.x = 100;
	rectangle.y = 100;
	stage.addChild(rectangle);
	stage.update();
}

class Bounds {
	constructor(public width: number, public height: number) {

	}
}

class Loc {
	constructor (public x: number, public y: number){

	}
}

class Block {
	constructor(public location: Loc) {
	}
}

class Entity {
	constructor(public block: Block[]) {
	}

	getBounds(): Bounds {
		var width = Enumerable.From(this.block).Max("$.location.x") - Enumerable.From(this.block).Min("$.location.x");
		var height = Enumerable.From(this.block).Max("$.location.y") - Enumerable.From(this.block).Min("$.location.y");

		return new Bounds(width, height);
	}
}