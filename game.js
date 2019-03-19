var DirectionFacing = {
    Right : 0,
    Up : 1,
    Left : 2,
    Down : 3,

    QuadrantOne : 1,
    QuadrantTwo : 2,
    QuadrantThree : 3,
    QuadrantFour : 4,

    Angle00 : 0,
    Angle45 : 1,
    Angle90 : 2,
    Angle135 : 3
};

var OBJ_BLOCK_WIDTH = 64.0;
var OBJ_BLOCK_SIZE = new cc.size(OBJ_BLOCK_WIDTH, OBJ_BLOCK_WIDTH);
var OBJ_BLOCK_RECT = new cc.rect(0, 0, OBJ_BLOCK_WIDTH, OBJ_BLOCK_WIDTH);

window.onload = function(){
    cc.game.onStart = function(){
        //load resources
        cc.LoaderScene.preload([], function () {
            var MyScene = cc.Scene.extend({
                onEnter:function () {
                    this._super();
                    var gl = new GameLayer();
                    this.addChild(gl, 1);
                    // this.sheduleUpdate(gl);
                }
                
            });
            cc.director.runScene(new MyScene());
        }, this);
    };
    cc.game.run("gameCanvas");
};

var GameLayer = cc.LayerColor.extend({
    ctor:function() {
        this._super(cc.color(0, 40, 45, 255));
        // var size = cc.director.getWinSize();

        // var sprite = cc.Sprite.create("Textures/Pointer.png");
        // sprite.setPosition(size.width / 2, size.height / 2);
        // // sprite.setScale(1);
        // this.addChild(sprite, 0);

        // var label = cc.LabelTTF.create("Hello World", "Arial", 40);
        // label.setColor(0,0,0);
        // label.setPosition(size.width / 2, size.height / 2);
        // this.addChild(label, 1);
        this.loadObjectsFromFile();
        this.scheduleUpdate();
    },
    update:function(dt) {
        // console.log('logggg');
    },
    loadObjectsFromFile:function() {
        var myLayer = this;
        var req = new XMLHttpRequest();
        req.open("GET", "Configs/mission10.json", true);
        req.send(null);
        req.onreadystatechange = function(){
            if(req.readyState == 4 && req.status == 200){
                var text = req.responseText;
                var array = JSON.parse(text);

                for(let index in array) {
                    var obj = array[index];
                    var dict = obj;
                    var name = dict.name;
                    var x = dict.x | 0;
                    var y = dict.y | 0;
                    var face = dict.face | 0;
                    var type = dict.type | 0;
                    var disabled = dict.disabled | 0;
                    var realX = OBJ_BLOCK_WIDTH / 2 + x * OBJ_BLOCK_WIDTH;
                    var realY = OBJ_BLOCK_WIDTH / 2 + y * OBJ_BLOCK_WIDTH;
                    // var position = 

                    var spr = null;
                    if (name == "LazerSource") {
                        spr = new LazerSource(face, disabled);
                    } else if (name == "NormalBlock") {
                        spr = new NormalBlock(face, type);
                    } else if (name == "NormalReflector") {
                        spr = new NormalReflector(face);
                    } else if (name == "ManualReflector") {
                        spr = new ManualReflector(face);
                    } else if (name == "AutoReflector") {
                        spr = new AutoReflector();
                    } else if (name == "DataPacket") {
                        spr = new DataPacket();
                    } else if (name == "FirePacket") {
                        spr = new FirePacket();
                    }

                    if (spr != null) {
                        console.log("loaded:" + name);  
                        spr.setPosition(realX, realY);
                        myLayer.addChild(spr);
                    }
                }
            }
        };
    }
});


// base sprite
var BaseSprite = cc.Sprite.extend({
    ctor:function(fileName) {
        if (fileName == undefined) {
            fileName = "Textures/Empty.png";
        }
        this._super(fileName, new cc.rect(OBJ_BLOCK_RECT));
        // this.setScale(0.5);
        // this.setRectInPixel:()
    },
    run:function() {

    },
    crash:function() {

    },
    getContentSize() {
        return cc.size(OBJ_BLOCK_SIZE);
    },
    // 用弧度，逆时针，符合小学数学
    setRotation:function(rotation) {
        this._super(-rotation * 180.0 / Math.PI);
    },
    getRotation:function() {
        var angle = this._super();
        return -angle * Math.PI / 180.0;
    }
    // addChild:function(child) {

    // }
});

