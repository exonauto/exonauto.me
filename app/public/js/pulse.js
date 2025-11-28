let c, ctx;

function init(){
    c = document.getElementById("pulseBG");
    console.log(c);
    ctx = c.getContext("2d");

    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    fill();
}

// dot width / height (padding, ig?);
let bw = 50;
let bh = 50;

var lastUpdate = Date.now();
function animateLoop (){
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;
    
    fill(dt);
}

setInterval(() => {
    animateLoop();
}, 16.7);

let blips = [ [0,0] ]

function fill(deltaTime){
    ctx.fillRect(0, 0, c.width, c.height);

    let w = window.innerWidth;
    let h = window.innerHeight;

    const gradient = ctx.createRadialGradient(110, 90, 30, 100, 100, 70);
    ctx.strokeStyle = gradient;

    for (let y = bh; y < h; y += bh) {
        for (let x = 0; x < w; x += bw) {
            let minDist = -1;
            let closest = [ -.11 , -.11 ];
            
            let offset = Math.sin(lastUpdate * 0.001);

            let xOffsetted = x + offset;
            let yOffsetted = y + offset;
            

            for (let i = 0; i < blips.length; i++) {
                let x2 = blips[i][0];
                let y2 = blips[i][1];
                
                let dist = getDist(x, x2, y, y2)

                if (minDist < dist) { 
                    minDist = dist;
                    closest[0] = x2;
                    closest[1] = y2;
                }
            }
            
            if (closest[0] !== -.11) {
                const gradient = ctx.createRadialGradient(xOffsetted, yOffsetted, 0, x, y, 70);
                gradient.addColorStop(0, "#588157");
                gradient.addColorStop(0.3, "#dad7cd");                                                                  
                gradient.addColorStop(1, "#588157");            
                ctx.strokeStyle = gradient;
            }

            
            if (minDist < 45) {
                ctx.beginPath();
                ctx.arc(xOffsetted, yOffsetted, minDist + ( 2 * ( 2 + Math.sin(lastUpdate * 0.01) ) ), 0, 2 * Math.PI);
                ctx.stroke();
            }

            let distSmoll = Math.round(minDist * 0.1);
            let color = LightenDarkenColor("#dad7cd", -distSmoll);
            if ( color == "#F" ) color = "red"
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(xOffsetted, yOffsetted, 1, 0, 2 * Math.PI);
            ctx.stroke();

        }
    }
}

function clamp(num, lower, upper) {
    return Math.min(Math.max(num, lower), upper);
}

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
    var eventDoc, doc, body;

    event = event || window.event;

    onmousemove = function(e){
        blips[0][0] = e.clientX 
        blips[0][1] = e.clientY
    }
}


function getDist(x1, x2, y1, y2){
    let dist = Math.sqrt( (x2 - x1)**2 + (y2-y1)**2 )
    return dist;
}

// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;
    
    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}


window.onload = init