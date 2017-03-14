//ALL SWIMMERS
var margin = {t:5,r:0,b:5,l:0};
var width = d3.select('#allSwimmers').node().clientWidth - margin.r - margin.l,
    height = d3.select('#allSwimmers').node().clientHeight - margin.t - margin.b;

var canvasAllSwimmers = d3.select('#allSwimmers')
    .append('canvas')
    .attr('width',width)
    .attr('height',height)
    .node(),
    ctx = canvasAllSwimmers.getContext("2d");

// Create an in memory only element of type 'custom', that will not be attached to the DOM, to which we can bind the data
var detachedContainer = document.createElement("custom");
var dataContainer = d3.select(detachedContainer);


var date1 = new Date(1900,1,1);
var date2 = new Date(2016,10,31);

var today = new Date ();
var seconds = d.getSeconds();

var formatDate = d3.timeFormat("%B %d, %Y"),
    formatDate2 = d3.timeFormat("%b %d, %Y"),
    formatYear = d3.timeFormat("%Y"),
    formatSpeed = d3.format(".2f"),
    scaleX = d3.scaleLinear().range([0, width]),
    scaleY = d3.scaleTime().range([height, 0]),
    scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
    mySize = 2.5,



swimmerDispatch = d3.dispatch('selectswimmer');
swimmerDispatch2 = d3.dispatch('selectswimmer2');

var btnControl;
var btnControl2;

var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 100 m medley relay","4 x 200 m freestyle relay"]

//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/data.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw);

var m = {t:50,l:50,b:50,r:50};
var general = {
    cardW : 180,
    cardH : 252,
    scaleColor: d3.scaleLinear().domain([0,100]).range(["#CE2028","#3FB549"])
}

general.chartW = document.getElementById('container').clientWidth-m.l-m.r;
general.chartH = document.getElementById('container').clientHeight-m.t-m.b;

var canvases = [];

//load data

function drawSwimmers (err, rows, types, swimmers){

    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch.call("selectswimmer", this, this.value);});
    d3.select(".swimmer-list3").on("change", function () {swimmerDispatch2.call("selectswimmer2", this, this.value);});

    var data = rows;


    //FILTERS
    var data = rows.sort(function(a,b){return a.date - b.date}),
        swims = crossfilter (data),
        swimsByEvent = swims.dimension(function(d){return d.event}),
        swimsBySwimmer = swims.dimension(function(d){return d.name}),
        x = 0;

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});
    var speedExtent = d3.extent(data.map(function (d) {return d.speed}));
    var speedScale = d3.scaleLinear().domain(speedExtent).range([1,10]);

    //date
    var dateExtent = d3.extent(data.map(function (d) {return d.date}));

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain(dateExtent);
    scaleX = scaleX.domain([0,50]);

    initCanvases();

}

function initCanvases(){

    var nodes = d3.selectAll(".card_container").nodes();


    nodes.forEach(function(node){
        var can = createGraphics(general.cardW, general.cardH);
        node.canvas = can;
        canvases.push(can);
        node.appendChild(can.elt);
        can.elt.style.display = "block";
        setupCanvas(can);

    });

}


//this is run automatically by p5.js before the setup()
function preload(){
    // parse data
    function parseData(d){
        return {
            id: d["id"],
            id2: d["id2"],
            event: d["Event"],
            distance: +d["Distance"],
            name: d["Swimmer"],
            sex: d["Sex"],
            country: d["Swimmer nationality"],
            nCountry: +d["nCountry"],
            continent: d["Continent nationality"],
            nContinent: +d["nContinent"],
            time: +d["Miliseconds"],
            date: new Date (d["Date"]),
            ranking: +d["Ranking"],
            location: d["Meet location"],
            meet: d["Meet"],
            when: d["When"],
            speed: +d["Distance"]/(+d["Miliseconds"]/1000)

        }

    }

    function msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return hrs + ':' + mins + ':' + secs + '.' + ms;
    }


    function parseType(n){
        d3.select(".type-list") //class in the html file
            .append("option") //it has to be called this name
            .html(n.type)
            .attr("value", n.type)
    }

    function parseSwimmer(n){
        d3.select(".swimmer-list2") //class in the html file
            .append("option") //it has to be called this name
            .html(n.Swimmer + " (" + n.records + ")")
            .attr("value", n.Swimmer);

        d3.select(".swimmer-list3") //class in the html file
            .append("option") //it has to be called this name
            .html(n.Swimmer + " (" + n.records + ")")
            .attr("value", n.Swimmer);
    }

    var queue = d3_queue.queue()
        .defer(d3.csv,'data/data.csv',parseData)
        .defer(d3.csv,'data/metadata.csv',parseType)
        .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
        .await(drawSwimmers);

}

function setupCanvas(c){
    c.ys1 = [];
    c.ys2 = [];
    c.ran = c.random(1, 1.5);

    for(var i = 0; i<10; i++){
        c.ys1[i] = c.random(50, c.height-100);
        c.ys2[i] = c.ys1[i] + c.random(-5, 5);
    }
    c.score = c.random(1, 100);

}

