
(() => {
  // plugins
  Matter.use(MatterAttractors);

  // constants
  const PATHS = {
  FUNNEL: 'M0,0  L68,30',

  };
  const COLOR = {
    PRIMARY: "#005C53",
SECODARY:'#042940',
    BACKGROUND: '#fefefe',
    OUTER: '#495057',
    INNER: '#15aabf',
    BUMPER: '#F7CC1D',
    BUMPER_LIT: '#fff3bf',
    PADDLE: '#e64980',
    PINBALL: '#F7CC1D'
  };
  const GRAVITY = 1;
  const WIREFRAMES = false;
  const BUMPER_BOUNCE = 0.0;
  const BALLCOUNT = 400;
    const ballSize = 6;
    const bumpers  = [];
    const rows = 15;
    const vertivalDistance = 20;
    const horizontalDistance = 30;
    const size =4;
    const centerX = 250;
    const topY = 100;


  // shared variables
  let engine, world, render


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



  }

  function createStaticBodies() {

    // create pascals triangle of bumpers adding rows of bumpers to the world
    

    for (let i = -rows; i < rows; i++) {
        for (let j = 0; j <= i; j++) {
            bumpers.push(bumper( centerX + j * horizontalDistance - (i * horizontalDistance/2)  ,topY  +i * vertivalDistance, size ));
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

      collectionWall(50,675, 5, 250, COLOR.PRIMARY),
      collectionWall(100,675, 5, 250, COLOR.PRIMARY),
      collectionWall(150,675, 5, 250,COLOR.PRIMARY),
      collectionWall(200,675, 5, 250,COLOR.PRIMARY),
      collectionWall(250,675, 5, 250, COLOR.PRIMARY),
      collectionWall(300,675, 5, 250, COLOR.PRIMARY),
      collectionWall(350,675, 5, 250, COLOR.PRIMARY),
      collectionWall(400,675, 5, 250, COLOR.PRIMARY),
      collectionWall(450,675, 5, 250, COLOR.PRIMARY),
       // wall(115,50, 5,250, COLOR.OUTER, 2),
       // wall(390,100, 5,250, COLOR.OUTER, 1),
       // wall(390,100, 5,250, COLOR.OUTER),



    ]);
  }

  function createPinballs() {
    // x/y are set to when pinball is launched
for (let i = 0; i < BALLCOUNT; i++) {
    const ball  = Matter.Bodies.circle(0, 0, ballSize, {
      label: 'pinball',
      collisionFilter: {
        //group: stopperGroup
      },
      render: {
        fillStyle: COLOR.PINBALL
      }
    });


    setTimeout(() => {
        Matter.World.add(world, ball);
        Matter.Body.setPosition( ball, { x: 250, y:125 });
        Matter.Body.setVelocity( ball, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity( ball, 0);
        },200 * i);
        
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
            //  pingBumper(pair.bodyA);
              break;
          }
        }
      });
    });

  




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
  function collectionWall(x, y, width, height, color, angle = 0) {
    return Matter.Bodies.rectangle(x, y, width, height, {
      angle: angle,
      isStatic: true,
      chamfer: { radius: 5 },
      render: {
        fillStyle: color
      }
    });
  }



  // round bodies that repel pinball
  function bumper(x, y, size = 5) {
    let bumper = Matter.Bodies.circle(x, y, size, {
      label: 'bumper',
      isStatic: true,
      render: {
        fillStyle: COLOR.SECODARY
      }
    });

    // for some reason, restitution is reset unless it's set after body creation
    bumper.restitution = BUMPER_BOUNCE;

    return bumper;
  }


  function pingBumper(bumper) {
   
    // flash color
    bumper.render.fillStyle = COLOR.BUMPER_LIT;
    setTimeout(function() {
        bumper.render.fillStyle = COLOR.BUMPER;
    }, 100);
}



  window.addEventListener('load', load, false);
})();


