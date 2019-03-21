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

        // var sprite = cc.Sprite.create("Textures/ointer.png");
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
    },
    update:function(dt) {
        // console.log('logggg');
        var children = this.getChildren();
        var testObjs = new Array();
        var particles = new Array();
        for (let index in children) {
            var child = children[index];
            if (child.isClass("BaseSprite")) {
                child.run();
                testObjs.push(child);
            } else if (child.isClass("LazerParticle")) {
                particles.push(child);
            }
        }
        for (let pIndex in particles) {
            var parti = particles[pIndex];
            parti.testWithObjects(testObjs);
        }
    },
});


// base sprite
var BaseSprite = cc.Sprite.extend({
    _className:"BaseSprite",
    _typeName:"NormalType",
    ctor:function(fileName, rect) {
        if (fileName == undefined) {
            fileName = "Textures/Empty.png";
        } 
        if (rect == undefined) {
            rect = cc.rect(OBJ_BLOCK_RECT);
        }
        this._super(fileName, rect);
        // this.setScale(0.5);
        // this.setRectInPixel:()
    },
    run:function() {

    },
    crash:function() {

    },
    getSize:function() {
        return cc.size(OBJ_BLOCK_SIZE);
    },
    getRect:function() {
        let size = this.getSize();
        let center = this.getPosition();
        return cc.rect(center.x - size.width / 2, center.y - size.height / 2, size.width, size.height);
    },
    // 用弧度，逆时针，符合小学数学
    setRotation:function(rotation) {
        this._super(-rotation * 180.0 / M_PI);
    },
    getRotation:function() {
        var angle = this._super();
        return -angle * M_PI / 180.0;
    },
    getClassName:function() {
        return this._className;
    },
    isClass:function(className) {
        return (this.getClassName() == className);
    },
    getTypeName:function() {
        return this._typeName;
    },
    isType:function(typeName) {
        return (this.getTypeName() == typeName);
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
            this.setRotation(M_PI / 2);
        }
        this.myType = type;
        this.myFacing = facing;
    },
    run:function() {

    }
});

var BaseReflector = BaseSprite.extend({
    _typeName:"ReflectorType",
    _reflectorType:"BaseReflector",
    getRealZRotation:function() {
        return this.getRotation();
    },
    getReflectorType:function() {
        return this._reflectorType;
    },
    getNewLineWithOldLine:function(oldLine) {
        return oldLine;
        var selfRealRotation = this.getRealZRotation();
        var selfLine = zz.line(this.getPosition().x, this.getPosition().y, selfRealRotation);
        var intersectionPoint = zz.pointIntersectionFromLines(oldLine, selfLine);
        if (!cc.rectContainsPoint(this.getRect(), intersectionPoint)) {
            return oldLine;
        }

        var reflectedZRotation = (selfRealRotation - oldLine.alpha) + selfRealRotation;
        return zz.line(intersectionPoint.x, intersectionPoint.y, reflectedZRotation);
    },
});

var NormalReflector = BaseReflector.extend({
    _reflectorType:"NormalReflector",
    ctor:function(facing) {
        this._super("Textures/NormalReflector.png");
        var rota = 0;
        if (facing == DirectionFacing.QuadrantTwo) {
            rota = M_PI / 2;
        } else if (facing == DirectionFacing.QuadrantThree) {
            rota = M_PI;
        } else if (facing == DirectionFacing.QuadrantFour) {
            rota = -M_PI / 2;
        }
        this.setRotation(rota);
    },
    getRealZRotation:function() {
        return self.getRotation() - (M_PI / 4);
    },
    // isPointInDarkSide

});

var ManualReflector = BaseReflector.extend({
    _reflectorType:"ManualReflector",
    ctor:function(facing) {
        this._super("Textures/ManualReflector.png");
        var rota = 0;
        if (facing == DirectionFacing.Angle90) {
            rota = M_PI / 2;
        } else if (facing == DirectionFacing.Angle135) {
            rota = (M_PI / 2) + (M_PI / 4);
        } else if (facing == DirectionFacing.Angle45) {
            rota = M_PI / 4;
        }
        this.setRotation(rota);
    }
});