var LazerSource = BaseSprite.extend({
    disabled:0,
    ctor:function(facing, disabled) {
        this._super("Textures/LazerSource.png");
        this.disabled = disabled;
        var rotation = 0;
        if (facing == DirectionFacing.Up) {
            rotation = Math.PI / 2;
        } else if (facing == DirectionFacing.Left) {
            rotation = Math.PI;
        } else if (facing == DirectionFacing.Down) {
            rotation = -Math.PI / 2;
        }
        this.setRotation(rotation);

        if (!disabled) {
            var shooterSpr = new BaseSprite("Textures/LazerSourceShooter.png");
            shooterSpr.setPosition(this.getContentSize().width, this.getContentSize().height / 2);
            this.addChild(shooterSpr);
        }
    }
});

var BlockType = {
    Chip:0,
    Resistance:1
};

var NormalBlock = BaseSprite.extend({
    changedTexture:false,
    myType:0,
    myFacing:0,
    ctor:function(facing, type) {
        if (type == BlockType.Chip) {
            this._super("Textures/NormalBlockChip.png");
        } else {
            this._super("Textures/NormalBlockResistance.png");
        }
        if (facing != DirectionFacing.Up && facing != DirectionFacing.Right) {
            facing = DirectionFacing.Right;
        }
        if (facing == DirectionFacing.Up) {
            this.setRotation(Math.PI / 2);
        }
        this.myType = type;
        this.myFacing = facing;
    },
    run:function() {

    }
});

var BaseReflector = BaseSprite.extend({
    getRealZRotation:function() {
        return this.getRotation();
    }
});

var NormalReflector = BaseReflector.extend({
    ctor:function(facing) {
        this._super("Textures/NormalReflector.png");
        var rota = 0;
        if (facing == DirectionFacing.QuadrantTwo) {
            rota = Math.PI / 2;
        } else if (facing == DirectionFacing.QuadrantThree) {
            rota = Math.PI;
        } else if (facing == DirectionFacing.QuadrantFour) {
            rota = -Math.PI / 2;
        }
        this.setRotation(rota);
    },
    getRealZRotation:function() {
        return self.getRotation() - (Math.PI / 4);
    }
});

var ManualReflector = BaseReflector.extend({
    ctor:function(facing) {
        this._super("Textures/ManualReflector.png");
        var rota = 0;
        if (facing == DirectionFacing.Angle90) {
            rota = Math.PI / 2;
        } else if (facing == DirectionFacing.Angle135) {
            rota = (Math.PI / 2) + (Math.PI / 4);
        } else if (facing == DirectionFacing.Angle45) {
            rota = Math.PI / 4;
        }
        this.setRotation(rota);
    }
});

var AutoReflector = BaseReflector.extend({
    backgroundSpr:null,
    shooterSpr:null,
    ctor:function() {
        this._super();
        this.backgroundSpr = new BaseSprite("Textures/AutoReflector.png");
        this.addChild(this.backgroundSpr);
        this.backgroundSpr.setPosition(this.getContentSize().width /2, this.getContentSize().height / 2);
        this.shooterSpr = new BaseSprite("Textures/AutoReflectorShooter.png");
        this.addChild(this.shooterSpr, 1);
        this.shooterSpr.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
        this.schedule(function() {
            this.setRotation(this.getRotation() + (Math.PI / 4));
        }, 0.8);
    },
    setRotation:function(rotation) {
        this._super(rotation);
        this.backgroundSpr.setRotation(-rotation);
    }
});

var BasePacket = BaseSprite.extend({

});

var DataPacket = BasePacket.extend({
    ctor:function() {
        this._super("Textures/DataPacket.png");
    }
});

var FirePacket = BasePacket.extend({
    ctor:function() {
        this._super("Textures/FirePacket.png");
    }
});