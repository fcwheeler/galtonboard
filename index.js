
(() => {
  // plugins
  Matter.use(MatterAttractors);

  // constants
  const PATHS = {
    DOME: '0 0 0 250 19 250 20 231.9 25.7 196.1 36.9 161.7 53.3 129.5 74.6 100.2 100.2 74.6 129.5 53.3 161.7 36.9 196.1 25.7 231.9 20 268.1 20 303.9 25.7 338.3 36.9 370.5 53.3 399.8 74.6 425.4 100.2 446.7 129.5 463.1 161.7 474.3 196.1 480 231.9 480 250 500 250 500 0 0 0',
    FUNNEL: 'M0,0  L68,30',
       DROP_LEFT: '0 0 20 0 70 100 20 150 0 150 0 0',
    DROP_RIGHT: '50 0 68 0 68 150 50 150 0 100 50 0',
    APRON_LEFT: '0 0 180 120 0 120 0 0',
    APRON_RIGHT: '180 0 180 120 0 120 180 0'
  };
  const COLOR = {
    BACKGROUND: '#212529',
    OUTER: '#495057',
    INNER: '#15aabf',
    BUMPER: '#fab005',
    BUMPER_LIT: '#fff3bf',
    PADDLE: '#e64980',
    PINBALL: '#dee2e6'
  };
  const GRAVITY = 0.75;
  const WIREFRAMES = false;
  const BUMPER_BOUNCE = 0.5;
  const PADDLE_PULL = 0.002;
  const MAX_VELOCITY = 50;
  const BALLCOUNT = 200;

  // score elements
  let $currentScore = $('.current-score span');
  let $highScore = $('.high-score span');

  // shared variables
  let currentScore, highScore;
  let engine, world, render, pinball, stopperGroup;
  let leftPaddle, leftUpStopper, leftDownStopper, isLeftPaddleUp;
  let rightPaddle, rightUpStopper, rightDownStopper, isRightPaddleUp;

  function load() {
    init();
    createStaticBodies();
    createPinballs();
    createEvents();
  }

  function init() {
    // engine (shared)
    engine = Matter.Engine.create();

    // world (shared)
    world = engine.world;
    world.bounds = {
      min: { x: 0, y: 0},
      max: { x: 500, y: 800 }
    };
    world.gravity.y = GRAVITY; // simulate rolling on a slanted table

    // render (shared)
    render = Matter.Render.create({
      element: $('.container')[0],
      engine: engine,
      options: {
        width: world.bounds.max.x,
        height: world.bounds.max.y,
        wireframes: WIREFRAMES,
        background: COLOR.BACKGROUND
      }
    });
    Matter.Render.run(render);

    // runner
    let runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // used for collision filtering on various bodies
    stopperGroup = Matter.Body.nextGroup(true);

    // starting values
    currentScore = 0;
    highScore = 0;
    isLeftPaddleUp = false;
    isRightPaddleUp = false;
  }

  function createStaticBodies() {

    // create pascals triangle of bumpers adding rows of bumpers to the world
    
    
    const bumpers  = [];
    const rows = 8;
    const distance = 30;
    const size = 5;
    const centerX = 250;
    const topY = 250;
    

    for (let i = -rows; i < rows; i++) {
        for (let j = -i; j <= i; j++) {
            bumpers.push(bumper(centerX + j * distance ,topY  + i * distance, size ));
        }
    }

    // collectionWalls

    



    Matter.World.add(world, [
      // table boundaries (top, bottom, left, right)
      boundary(250, -30, 500, 100),
      boundary(250, 830, 500, 100),
      boundary(-30, 400, 100, 800),
      boundary(530, 400, 100, 800),


      ...bumpers,

        wall(50,675, 5, 250, COLOR.OUTER),
        wall(100,675, 5, 250, COLOR.OUTER),
        wall(150,675, 5, 250, COLOR.OUTER),
        wall(200,675, 5, 250, COLOR.OUTER),
        wall(250,675, 5, 250, COLOR.OUTER),
        wall(300,675, 5, 250, COLOR.OUTER),
        wall(350,675, 5, 250, COLOR.OUTER),
        wall(400,675, 5, 250, COLOR.OUTER),
        wall(450,675, 5, 250, COLOR.OUTER),

        wall(130,100, 5,250, COLOR.OUTER, 90),
        wall(390,100, 5,250, COLOR.OUTER, 180),




    ]);
  }

  function createPinballs() {
    // x/y are set to when pinball is launched
for (let i = 0; i < BALLCOUNT; i++) {
    const ball  = Matter.Bodies.circle(0, 0, 8, {
      label: 'pinball',
      collisionFilter: {
        group: stopperGroup
      },
      render: {
        fillStyle: COLOR.PINBALL
      }
    });


    setTimeout(() => {
        Matter.World.add(world, ball);
        Matter.Body.setPosition( ball, { x: 100, y: 50 });
        Matter.Body.setVelocity( ball, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity( ball, 0);
        }, 200 * i);
        
}
  }



  function createEvents() {
    // events for when the pinball hits stuff
    Matter.Events.on(engine, 'collisionStart', function(event) {
      let pairs = event.pairs;
      pairs.forEach(function(pair) {
        if (pair.bodyB.label === 'pinball') {
          switch (pair.bodyA.label) {
            case 'reset':
              launchPinball();
              break;
            case 'bumper':
              pingBumper(pair.bodyA);
              break;
          }
        }
      });
    });

  




  }



  // matter.js has a built in random range function, but it is deterministic
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // outer edges of pinball table
  function boundary(x, y, width, height) {
    return Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: {
        fillStyle: COLOR.OUTER
      }
    });
  }

  // wall segments
  function wall(x, y, width, height, color, angle = 0) {
    return Matter.Bodies.rectangle(x, y, width, height, {
      angle: angle,
      isStatic: true,
      chamfer: { radius: 5 },
      render: {
        fillStyle: color
      }
    });
  }

  // bodies created from SVG paths
  function path(x, y, path) {
    let vertices = Matter.Vertices.fromPath(path);
    return Matter.Bodies.fromVertices(x, y, vertices, {
      isStatic: true,
      render: {
        fillStyle: COLOR.OUTER,

        // add stroke and line width to fill in slight gaps between fragments
        strokeStyle: COLOR.OUTER,
        lineWidth: 1
      }
    });
  }

  // round bodies that repel pinball
  function bumper(x, y, size = 5) {
    let bumper = Matter.Bodies.circle(x, y, size, {
      label: 'bumper',
      isStatic: true,
      render: {
        fillStyle: COLOR.BUMPER
      }
    });

    // for some reason, restitution is reset unless it's set after body creation
    bumper.restitution = BUMPER_BOUNCE;

    return bumper;
  }





  window.addEventListener('load', load, false);
})();


