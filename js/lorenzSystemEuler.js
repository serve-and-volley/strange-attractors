window.addEventListener('load', function() {
  var screen_canvas = document.getElementById('canvas');
  var renderer = new Pre3d.Renderer(screen_canvas);

  renderer.ctx.lineWidth = 0.3;

  // Initial conditions
  var x = 1;
  var y = 0;
  var z = 0;

  // Step size
  var h = 0.01;

  // Parameters
  var sigma = 10.0;
  var r = 28.0;
  var b = 8/3;

  function step() {
    // The Lorenz system and the Euler method
    var xn = h*sigma*(y - x);
    var yn = h*(x*(r-z)-y);
    var zn = h*(x*y-b*z);

    x += xn;
    y += yn;
    z += zn;

    return {x: x, y: y, z: z};
  }

  // 10000 iterations
  var N = 10000;
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

  var fgcolor = new Pre3d.RGBA(1, 1, 0, 1);

  function draw() {
    renderer.ctx.setFillColor(0, 0, 0, 1);
    renderer.drawBackground();

    renderer.ctx.setStrokeColor(fgcolor.r, fgcolor.g, fgcolor.b, fgcolor.a);
    renderer.drawPath(path);
  }

  renderer.camera.focal_length = 2.5;
  DemoUtils.autoCamera(renderer, 0, 0, -150, -0.5, -1, 0, draw);

  draw();
}, false);