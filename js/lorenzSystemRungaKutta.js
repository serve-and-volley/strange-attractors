window.addEventListener('load', function() {
  var screen_canvas = document.getElementById('canvas');
  var renderer = new Pre3d.Renderer(screen_canvas);

  renderer.ctx.lineWidth = 0.3;

  var t;
  
  // Step size
  var h = 0.01;
  
  // The initial conditions
  var x = 1;
  var y = 0;
  var z = 0;

  // The parameters
  var sigma = 10.0;
  var rho = 28.0;
  var beta = 8.0/3.0;

  // The Lorenz system
  function fx(t, x) {
    dxdt = sigma * (y - x);
    return dxdt;
  }
  function fy(t, y) {
    dydt = x * (rho - z) - y;
    return dydt;
  }
  function fz(t, z) {
    dzdt = x*y - beta*z;
    return dzdt;
  }

  function step() {
    // The Runge-Kutta 4th order method
    k1 = h * fx(t, x);
    k2 = h * fx(t + 0.5*h, x + 0.5*k1);
    k3 = h * fx(t + 0.5*h, x + 0.5*k2);
    k4 = h * fx(t + h, x + k3);
    xn = (1.0/6.0)*(k1 + 2*k2 + 2*k3 + k4);

    k1 = h * fy(t, y);
    k2 = h * fy(t + 0.5*h, y + 0.5*k1);
    k3 = h * fy(t + 0.5*h, y + 0.5*k2);
    k4 = h * fy(t + h, y + k3);
    yn = (1.0/6.0)*(k1 + 2*k2 + 2*k3 + k4);

    k1 = h * fz(t, y);
    k2 = h * fz(t + 0.5*h, z + 0.5*k1);
    k3 = h * fz(t + 0.5*h, z + 0.5*k2);
    k4 = h * fz(t + h, z + k3);
    zn = (1.0/6.0)*(k1 + 2*k2 + 2*k3 + k4);

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