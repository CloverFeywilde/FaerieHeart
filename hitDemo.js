/**
 * per-pixel sprite interaction
 */
var hunbun;
var bunny; 
// Create our application instance
var app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);
 
// Load the bunny texture
app.loader.add('bunny', 'https://pixijs.io/examples/examples/assets/bunny.png')
    .load(startup);
 
function startup()
{
    bunny = new PIXI.Sprite(app.loader.resources.bunny.texture);
 
    // Center the sprite's anchor point
    bunny.anchor.set(0.5);
 
    // Move the sprite to the center of the screen
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;
 
    bunny.scale.set(5);
 
    app.stage.addChild(bunny);
 
    bunny.interactive = true;
 
    bunny.on('mouseover', () => {
        bunny.tint = 0xff0000;
    });
 
    bunny.on('mouseout', () => {
        bunny.tint = 0xffffff;
    });
 
}
 
const tempPoint = new PIXI.Point();
PIXI.Sprite.prototype.containsPoint = function(point) {
    this.worldTransform.applyInverse(point, tempPoint);
 
    const width = this._texture.orig.width;
    const height = this._texture.orig.height;
    const x1 = -width * this.anchor.x;
    let y1 = 0;
 
    let flag = false;
 
    if (tempPoint.x >= x1 && tempPoint.x < x1 + width)
    {
        y1 = -height * this.anchor.y;
 
        if (tempPoint.y >= y1 && tempPoint.y < y1 + height)
        {
            flag = true;
        }
    }
 
    if (!flag) {
        return false;
    }
 
    // bitmap check
 
    const tex = this.texture;
    const baseTex = this.texture.baseTexture;
    if (!baseTex.hitmap) {
        if (!genHitMap(baseTex, 127)) {
            return true;
        }
    }
 
    const hitmap = baseTex.hitmap;
    const res = baseTex.resolution;
    // this does not account for rotation yet!!!
    let dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
    let dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
    let num = dx  + dy * baseTex.hitmapWidth;
    let num32 = num / 32 | 0;
    let numRest = num - num32 * 32;
    return (hitmap[num32] & (1<<numRest)) > 0;
}
 
function genHitMap(baseTex, threshold) {
    if (!baseTex.resource) {
        //renderTexture
        return false;
    }
    const imgSource = baseTex.resource.source;
    let canvas = null;
    if (!imgSource) {
        return false;
    }
    let context = null;
    if (imgSource.getContext) {
        canvas = imgSource;
        context = canvas.getContext('2d');
    } else if (imgSource instanceof Image) {
        canvas = document.createElement('canvas');
        canvas.width = imgSource.width;
        canvas.height = imgSource.height;
        context = canvas.getContext('2d');
        context.drawImage(imgSource, 0, 0);
    } else {
        //unknown source;
        return false;
    }
 
    const w = canvas.width, h = canvas.height;
    const imgData = context.getImageData(0, 0, w, h);
    const hitmap = new Uint32Array(Math.ceil(w*h / 32));
 
    for (let j=0;j<h;j++) {
        for (let i=0;i<w;i++) {
            const num = j * w + i;
            const num32 = num / 32 | 0;
            const numRest = num - num32*32;
 
            if (imgData.data[4 * num + 3] >= threshold) {
                hitmap[num32] |= (1<<numRest);
            }
        }
    }
    baseTex.hitmap = hitmap;
    baseTex.hitmapWidth = w;
    hunbun = baseTex;
    console.log('hunbun set!');
    return true;
}

var p1 = new PIXI.Point(980,482);
bunny.prototype.containsPoint(p1);

  
