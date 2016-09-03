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
    };
    return Entity;
}());
