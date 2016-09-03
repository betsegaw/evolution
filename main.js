/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />
function init() {
    testGraphics();
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
    return Block;
}());
var Entity = (function () {
    function Entity(blocks, location) {
        this.blocks = blocks;
        this.location = location;
    }
    Entity.prototype.addBlock = function (block) {
        this.blocks.push(block);
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
    Entity.prototype.getEntityIntersection = function (entity) {
    };
    return Entity;
}());
