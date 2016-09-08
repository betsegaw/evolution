/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />

function init() {
	var universe = new Universe(CANVAS_WIDTH, CANVAS_HEIGHT, "demoCanvas");
	for (var i = 0; i < STABLE_POPULATION_BLOCK_COUNT; i ++) {
		Universe.AddEntity(new Entity([new Block(new Loc(0, 0))], new Loc( Math.floor(Math.random() * CANVAS_WIDTH),  Math.floor(Math.random() * CANVAS_HEIGHT))));
	}
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

function testTimer() {
	var t = new TimeKeeper();

	var entity = new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0));

	t.listeners.push(entity);
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const STABLE_POPULATION_BLOCK_COUNT = 400;
const SINGLE_BLOCK_MOVEMENT = 100;

interface ComparisonResult {
	intersection: Block[];
	unique: Block[]
}

interface TimeListeners {
	stepForward(sequence: number);
}

interface SelfRendering {
	render();
}

class Bounds {
	constructor(public width: number, public height: number) { }
}

class Loc {
	constructor(public x: number, public y: number) { }
}

class Block {
	constructor(public location: Loc) { }

	static getHalfBlockSize() {
		return 5;
	}

	static getFullBlockSize() {
		return 10;
	}
}

class Entity implements TimeListeners, SelfRendering {
	alive: boolean;
	age: number;

	constructor(public blocks: Block[], public location: Loc) {
		this.alive = true;
		this.age = 0;
	}

	addBlock(block: Block) {
		this.blocks.push(block);
	}

	getLifeExpectancy(): number {
		return Entity.getSingleBlockLifeExpectancy() - this.blocks.length + 1;
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

	getEntityPotentialGrowthBlocks(): Block[] {
		var growthPossibilities = Enumerable.From([]);

		Enumerable.From(this.blocks).ForEach(function(x) { growthPossibilities = growthPossibilities.Union(Entity.getSurroundingBlocks(x)); });

		return growthPossibilities.Except(this.blocks, function(x) { return JSON.stringify(x); }).ToArray();
	}

	stepForward(sequence: number) {
		this.age++;

		if (this.getLifeExpectancy() - this.age < 0) {
			this.alive = false;
			return;
		}
		else {
			this.location = new Loc((this.location.x + Math.floor(Math.random() * (SINGLE_BLOCK_MOVEMENT *2 + 1)) - SINGLE_BLOCK_MOVEMENT) % CANVAS_WIDTH, (this.location.y + Math.floor(Math.random() * (SINGLE_BLOCK_MOVEMENT *2 + 1)) - SINGLE_BLOCK_MOVEMENT) % CANVAS_HEIGHT);

			this.render();
		}
	}

	render = () => {
		if (Universe.readyForRender()) {
			Enumerable.From(this.blocks).ForEach(function(b) {
				if (Universe.readyForRender()) {
					var rectangle = new createjs.Shape();
					rectangle.graphics.beginFill("DeepSkyBlue").drawRect(b.location.x - Block.getHalfBlockSize() + _this.location.x, b.location.y - Block.getHalfBlockSize() + _this.location.y, Block.getFullBlockSize(), Block.getFullBlockSize());
					Universe.renderingLayer.addChild(rectangle);
				}
			});
		}
	}

	static getSingleBlockLifeExpectancy(): number {
		var totalBlocksCount: number;

		var livingEntities = Enumerable.From(Universe.entities).Where(function(x) { return x.alive });

		if (livingEntities.Count() > 0) {
			totalBlocksCount = livingEntities.Select(function(x) { return x.blocks.length } ).Aggregate(function(x, y) { 
				return x + y; 
			});
		}
		else {
			totalBlocksCount = 0;
		}
		
		return 100 + (STABLE_POPULATION_BLOCK_COUNT - totalBlocksCount) * 0.01 + Math.pow(2,STABLE_POPULATION_BLOCK_COUNT - totalBlocksCount); 
	}

	static getEntityComparison(entity1: Entity, entity2: Entity): ComparisonResult {
		entity1.recenter();
		entity2.recenter();

		var intersection = Enumerable.From(entity1.blocks).Intersect(Enumerable.From(entity2.blocks), function(x) { return JSON.stringify(x); }).ToArray();
		var unique = Enumerable.From(entity1.blocks).Except(Enumerable.From(entity2.blocks), function(x) { return JSON.stringify(x); }).ToArray();

		return { intersection: intersection, unique: unique };
	}

	static mate(entity1: Entity, entity2: Entity): Entity[] {
		console.log("A child is born...!");

		var comparison = Entity.getEntityComparison(entity1, entity2);

		var newEntity = new Entity(comparison.intersection, new Loc( Math.floor(Math.random() * CANVAS_WIDTH),  Math.floor(Math.random() * CANVAS_HEIGHT)));

		Enumerable.From(comparison.unique).Intersect(newEntity.getEntityPotentialGrowthBlocks(), function(x) { return JSON.stringify(x); }).ForEach(function(x) { if (Math.floor(Math.random() * 2) == 1) newEntity.addBlock(x) });
		
		Enumerable.From(newEntity.getEntityPotentialGrowthBlocks()).ForEach(function(x) { if (Math.floor(Math.random() * 2) == 1) newEntity.addBlock(x) });

		if (newEntity.blocks.length != 0) {
			return Entity.duplicateEntity(newEntity, 100);
		}
		else {
			return [];
		}
	}

	static duplicateEntity(entity: Entity, count: number): Entity[] {
		var result:Entity[] = [];

		for(var i:number = 0; i < count; i++) {
			result.push(new Entity(Enumerable.From(entity.blocks).Select(function(block) { return new Block(new Loc(block.location.x,block.location.y)); }).ToArray(),new Loc(0,0)));
		} 

		Entity.randomizeLocation(result, new Loc(0,0), new Loc(CANVAS_WIDTH,CANVAS_HEIGHT));

		return result;
	}

	static randomizeLocation( entities: Entity[], minTopLeft: Loc, maxBottomRight: Loc) {
		Enumerable.From(entities).ForEach(function(x) { 
			x.location = new Loc(Math.floor(Math.random() * (maxBottomRight.x - minTopLeft.x)),  
				Math.floor(Math.random() * (maxBottomRight.y - minTopLeft.y))); 
		});
	}

	static getSurroundingBlocks (block: Block): Block [] {
		return [new Block(new Loc(block.location.x - Block.getFullBlockSize(),block.location.y - Block.getFullBlockSize())),
			new Block(new Loc(block.location.x,block.location.y - Block.getFullBlockSize())),
			new Block(new Loc(block.location.x + Block.getFullBlockSize(),block.location.y - Block.getFullBlockSize())),
			new Block(new Loc(block.location.x + Block.getFullBlockSize(),block.location.y)),
			new Block(new Loc(block.location.x + Block.getFullBlockSize(),block.location.y + Block.getFullBlockSize())),
			new Block(new Loc(block.location.x, block.location.y + Block.getFullBlockSize())),
			new Block(new Loc(block.location.x - Block.getFullBlockSize(),block.location.y + Block.getFullBlockSize())),
			new Block(new Loc(block.location.x - Block.getFullBlockSize(),block.location.y))
		];
	}
}

class Universe implements TimeListeners{
	static entities: Entity[];
	static renderingLayer: createjs.Stage;
	static timer: TimeKeeper;

