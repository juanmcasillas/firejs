//
// this does the trick
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// and this have some history inside
// https://www.hanshq.net/fire.html
//

window.requestAnimFrame = (function () {
    // 60 frames per second.
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || window.oRequestAnimationFrame || 
           window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    objects = [];

// image and canvas vars
var imgToDraw = null,
    imageCanvas = null,
    iCtx = null,
    imageData = null,
    imagePixData = null,
    imgWidth = null,
    imgHeight = null;

// store our canvas width and height for faster access
var width = 320,
    height = 200;

var dataArray = Array(width).fill().map(() => Array(height).fill(0));


var color_pallete = { };

function map_color(c) {

    //if (!(c in color_pallete)) {
    //    alert(c);
    //}

    var col = color_pallete[c];

    return { r: col[0],
             g: col[1],  
             b: col[2],
             a: col[3] };
}

function getXY(x, y, width, data) {
    var ri = y * (width * 4) + x * 4,
        gi = ri + 1,
        bi = ri + 2,
        ai = ri + 3;

        return { r: data[ri], g: data[gi], b: data[bi], a: data[ai] };
}

function setXY(x, y, width, data, value) {
    var ri = y * (width * 4) + x * 4,
        gi = ri + 1,
        bi = ri + 2,
        ai = ri + 3;

        data[ri] = value.r;
        data[gi] = value.g;
        data[bi] = value.b;
        data[ai] = value.a;
}

function do_fire() {
    for (var j = 1; j < height-1; j++) {
        for (var i = 1; i < width-1; i++) {    
            var v = dataArray[i][j+1]*2 +
                    dataArray[i-1][j] + 
                    dataArray[i+1][j];
                v = Math.floor(v / 4);
                
                v = (v > 63 ? 63 : v);
                v = (v < 0  ?  0 : v);

                if (v > 20) {
                    v = getRandomInt(v-5, v+5);
                    v = (v > 63 ? 63 : v);
                    v = (v < 0  ?  0 : v);
                }   
                dataArray[i][j] = v;
        }
    }
}


function add_fuel() {
    for (var i = 0; i < width; i++) {
        dataArray[i][height-1] = getRandomInt(30,64-1);
    }
}

function draw() {
    // create new Image data
    var canvasData = ctx.createImageData(canvas.width, canvas.height),
    // get the pixel data

    cData = canvasData.data;
    
    do_fire();
    add_fuel();

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {

           var ci = dataArray[i][j];

           c = map_color(ci);
           setXY(i,j, width, cData, c);
        }
    }
    // now put all of that image data we just wrote onto the actual canvas.
    ctx.putImageData(canvasData, 0, 0);

    // comment this for disable the zoom

    var zoomctx = document.getElementById('zoom').getContext('2d');
    zoomctx.imageSmoothingEnabled = zoomctx.mozImageSmoothingEnabled = zoomctx.webkitImageSmoothingEnabled =
    zoomctx.msImageSmoothingEnabled = true;
    zoomctx.drawImage(canvas,0, 0, width, height, 0, 0, width*2, height*2);

    // loop the animation
    window.requestAnimFrame(draw);


}

//
// how to implement the old school fire.
// 0) create a nice pallete with gradient, from 0 to 64 (max heat)
// 1) add the Seed at the bottom of the screen
// 2) convolute the values using some median
// 3) repeat
//

// init pallete

for (var i=0; i<16; i++) {
    // 16 colors x 4 = 64 colors
    color_pallete[i]    = [i*4     ,    0,     0, 255];
    color_pallete[i+16] = [(i+16)*4,    0,     0, 255];
    color_pallete[i+32] = [     128, (i*8),    0, 255];
    color_pallete[i+48] = [     128,  128, (i*8), 255];
}

// init grid

add_fuel();
draw();