function drawCanvas(c){

    c.clear();
    //c.background(255, 0, 0);
    //c.fill(0, 30);

    c.strokeWeight(c.score/5);
    c.noiseSeed(c.ran*1000);
    for(var i = 0; i<c.ys1.length; i++){
        var d = c.map(c.noise(c.ran*100+c.frameCount/(i*10*c.ran)), 0, 1, -(c.height-100-30)/1.5, (c.height-100-30)/1.5);
        var def = c.ys2[i] - c.ys1[i];
        c.ys1[i]=30+(c.height-100-30)/2+d;
        c.ys2[i]=30+(c.height-100-30)/2+d+def;
        c.line(0, c.ys1[i], c.width, c.ys2[i]);
    }
    //c.ellipse(c.width, c.random(0, c.height), 25, 25);

    c.frameCount++;
}

function setup(){
    noCanvas();
    frameRate(30);
    //creating canvases for each card

}

function draw(){
    /*canvases.forEach(function(canvas){
     canvas.clear();
     canvas.background(255, 0, 0);
     canvas.fill(0);
     canvas.ellipse(canvas.width, random(0, canvas.height), 25, 25);

     });*/

    canvases.forEach(function(canvas){

        drawCanvas(canvas);


    });

}

function draw (err, rows, types, swimmers) {

    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch.call("selectswimmer", this, this.value);});
    d3.select(".swimmer-list3").on("change", function () {swimmerDispatch2.call("selectswimmer2", this, this.value);});

    var data = rows;


    //FILTERS
    var data = rows.sort(function(a,b){return a.date - b.date}),
        swims = crossfilter (data),
        swimsByEvent = swims.dimension(function(d){return d.event}),
        swimsBySwimmer = swims.dimension(function(d){return d.name}),
        x = 0;

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});
    var speedExtent = d3.extent(data.map(function (d) {return d.speed}));
    var speedScale = d3.scaleLinear().domain(speedExtent).range([1,10]);

    //date
    var dateExtent = d3.extent(data.map(function (d) {return d.date}));

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain(dateExtent);
    scaleX = scaleX.domain([0,50]);

    ////Create the circles as if it was a normal D3 thing
    //var dataBinding = dataContainer.selectAll(".swimmers")
    //    .data(data)
    //    .enter()
    //    .append("circle")
    //    .attr("class","swimmers")
    //    .attr("cx",mySize)
    //    .attr("cy",function(d){return scaleY(d.date)})
    //    .attr("r",mySize)
    //    .attr("fill",function(d){return scaleColor(d.sex)});
    //
    ////Select our dummy nodes and draw the data to canvas.
    //dataBinding.each(function(d){
    //    //select one of the nodes/circles
    //    var swimmer = d3.select(this);
    //
    //    //draw each circle
    //    ctx.globalCompositeOperation = 'lighter';
    //    ctx.fillStyle = swimmer.attr("fill");
    //    ctx.beginPath;
    //    ctx.arc(swimmer.attr("cx"),swimmer.attr("cy"),swimmer.attr("r"),0,  2 * Math.PI)
    //    ctx.fill();
    //    ctx.closePath();
    //});

    var xPos = mySize;

    //Loop over the dataset and draw each circle to the canvas
    for (var i = 0; i < data.length; i++) {
        //Select one of the nodes/circles
        var swimmer = data[i],
            yPos = scaleY(swimmer.date),
            mySpeed = speedScale(swimmer.speed);


        //Draw each circle
        ctx.fillStyle = scaleColor(swimmer.sex);
        ctx.beginPath();
        ctx.arc(xPos, yPos, mySize, 0,  2 * Math.PI, true);
        ctx.fill();
        ctx.closePath();

        xPos = xPos + mySpeed;

    };






    //drawSwimmers();
    //DRAW COMPETITIONS

    //function drawSwimmers(){
    //        var speed = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
    //            scaleRMiniCircles = d3.scaleSqrt().range([10, 50]).domain(speedExtent),
    //            scaleX2 = d3.scaleBand().rangeRound([50, (width-50)]).domain(events).padding([50]),
    //            scaleX2Axis = d3.scaleBand().range([50, (width-50)]).domain(events).padding([50]),
    //            scaleX2Time = d3.scaleTime().domain([date1,date2]).range([50, width-50]),
    //            showOnDate = d3.scaleTime().domain([date1,date2]).range([100,40000]);
    //            var x = 0;
    //
    //
    //    ctx.clearRect(0,0,width,height);
    //    ctx.globalCompositeOperation = 'lighter';
    //
    //    data.forEach(function(d){
    //            var mySpeed = speedScale(d.speed);
    //            var y = scaleY(d.date);
    //
    //            var myColor = scaleColor(d.sex);
    //
    //            ctx.beginPath();
    //            ctx.fillStyle = myColor;
    //            ctx.arc(x,y,mySize,0,Math.PI*2);
    //            ctx.fill();
    //            ctx.closePath();
    //
    //            ctx.moveTo(x+mySpeed,y);
    //
    //            x += mySpeed;
    //            if(x<0 || x>width) mySpeed = mySpeed*-1;
    //
    //        });
    //
    //    window.requestAnimationFrame(drawSwimmers)
    //
    //}



}




