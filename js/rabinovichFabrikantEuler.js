// (c) Dean McNamee <dean@gmail.com>.  All rights reserved.

// Inspired by http://www.unitzeroone.com/labs/alchemyPushingPixels/
// Also reading 'Strange Attractors: Creating Patterns in Chaos'.
// This attractor is Lorenz-84, with parameters from chaoscope.

window.addEventListener('load', function() {
  var screen_canvas = document.getElementById('canvas');
  var renderer = new Pre3d.Renderer(screen_canvas);

  renderer.ctx.lineWidth = 0.5;

  var t;

  // Step size
  var h = 0.001;

  // Initial conditions
  var x = -1.05;
  var y = 0.9;
  var z = 1.01;

  // Parameters
  var alpha = 1.1;
  var gamma =0.87;

  // The Rabinovich-Fabrikant system
  function fx(t, x) {
    dxdt = y*(z - 1 + x*x) + gamma*x;
    return dxdt;
  }

  function fy(t, y) {
    dydt = x*(3*z + 1 - x*x) + gamma*y;
    return dydt;
  }

  function fz(t, z) {
    dzdt = -2*z*(alpha + x*y);
    return dzdt;
  }

  function step() {
    // Euler method
    xn = h * fx(t, x);
    yn = h * fy(t, y);
    zn = h * fz(t, y);

    x += xn;
    y += yn;
    z += zn;

    return {x: x, y: y, z: z};
  }

  var N = 50000;
  var path = new Pre3d.Path();
  path.points = new Array(N * 2 + 1);
  path.curves = new Array(N);

  // Warm up a bit so we don't get a cast from the origin into the attractor.
  for (var i = 0; i < 10; ++i)
    step();

  // Setup our initial point, |p0| will track our previous end point.
  var p0 = step();
  path.points[path.points.length - 1] = p0;
  path.starting_point = path.points.length - 1;

  for (var i = 0; i < N; ++i) {
    path.curves[i] = new Pre3d.Curve(i * 2, i * 2 + 1, null);  // Quadratic.

    var p1 = step();
    var p2 = step();
    path.points[i * 2 + 1] = Pre3d.PathUtils.fitQuadraticToPoints(p0, p1, p2);
    path.points[i * 2] = p2;
    p0 = p2;
  }

  var colormap = [
    {n: 'r', c: new Pre3d.RGBA(1, 0, 0, 1)},
    {n: 'g', c: new Pre3d.RGBA(0, 1, 0, 1)},
    {n: 'b', c: new Pre3d.RGBA(0, 0, 1, 1)},
    {n: 'a', c: new Pre3d.RGBA(0, 1, 1, 1)},
    {n: 'y', c: new Pre3d.RGBA(1, 1, 0, 1)},
    {n: 'w', c: new Pre3d.RGBA(1, 1, 1, 1)}
  ];

  var fgcolor = new Pre3d.RGBA(0, 0, 1, 1);

  function draw() {
    renderer.ctx.setFillColor(0, 0, 0, 1);
    renderer.drawBackground();

    renderer.ctx.setStrokeColor(fgcolor.r, fgcolor.g, fgcolor.b, fgcolor.a);
    renderer.drawPath(path);
  }

  renderer.camera.focal_length = 2.5;
  DemoUtils.autoCamera(renderer, 0, -1, -100, 0, -2.5, 0.5, draw);

  draw();
}, false);