/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />
function init() {
    var universe = new Universe(CANVAS_WIDTH, CANVAS_HEIGHT, "demoCanvas");
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(40, 40)));
    Universe.AddEntity(new Entity([new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(30, 30))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30)), new Block(new Loc(40, 40))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
}
function testLinq() {
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
var CANVAS_WIDTH = 100;
var CANVAS_HEIGHT = 100;
var Bounds = (function () {
    function Bounds(width, height) {
        this.width = width;
        this.height = height;
    }
    return Bounds;
}());
var Loc = (function () {
    function Loc(x, y) {
        this.x = x;
        this.y = y;
    }
    return Loc;
}());
var Block = (function () {
    function Block(location) {
        this.location = location;
    }
    Block.getHalfBlockSize = function () {
        return 5;
    };
    Block.getFullBlockSize = function () {
        return 10;
    };
    return Block;
}());
var Entity = (function () {
    function Entity(blocks, location) {
        var _this = this;
        this.blocks = blocks;
        this.location = location;
        this.render = function () {
            if (Universe.readyForRender()) {
                Enumerable.From(_this.blocks).ForEach(function (b) {
                    if (Universe.readyForRender()) {
                        var rectangle = new createjs.Shape();
                        rectangle.graphics.beginFill("DeepSkyBlue").drawRect(b.location.x - Block.getHalfBlockSize() + _this.location.x, b.location.y - Block.getHalfBlockSize() + _this.location.y, Block.getFullBlockSize(), Block.getFullBlockSize());
                        Universe.renderingLayer.addChild(rectangle);
                        Universe.renderingLayer.update();
                    }
                });
            }
        };
        this.alive = true;
        this.age = 0;
    }
    Entity.prototype.addBlock = function (block) {
        this.blocks.push(block);
    };
    Entity.prototype.getLifeExpectancy = function () {
        return 10000 - this.blocks.length;
    };
    Entity.prototype.recenter = function () {
        var bounds = this.getBounds();
        var midX = bounds.width / 2;
        var midY = bounds.height / 2;
        var leftMostX = Enumerable.From(this.blocks).Min("$.location.x");
        var topMostY = Enumerable.From(this.blocks).Min("$.location.y");
        var newCenterOnOldCoordinate = new Loc(leftMostX + midX, topMostY + midY);
        Enumerable.From(this.blocks).ForEach(function (a) { a.location.x += a.location.x - newCenterOnOldCoordinate.x; a.location.y += a.location.y - newCenterOnOldCoordinate.y; });
        this.location.x += newCenterOnOldCoordinate.x;
        this.location.y += newCenterOnOldCoordinate.y;
    };
    Entity.prototype.getBounds = function () {
        var width = Enumerable.From(this.blocks).Max("$.location.x") - Enumerable.From(this.blocks).Min("$.location.x");
        var height = Enumerable.From(this.blocks).Max("$.location.y") - Enumerable.From(this.blocks).Min("$.location.y");
        return new Bounds(width, height);
    };
    Entity.prototype.getEntityPotentialGrowthBlocks = function () {
        var growthPossibilities = Enumerable.From([]);
        Enumerable.From(this.blocks).ForEach(function (x) { growthPossibilities.Union(Entity.getSurroundingBlocks(x)); });
        return growthPossibilities.Except(this.blocks).ToArray();
    };
    Entity.prototype.stepForward = function (sequence) {
        this.age++;
        if (this.getLifeExpectancy() - this.age < 0) {
            this.alive = false;
            return;
        }
        else {
            this.location = new Loc(Math.floor(Math.random() * CANVAS_WIDTH), Math.floor(Math.random() * CANVAS_HEIGHT));
            this.render();
        }
    };
    Entity.getEntityComparison = function (entity1, entity2) {
        entity1.recenter();
        entity2.recenter();
        var intersection = Enumerable.From(entity1.blocks).Intersect(Enumerable.From(entity2.blocks)).ToArray();
        var unique = Enumerable.From(entity1.blocks).Except(Enumerable.From(entity2.blocks)).ToArray();
        return { intersection: intersection, unique: unique };
    };
    Entity.mate = function (entity1, entity2) {
        console.log("A child is born...!");
        var comparison = Entity.getEntityComparison(entity1, entity2);
        var newEntity = new Entity(comparison.intersection, new Loc(entity1.location.x, entity2.location.y));
        Enumerable.From(comparison.unique).Intersect(newEntity.getEntityPotentialGrowthBlocks()).ForEach(function (x) { if (Math.floor(Math.random() * 2) == 1)
            newEntity.addBlock(x); });
        Enumerable.From(newEntity.getEntityPotentialGrowthBlocks()).ForEach(function (x) { if (Math.floor(Math.random() * 2) == 1)
            newEntity.addBlock(x); });
        return newEntity;
    };
    Entity.getSurroundingBlocks = function (block) {
        return [new Block(new Loc(block.location.x - Block.getFullBlockSize(), block.location.y - Block.getFullBlockSize())),
            new Block(new Loc(block.location.x, block.location.y - Block.getFullBlockSize())),
            new Block(new Loc(block.location.x + Block.getFullBlockSize(), block.location.y - Block.getFullBlockSize())),
            new Block(new Loc(block.location.x + Block.getFullBlockSize(), block.location.y)),
            new Block(new Loc(block.location.x + Block.getFullBlockSize(), block.location.y + Block.getFullBlockSize())),
            new Block(new Loc(block.location.x, block.location.y + Block.getFullBlockSize())),
            new Block(new Loc(block.location.x - Block.getFullBlockSize(), block.location.y + Block.getFullBlockSize())),
            new Block(new Loc(block.location.x - Block.getFullBlockSize(), block.location.y))
        ];
    };
    return Entity;
}());
var Universe = (function () {
    function Universe(canvasWidth, canvasHeight, canvasElementName) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        var stage = new createjs.Stage(canvasElementName);
        Universe.timer = new TimeKeeper();
        Universe.timer.listeners.push(this);
        Universe.updateRenderingLayer(stage);
        Universe.entities = [];
    }
    Universe.prototype.stepForward = function (sequence) {
        Enumerable.From(Universe.entities).ForEach(function (x) { x.stepForward(this.counter); });
        Universe.checkForMating();
    };
    Universe.checkForMating = function () {
        var possibleMates = [];
        Enumerable.From(Universe.entities).ForEach(function (entity) {
            if (possibleMates.length > 0) {
                Enumerable.From(possibleMates)
                    .Where(function (mate) { return entity.location.x === mate.location.x && entity.location.y === mate.location.y; })
                    .ForEach(function (mate) { Universe.AddEntity(Entity.mate(entity, mate)); });
            }
            possibleMates.push(entity);
        });
    };
    Universe.updateRenderingLayer = function (renderingLayer) {
        this.renderingLayer = renderingLayer;
    };
    Universe.clearRenderingLayer = function () {
        this.renderingLayer.removeAllChildren();
        this.renderingLayer.update();
    };
    Universe.readyForRender = function () {
        if (typeof this.renderingLayer !== 'undefined') {
            return true;
        }
        else {
            return false;
        }
    };
    Universe.AddEntity = function (entity) {
        Universe.entities.push(entity);
    };
    return Universe;
}());
var TimeKeeper = (function () {
    function TimeKeeper() {
        var _this = this;
        this.myCallback = function () {
            if (Universe.readyForRender()) {
                Universe.clearRenderingLayer();
            }
            Enumerable.From(_this.listeners).ForEach(function (x) { x.stepForward(_this.counter); });
            _this.counter++;
        };
        this.listeners = [];
        this.counter = 0;
        this.intervalID = window.setInterval(this.myCallback, 100);
    }
    return TimeKeeper;
}());