var AutoReflector = BaseReflector.extend({
    backgroundSpr:null,
    shooterSpr:null,
    _reflectorType:"AutoReflector",
    ctor:function() {
        this._super("Textures/AutoReflectorShooter.png");
        this.backgroundSpr = new BaseSprite("Textures/AutoReflector.png");
        this.addChild(this.backgroundSpr, -1);
        this.backgroundSpr.setPosition(this.getSize().width /2, this.getSize().height / 2);
        // this.shooterSpr = new BaseSprite("Textures/AutoReflectorShooter.png");
        // this.addChild(this.shooterSpr, 1);
        // this.shooterSpr.setPosition(this.getSize().width / 2, this.getSize().height / 2);
        this.schedule(function() {
            this.setRotation(this.getRotation() + (M_PI / 4));
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

// lazers
var LazerSource = BaseSprite.extend({
    disabled:0,
    ctor:function(facing, disabled) {
        this._super("Textures/LazerSource.png");
        this.disabled = disabled;
        var rotation = 0;
        if (facing == DirectionFacing.Up) {
            rotation = M_PI / 2;
        } else if (facing == DirectionFacing.Left) {
            rotation = M_PI;
        } else if (facing == DirectionFacing.Down) {
            rotation = -M_PI / 2;
        }
        this.setRotation(rotation);

        if (!disabled) {
            var shooterSpr = new BaseSprite("Textures/LazerSourceShooter.png");
            shooterSpr.setPosition(this.getSize().width, this.getSize().height / 2);
            this.addChild(shooterSpr);
        }
    },
    run:function() {
        // shoot a LazerParticle
        if (this.disabled == 0) {
            var particle = new LazerParticle(this.getRotation());
            var originPo = this.getPosition();
            var newPosi = zz.pointOffset(originPo, this.getSize().width / 2 + 10, 0);
            var rotatedPosi = zz.pointRotatePoint(newPosi, originPo, this.getRotation());
            particle.setPosition(rotatedPosi);
            this.getParent().addChild(particle, 100);
        }
    }
});

var LazerParticle = cc.Node.extend({
    _className:"LazerParticle",
    _drawed:false,
    _realZRotation:0,
    ctor:function(zRotation) {
        this._super();
        this._realZRotation = zRotation;
    },
    getClassName:function() {
        return this._className;
    },
    isClass:function(className) {
        return (this.getClassName() == className);
    },
    testWithObjects:function(objects) { 
        if (this._drawed) {
            this.removeFromParent();
            // console.log("remove:" + this);
            return;
        }
        this._drawed = true;
        // console.log("test:" + this);
        // do logic

        var parentSize = cc.director.getWinSize();
        var parentRect = cc.rect(0, 0, parentSize.width, parentSize.height);

        var lastLine = zz.line(this.getPosition().x, this.getPosition().y, this._realZRotation);
        var lastHitSpr = null;

        var ended = false;
        var testTime = 0;
        while(!ended) {
            testTime ++;
            if (testTime > 100) {
                ended = true;
                break;
            }
            var testMinDistance = 100000;
            var thisHitPoint = zz.pointNotFound();
            var thisHitSpr = null;
            var reflectedLine = zz.line(0, 0, 0);
            var isReflected = false;
            for (let index in objects) {
                var tSpr = objects[index];
                if (tSpr === lastHitSpr) {
                    continue;
                }
                var testRect = tSpr.getRect();
                var testHitPoint = zz.pointIntersectionFromRectToLine(testRect, lastLine);
                var testWillBeReflected = false;
                var testReflectedLine = zz.line(0, 0, 0);
                if (!cc.pointEqualToPoint(testHitPoint, zz.pointNotFound())) {
                    if (tSpr.isType("ReflectorType")) {
                        // baljblaklkf
                        testWillBeReflected = true;
                        var willNotHitNotReflectingFace = false; // check false face
                        if (willNotHitNotReflectingFace) {
                            testWillBeReflected = false;
                        } else {
                            testReflectedLine = tSpr.getNewLineWithOldLine(lastLine);
                            if (zz.lineEqualToLine(testReflectedLine, lastLine)) {
                                continue;
                            }
                            if (tSpr.getReflectorType() == "AutoReflector") {

                            } else {
                                testHitPoint = cc.p(testReflectedLine.x, testReflectedLine.y);
                            }
                        }
                    } 
                    var thisDistance = zz.distanceFromPoints(cc.p(lastLine.x, lastLine.y), testHitPoint);
                    if (thisDistance < testMinDistance) { // 取最近的一个作为这一轮的结果
                        testMinDistance = thisDistance;
                        thisHitPoint = testHitPoint;
                        thisHitSpr = tSpr;
                        reflectedLine = testReflectedLine;
                        isReflected = testWillBeReflected;
                    }
                }
            }
            if (thisHitSpr == null) {
                thisHitPoint = zz.pointIntersectionFromRectToLine(parentRect, lastLine);
            }
            this.drawLazerFromPoint(cc.p(lastLine.x, lastLine.y), thisHitPoint);
            lastHitSpr = thisHitSpr;
            if (isReflected) {
                lastLine = reflectedLine;
            } else {
                 // if packet
                 ended = true;
                 this.drawSparkAtPoint(thisHitPoint, lastLine);
                 // turn red if need
            }
        }
    },
    drawLazerFromPoint:function(fromPoint, toPoint) {
        var fp = zz.pointOffset(fromPoint, -this.getPosition().x, -this.getPosition().y);
        var tp = zz.pointOffset(toPoint, -this.getPosition().x, -this.getPosition().y);
        var center = zz.centerFromPoints(fp, tp);
        var distance = zz.distanceFromPoints(fp, tp);
        var zRotation = atan2(fp.y - tp.y, fp.x - tp.x);

        var lazer = new BaseSprite("Textures/LazerParticle.png");
        lazer.setRotation(zRotation);
        lazer.setPosition(center);
        lazer.setScaleX(distance / OBJ_BLOCK_WIDTH);
        lazer.setScaleY(0.4);
        this.addChild(lazer);
    },
    drawSparkAtPoint:function(atPoint, fromLine) {

    },
    test:function() {
        var pointer = new BaseSprite("Textures/LazerParticle.png");
        pointer.setRotation(this._realZRotation);
        pointer.setPosition(zz.pointRotateVector(cc.p(OBJ_BLOCK_WIDTH / 2, 0), this._realZRotation));
        pointer.setScaleX(1);
        pointer.setScaleY(0.4);
        this.addChild(pointer);

        var pointer2 = new BaseSprite("Textures/LazerSpark.png");
        pointer2.setRotation(this._realZRotation + cc.randomMinus1To1() * M_PI * 0.1);
        pointer2.setPosition(zz.pointRotateVector(cc.p(64, 0), this._realZRotation));
        pointer2.setScaleY(cc.randomMinus1To1() > 0 ? 1 : -1);
        this.addChild(pointer2);
    },
});