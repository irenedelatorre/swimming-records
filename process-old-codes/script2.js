// Create a physics instance which uses the Verlet integration method
var physics = new Physics();
physics.integrator = new Verlet();

// Design some behaviours for particles
var avoidMouse = new Attraction();
var pullToEnd = new Attraction();

// Allow particle collisions to make things interesting
var collision = new Collision();


var margin = {t:50,r:100,b:50,l:50};
var myWidth = document.getElementById('sketch2').clientWidth - margin.r - margin.l,
    myHeight = document.getElementById('sketch2').clientHeight - margin.t - margin.b;

var formatDate = d3.timeFormat("%b-%y");
var scaleX = d3.scaleTime()
    .range([0, myWidth]);

scaleY = d3.scaleLinear().rangeRound([myHeight, 0]).domain([0, 100]);

// Use Sketch.js to make life much easier
var example = Sketch.create({ container: document.body });



example.setup = function () {

    d3.csv("data/20161015 swimming-times2.csv", parseData, draw2);

    function draw2 (err, rows){

        var data = rows;
        var swims = crossfilter (data);
        var swimsByEvent = swims.dimension(function(d){return d.event});
        var swimsBySex = swims.dimension(function(d){return d.sex});

        swimEvents = swimsByEvent.filterAll().top(Infinity);

        //50m men
        men = swimsBySex.filter("Male").top(Infinity);
        var men50m = swimsByEvent.filter("50 m freestyle").top(Infinity);
        console.log(men50m);

        //speed
        var max = d3.max(men50m, function(d){return d.time});

        //y = always, speed dif. depending on TIME
        speed = d3.scaleLinear().range([0,max]).domain([0,max]);

        scaleX.domain(d3.extent(data, function(d) { return (d.date); }));

        myArray = men50m.length;

        for ( var i = 0; i < myArray*10; i++ ) {

            console.log(men50m);

            // Create a particle
            var particle = new Particle( Math.random() );

            // scaleX * value ----- from 0 to 50
            var position = new Vector( scaleX(men50m[0].date), random( scaleY(50)) );
            particle.setRadius( particle.mass * 10 );
            particle.moveTo( position );

            // Make it collidable
            collision.pool.push( particle );

            // Apply behaviours
            particle.behaviours.push( avoidMouse, pullToEnd, collision );

            // Add to the simulation
            physics.particles.push( particle );
        }

        for ( var i = 0; i < 10; i++ ) {

            pullToEnd.target.x = scaleX(men50m[0].date);
            pullToEnd.target.y = ( scaleY(50));
            pullToEnd.strength = 500;
        }



        avoidMouse.setRadius( 60 );
        avoidMouse.strength = -500;

        example.fillStyle = '#ff00ff';
    }

}

example.draw = function() {

    // Step the simulation
    physics.step();

    // Render particles
    for ( var i = 0, n = physics.particles.length; i < n; i++ ) {

        var particle = physics.particles[i];
        example.beginPath();
        example.arc( particle.pos.x, particle.pos.y, particle.radius, 0, Math.PI * 2 );
        example.fill();
    }
}

example.mousemove = function() {
    avoidMouse.target.x = example.mouse.x;
    avoidMouse.target.y = example.mouse.y;
}

function parseData(d){
    //console.log(d);
    return {
        event: d["Event"],
        name: d["Name"],
        sex: d["Sex"],
        country: d["Nationality"],
        time: +d["Miliseconds"],
        date: new Date (d["Date"]),
        ranking: +d["Ranking"],
        location: d["Location"],
        meet: d["Meet"],
        when: d["When"]

    }

}
