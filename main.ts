/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />

function init() {
	testGraphics();
	testTimer();
}

function testLinq(): Bounds {
	var entity = new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0));
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

var t ;

var entity;

function testTimer() {
	t = new TimeKeeper();

	entity = new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0));

	t.listeners.push(entity);
}

const BLOCK_SIZE = 10;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;

interface ComparisonResult {
	intersection: Block[];
	unique: Block[]
}

interface TimeListeners {
	stepForward(sequence: number);
}

class Bounds {
	constructor(public width: number, public height: number) { }
}

class Loc {
	constructor(public x: number, public y: number) { }
}

class Block {
	constructor(public location: Loc) { }
}

class Entity implements TimeListeners {
	constructor(public blocks: Block[], public location: Loc) { }

	addBlock(block: Block) {
		this.blocks.push(block);
	}

	getLifeExpectancy(): number {
		return 15 - this.blocks.length;
	}

	recenter() {
		var bounds = this.getBounds();
		var midX = bounds.width / 2;
		var midY = bounds.height / 2;

		var leftMostX = Enumerable.From(this.blocks).Min("$.location.x");
		var topMostY = Enumerable.From(this.blocks).Min("$.location.y");

		var newCenterOnOldCoordinate = new Loc(leftMostX + midX, topMostY + midY);

		Enumerable.From(this.blocks).ForEach(function(a) { a.location.x += a.location.x - newCenterOnOldCoordinate.x; a.location.y += a.location.y - newCenterOnOldCoordinate.y; });

		this.location.x += newCenterOnOldCoordinate.x;
		this.location.y += newCenterOnOldCoordinate.y;
	}

	getBounds(): Bounds {
		var width = Enumerable.From(this.blocks).Max("$.location.x") - Enumerable.From(this.blocks).Min("$.location.x");
		var height = Enumerable.From(this.blocks).Max("$.location.y") - Enumerable.From(this.blocks).Min("$.location.y");

		return new Bounds(width, height);
	}

	stepForward(sequence: number) {
		console.log("Got called for " + sequence);
	}

	static getEntityComparison(entity1: Entity, entity2: Entity): ComparisonResult {
		entity1.recenter();
		entity2.recenter();

		var intersection = Enumerable.From(entity1.blocks).Intersect(Enumerable.From(entity2.blocks)).ToArray();
		var unique = Enumerable.From(entity1.blocks).Except(Enumerable.From(entity2.blocks)).ToArray();

		return { intersection: intersection, unique: unique };
	}

	static mate(entity1: Entity, entity2: Entity): Entity {
		var comparison = Entity.getEntityComparison(entity1, entity2);

		var newEntity = new Entity(comparison.intersection, new Loc(entity1.location.x, entity2.location.y));

		Enumerable.From(comparison.unique).ForEach(function(x) { if (Math.floor(Math.random() * 2) == 1) newEntity.addBlock(x) });

		return newEntity;
	}
}

class TimeKeeper {
	listeners: TimeListeners[];
	intervalID: number;
	counter: number;

	constructor() {
		this.listeners = [];
		this.counter = 0;
		this.intervalID = window.setInterval(this.myCallback, 1000);
	}

	myCallback = () => {
		Enumerable.From(this.listeners).ForEach(function(x) { x.stepForward(_this.counter) });
		this.counter++;
	}
}