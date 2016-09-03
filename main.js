/// <reference path="DefinitelyTyped\createjs\createjs.d.ts" />
/// <reference path="DefinitelyTyped\linq\linq.d.ts" />
function init() {
    testGraphics();
}
function testLinq() {
    var entity = new Entity([new Block(new Loc(0, 0)), new Block(new Loc(10, 10)), new Block(new Loc(20, 20)), new Block(new Loc(30, 30))]);
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
    function Entity(block) {
        this.block = block;
    }
    Entity.prototype.getBounds = function () {
        var width = Enumerable.From(this.block).Max("$.location.x") - Enumerable.From(this.block).Min("$.location.x");
        var height = Enumerable.From(this.block).Max("$.location.y") - Enumerable.From(this.block).Min("$.location.y");
        return new Bounds(width, height);
    };
    return Entity;
}());
