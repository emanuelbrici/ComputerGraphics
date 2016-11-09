/**
 * Created by emanuel on 10/18/16.
 */

function x(a, b, p, q , t){
    return ((a + b * Math.cos(q * t))*Math.cos(p * t));
}

function y(a, b, p, q , t){
    return ((a + b * Math.cos(q * t))*Math.sin(p * t));
}

function z(b, q, t){

    return b * Math.sin(q * t);
}

function dx(a, b, p, q , t){
    return -p * y(a, b , p, q, t) - b * q * Math.sin(q * t)*Math.cos(p * t);
}

function dy(a, b, p, q , t){
    return p * x(a, b, q, p, t) - b * q * Math.sin(q * t) * Math.sin(p * t);
}

function dz(b, q, t){
    return b * q * Math.cos(q * t);
}

function ddx(a, b, p, q , t){
    return -p * dy(a, b, p, q, t) + b * q * (p * Math.sin(q * t) * Math.sin(p * t) - q * Math.cos(q * t) * Math.cos(p * t));
}

function ddy(a, b, p, q , t){
    return p * dx(a, b, p, q, t) - b * q * (p * Math.sin(q * t) * Math.cos(p * t) + q * Math.cos(q * t) * Math.sin(p * t));
}

function ddz(b, q, t){
    return -(Math.pow(q, 2)) * b * Math.sin(q * t);
}

var tube = {
    N : 500,     //number of spine samples
    M : 100,      //number of samples in tube cross sections
    b : 1.5,    //small radius
    a : 4.5,    //large radius
    R : .8,     //tube radius
    p : 2,      //number of winds around the origin
    q : 9,     //number of coils
    verts : null,
    normals : null,

    createGeometry : function() {
        var N = this.N;
        var M = this.M;
        var b = this.b;
        var a = this.a;
        var R = this.R;
        var p = this.p;
        var q = this.q;
        this.verts = new Float32Array((N + 1) * (M + 1) * 3);
        this.normals = new Float32Array((N + 1) * (M + 1) * 3);
        var n = 0;
        var dt = 2 * Math.PI / N, du = 2 * Math.PI / M;
        for (var i = 0, t = 0.0; i <= N; i++, t += dt) {
            if (i == N) t == 0.0; // wrap around
            var C = [x(a, b, p, q, t), y(a, b, p, q, t), z(b, q, t)];
            var T = [dx(a, b, p, q, t), dy(a, b, p, q, t), dz(b, q, t)];
            var A = [ddx(a, b, p, q, t), ddy(a, b, p, q, t), ddz(b, q, t)];
            var B = cross3(T, A);
            norm3(T);
            norm3(B);
            var N_ = cross3(B, T);
            for (var j = 0, u = 0.0; j <= M; j++, u += du) {
                if (j == M) u = 0.0; // wrap around
                var cosu = Math.cos(u), sinu = Math.sin(u);
                for (var k = 0; k < 3; k++) {
                    this.normals[n] = cosu * N_[k] + sinu * B[k];
                    this.verts[n] = C[k] + R * this.normals[n];
                    n++;
                }
            }
        }
    },

    triangleStrip: null,

    createTriangleStrip : function() {
        var M = this.M, N = this.N;
        var numIndices = N*(M+1)*2 + 2*N;
        if (!this.triangleStrip || this.triangleStrip.length != numIndices)
            this.triangleStrip = new Uint16Array(numIndices);
        var index = function(i, j) {
            return i*(M+1) + j;
        }
        var n = 0;
        for (var i = 0; i < N; i++) {
            if (i > 0)  // degenerate connecting index
                this.triangleStrip[n++] = index(i,0);
            for (var j = 0; j <= M; j++) {
                this.triangleStrip[n++] = index(i+1,j);
                this.triangleStrip[n++] = index(i,j);
            }
            if (i < N-1) // degenerate connecting index
                this.triangleStrip[n++] = index(i,M)
        }
    },

    /*      USED FOR MESH
    wireframe : null, // Uint16Array  (line indices)
    createWireFrame : function() {
        var lines = [];
        lines.push(this.triangleStrip[0], this.triangleStrip[1]);
        var numStripIndices = this.triangleStrip.length;
        for (var i = 2; i < numStripIndices; i++) {
            var a = this.triangleStrip[i-2];
            var b = this.triangleStrip[i-1];
            var c = this.triangleStrip[i];
            if (a != b && b != c && c != a)
                lines.push(a, c, b, c);
        }
        this.wireframe = new Uint16Array(lines);
    }
    */
};