	constructor(public canvasWidth: number, public canvasHeight: number, canvasElementName: string) {
		var stage = new createjs.Stage(canvasElementName);
		Universe.timer = new TimeKeeper();
		Universe.timer.listeners.push(this);
		Universe.updateRenderingLayer(stage);
		Universe.entities = [];
	}

	stepForward (sequence: number) {
		this.LogStats();
		Universe.entities = Enumerable.From(Universe.entities).Where(function(x) { return x.alive }).ToArray();
		Enumerable.From(Universe.entities).ForEach(function(x) { x.stepForward(this.counter) });
		Universe.checkForMating();
		Universe.renderingLayer.update();
	}

	LogStats() {
		console.log("Current Single Block life Expectancy: " + Entity.getSingleBlockLifeExpectancy());
	}

	static checkForMating() {
		var possibleMates = [];

		Enumerable.From(Universe.entities).ForEach(function(entity) { 
			if (possibleMates.length > 0 && entity.alive) {
				Enumerable.From(possibleMates)
					.Where(function(mate) { return mate.alive})
					.Where(function(mate) { return entity.location.x === mate.location.x && entity.location.y === mate.location.y;})
					.ForEach(function(mate) { Enumerable.From(Entity.mate(entity, mate)).ForEach(function(x) { Universe.AddEntity(x); }) });
			}

			possibleMates.push(entity);
		});
	}

	static updateRenderingLayer(renderingLayer: createjs.Stage) {
		this.renderingLayer = renderingLayer;
	}

	static clearRenderingLayer() {
		this.renderingLayer.removeAllChildren();
		this.renderingLayer.update();
	}

	static readyForRender(): Boolean {
		if (typeof this.renderingLayer !== 'undefined') {
			return true;
		}
		else {
			return false;
		}

	}

	static AddEntity(entity: Entity) {
		Universe.entities.push(entity);
	}
}

class TimeKeeper {
	listeners: TimeListeners[];
	intervalID: number;
	counter: number;

	constructor() {
		this.listeners = [];
		this.counter = 0;
		this.intervalID = window.setInterval(this.myCallback, 10);
	}

	myCallback = () => {
		if (Universe.readyForRender()) {
			Universe.clearRenderingLayer();
		}

		Enumerable.From(this.listeners).ForEach(function(x) { x.stepForward(_this.counter) });
		this.counter++;
	}
}