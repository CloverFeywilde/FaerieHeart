/**
 * per-pixel sprite interaction
 */
 var hunbun = "bunny";
 
 var state, bunny;
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
    var square = new PIXI.Sprite(PIXI.Texture.WHITE);
    app.stage.addChild(square);
    square.width = square.height = 30;
    square.position.set(app.renderer.width/4, app.renderer.height / 2);

    bunny = new PIXI.Sprite(app.loader.resources.bunny.texture);
 
    // Center the sprite's anchor point
    bunny.anchor.set(0.5);
 
    // Move the sprite to the center of the screen
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;
 
    bunny.scale.set(5);
 
    app.stage.addChild(bunny);
 
    bunny.interactive = true;
 
    bunny.on('mousemove', (event) => {
        //var color = bunny.getColorByPoint(new PIXI.Point(0, 0));
        var color = bunny.getColorByPoint(event.data.global);
        console.log(color);

        // IT IS NOT THE SAME AS `PIXI.utils.rgb2hex`, rgb2hex accepts range ffrom 0.0 to 1.0, this from 0 to 255!
        square.tint = (color[0] << 16 ) | (color[1] << 8) | color[2];
    });
     
    //Keybinds and ticker
    bunny.vx = 0;
    bunny.vy = 0;
    bindKeys(); 
    state = play

    app.ticker.add(function(delta){
        gameLoop(delta);  
    });
}

//Game Loop
function gameLoop(delta){
    state(delta);
}


function play(delta){
    bunny.position.x += bunny.vx;
    bunny.position.y += bunny.vy;

}



//Hitmap and color picker functions
const tempPoint = new PIXI.Point();
PIXI.Sprite.prototype.getColorByPoint = function(point) {
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
        return [0, 0, 0, 0];
    }
 
    // bitmap check
 
    const tex = this.texture;
    const baseTex = this.texture.baseTexture;
    if (!baseTex.colormap) {
        if (!genColorMap(baseTex)) {
            return [0, 0, 0,];
        }
    }
 
    const colormap = baseTex.colormap;
    const data = colormap.data;
    const res = baseTex.resolution;
    // this does not account for rotation yet!!!
    let dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
    let dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
    let num = dx  + dy * colormap.width;
    return [data[num*4], data[num*4 + 1], data[num*4 + 2], data[num*4 + 3]];
}
 
function genColorMap(baseTex) {
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
    baseTex.colormap = context.getImageData(0, 0, w, h);
    return true;
}



