/**
 * Created by Emanuel Brici on 9/12/16.
 */

function Polygon (verts) {
    this.polyArr = [];
    for(var i = 0; i < verts.length; i++) {
        var vertex = [];
        vertex.push(verts[i].x);
        vertex.push(verts[i].y);
        this.polyArr.push(vertex);
    }
}

function areaOfPolygon(array) {
    var A = 0;
    for(var i = 0; i < array.length; i++) {
        var first = array[i][0] * array[(i + 1 ) % array.length][1];
        var last = array[(i + 1) % array.length][0] * array[i][1];
        A += first - last;
    }
    A = A * .5;
    return A;
}

function determineP(vectorJ, triArray) {
    var d = 0;
    var first = true;
    for(var i = 0; i < 3; i++) {
        var uX = triArray[(i+1)%3][0] - triArray[i][0];
        var uY = triArray[(i+1)%3][1] - triArray[i][1];
        var wX = vectorJ[0] - triArray[i][0];
        var wY = vectorJ[1] - triArray[i][1];
        var z = (uX * wY) - (uY * wX);
        if(z !== 0) {
            if(first) {
                d = z;
                first = false;
            } else if((z * d) < 0){
                return false;
            }
        }
    }
    return true;
}

Polygon.prototype.triangulate = function () {
    if(this.polyArr.length < 3) {
        return [];
    }
    var result = areaOfPolygon(this.polyArr);
    var I = [this.polyArr.length];
    for(var i = 0; i < this.polyArr.length; i++) {
        I[i] = i;
    }
    var T = [];
    while(I.length > 3) {
        var a = 0.0;
        var n = 0;
        for(i = 1; i < I.length; i++) {
            var triArray = [];
            triArray.push(this.polyArr[I[(i - 1 + I.length) % I.length]]);
            triArray.push(this.polyArr[I[i]]);
            triArray.push(this.polyArr[I[(i + 1) % I.length]]);
            var triArea = areaOfPolygon(triArray);
            if((Math.abs(triArea) > a) && ((triArea * result) > 0)) {
                var ear = true;
                for(var j = 0; j < I.length; j++) {
                    if (I[j] !== I[(i - 1 + I.length) % I.length] &&
                        I[j] !== I[i] && I[j] !== I[(i + 1) % I.length] && ear) {
                        var vectorJ = this.polyArr[I[j]];
                        ear = !determineP(vectorJ, triArray);
                    }
                }
                if(ear) {
                    n = i;
                    a = Math.abs(triArea);
                }
            }
        }
        T.push(I[(n - 1 + I.length) % I.length]);
        T.push(I[n]);
        T.push(I[(n + 1) % I.length]);
        I.splice(n,1);
    }
    T.push(I[0]);
    T.push(I[1]);
    T.push(I[2]);
    return T;
};


var inputChunks = [];

process.stdin.on('data', function(chunk) {
    inputChunks.push(chunk);
});

process.stdin.on('end', function() {
    var inputJSON = inputChunks.join();
    var verts = JSON.parse(inputJSON);
    var poly = new Polygon(verts);
    var triangles = poly.triangulate();
    var result = {verts : verts, triangles : triangles};
    process.stdout.write(JSON.stringify(result, null, 4) + '\n');
});


