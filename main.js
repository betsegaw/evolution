/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />
function init() {
    var universe = new Universe(CANVAS_WIDTH, CANVAS_HEIGHT, "demoCanvas");
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
    Universe.AddEntity(new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))], new Loc(0, 0)));
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
var BLOCK_SIZE = 10;
var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 1000;
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
    Block.prototype.render = function () {
        console.log("Drawing Block at " + this.location.x + " " + this.location.y);
        if (Universe.readyForRender()) {
            var rectangle = new createjs.Shape();
            rectangle.graphics.beginFill("DeepSkyBlue").drawRect(this.location.x - Block.getHalfBlockSize(), this.location.y - Block.getHalfBlockSize(), Block.getHalfBlockSize() * 2, Block.getHalfBlockSize() * 2);
            rectangle.x = this.location.x - Block.getHalfBlockSize();
            rectangle.y = this.location.y - Block.getHalfBlockSize();
            Universe.renderingLayer.addChild(rectangle);
            Universe.renderingLayer.update();
        }
    };
    Block.getHalfBlockSize = function () {
        return 5;
    };
    return Block;
}());
var Entity = (function () {
    function Entity(blocks, location) {
        this.blocks = blocks;
        this.location = location;
        this.alive = true;
        this.age = 0;
    }
    Entity.prototype.addBlock = function (block) {
        this.blocks.push(block);
    };
    Entity.prototype.getLifeExpectancy = function () {
        return 15 - this.blocks.length;
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
    Entity.prototype.stepForward = function (sequence) {
        this.age++;
        if (this.getLifeExpectancy() - this.age < 0) {
            this.alive = false;
            return;
        }
        else {
            this.location = new Loc(Math.floor(Math.random() * 500), Math.floor(Math.random() * 200));
            this.render();
        }
    };
    Entity.prototype.render = function () {
        if (Universe.readyForRender()) {
            Enumerable.From(this.blocks).ForEach("$.render()");
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
        var comparison = Entity.getEntityComparison(entity1, entity2);
        var newEntity = new Entity(comparison.intersection, new Loc(entity1.location.x, entity2.location.y));
        Enumerable.From(comparison.unique).ForEach(function (x) { if (Math.floor(Math.random() * 2) == 1)
            newEntity.addBlock(x); });
        return newEntity;
    };
    return Entity;
}());
var Universe = (function () {
    function Universe(canvasWidth, canvasHeight, canvasElementName) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        var stage = new createjs.Stage(canvasElementName);
        Universe.timer = new TimeKeeper();
        Universe.updateRenderingLayer(stage);
        Universe.entities = [];
    }
    Universe.updateRenderingLayer = function (renderingLayer) {
        this.renderingLayer = renderingLayer;
    };
    Universe.clearRenderingLayer = function () {
        this.renderingLayer.clear();
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
        Universe.timer.listeners.push(entity);
    };
    return Universe;
}());
var TimeKeeper = (function () {
    function TimeKeeper() {
        var _this = this;
        this.myCallback = function () {
            Enumerable.From(_this.listeners).ForEach(function (x) { x.stepForward(_this.counter); });
            _this.counter++;
        };
        this.listeners = [];
        this.counter = 0;
        this.intervalID = window.setInterval(this.myCallback, 1000);
    }
    return TimeKeeper;
}());
