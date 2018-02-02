var t;
var x;
var opacity;



//TODO: import data, parse, and draw

function setup() {
    var margin = {t:50,r:100,b:50,l:50};
    var width = document.getElementById('sketch3').clientWidth - margin.r - margin.l,
        height = document.getElementById('sketch3').clientHeight - margin.t - margin.b;

    var myCanvas = createCanvas(width, height/2);
    background("#192F38");

    myCanvas.parent('sketch3');
    t = 0;
    x = 0;
    opacity = 0;
}
//
function draw() {
    var margin = {t:50,r:100,b:50,l:50};
    var width = document.getElementById('sketch3').clientWidth - margin.r - margin.l,
        height = (document.getElementById('sketch3').clientHeight - margin.t - margin.b)/2;

    var data = d3.csv("data/data.csv", parseData, draw2);

    function draw2 (data){
        var formatDate = d3.timeFormat("%b-%y");
        background(0, 5);

        var rows = data;
        var swims = crossfilter (rows);
        var swimsByEvent = swims.dimension(function(d){return d.event});
        var swimsBySex = swims.dimension(function(d){return d.sex});

        swimEvents = swimsByEvent.filterAll().top(Infinity);

        //50m men

        men = swimsBySex.filter("Male").top(Infinity);
        var men50m = swimsByEvent.filter("50 m freestyle").top(Infinity);

        //speed
        var max = d3.max(men50m, function(d){return d.time});

        //y = always, speed dif. depending on TIME
        speed = d3.scaleLinear().domain([0,max]).range([0,1/2]);

        var scaleY = d3.scaleTime()
            .range([0, height])
            .domain(d3.extent(data, function(d) { return (d.date); }));

        var scaleX = d3.scaleLinear().rangeRound([width, 0]).domain([0, 100]);


        men50m.forEach(function(d,i){

            var x1 = x / (speed(d.time));
            var y1 = scaleY(d.date);
            console.log(x1);

            if (x1 > scaleX(d.distance)){x1 = scaleX(d.distance)};

            blendMode(SCREEN);
            ellipse(x1,y1,0.10,0.10);
            background(1, 5);

            if (x1 > scaleX(d.distance)){
                stroke("rgba(0,85,255,1)");
                ellipse(x1,y1,0.25,0.25);
            }else{
                stroke("rgba(0,85,255,"+noise(opacity)+")");

            };



            x = x + 0.01;
            opacity = opacity + 0.1;

        });

        //wanted effect -- no correct data
        //men50m.forEach(function(d,i){
        //
        //    var x1 = scaleX(d.date);
        //    var x2 = scaleX(d.date);
        //    var y2 =  y *noise(speed(d.time)) ;
        //    var y1 = height;
        //    console.log(y);
        //
        //    if (y2 > scaleY(d.distance)){y2 = scaleY(d.distance)};
        //
        //    //line(x1,y1,x2,y2);
        //    ellipse(x1,(height-y2),1,1);
        //    background(0, 5);
        //
        //    stroke("rgba(0,186,255,"+noise(opacity)+")");
        //
        //
        //    y = y + 0.01;
        //    opacity = opacity + 0.1;
        //
        //});
    }


}
//
//
function parseData(d){

    return {
        event: d["Event"],
        distance: +d["Distance"],
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

