/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />

function init() {
	var stage = new createjs.Stage("demoCanvas");

	var rectangle = new createjs.Shape();
	rectangle.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, 100, 100, 2);
	rectangle.x = 100;
	rectangle.y = 100;
	stage.addChild(rectangle);
	stage.update();
}

interface Bounds {
	width: number;
	height: number;
}

interface Location {
	x: number;
	y: number;
}

class Block {
	constructor(public location: Location) {
	}
}

class Entity {
	constructor(public block: Block[]) {
	}

	getBounds(): Bounds{
		
	}
}