var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var sketch1 = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','sketch')
    .attr('transform','translate('+margin.l+','+margin.t+')');

var formatDate = d3.timeFormat("%b-%y");
var scaleX = d3.scaleTime()
    .range([0, width]);

scaleY = d3.scaleLinear().rangeRound([height, 0]).domain([0, 200]);

var xAxis = d3.axisBottom()
    .scale(scaleX)
    .tickFormat(formatDate);



var axisY = sketch1.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(scaleY).tickValues([50,100,200,400,800,1500]));



//TODO: import data, parse, and draw
d3.csv("../data/20161106-swimming-times.csv", parseData, draw1);

function draw1 (err, rows) {
    //console.log(data);

    var data = rows;
    var swims = crossfilter (data);
    var swimsByEvent = swims.dimension(function(d){return d.event});
    var swimsBySex = swims.dimension(function(d){return d.sex});

    swimEvents = swimsByEvent.filterAll().top(Infinity);

    //50m men

    men = swimsBySex.filter("Male").top(Infinity);
    var men50m = swimsByEvent.filter("200 m freestyle").top(Infinity);
    console.log(men50m);

   //speed
    var max = d3.max(men50m, function(d){return d.time});
    console.log(max);

    //y = always, speed dif. depending on TIME
    speed = d3.scaleLinear().domain([0,max]).range([0,max]);

    scaleX.domain(d3.extent(data, function(d) { return (d.date); }));

    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);


    sketch1.append("rect")
        .attr("class","swimmingpool")
        .attr("x", 0)
        .attr("width",width)
        .attr("y", function(d){return scaleY(200)})
        .attr("height", function(d){return height - scaleY(200)});

    sketch1.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(scaleX));

    sketch1.selectAll(".swim")
        .data(men50m)
        .enter()
        .append("rect")
        .attr("class", "swim")
        .attr("x", function(d) { return scaleX(d.date); })
        .attr("y", height)
        .attr("width", 1)
        .attr("height", 0)
        .attr("fill", "rgba(255,255,255,0.5)")
        .transition()
        .duration(function(d){
            return speed(d.time)})
        .ease(d3.easeLinear)
        .attr("y", function(d){return scaleY(200)})
        .attr("height", function(d){return height - scaleY(200)})
        .attr("width", 1)
        //.attr("fill", "rgba(0,186,255,0.75)")
        .transition()
        .duration(100)
        .attr("fill", "rgba(0,186,255,0.5)")

    //sketch1.selectAll(".swimmers")
    //    .data(men50m)
    //    .enter()
    //    .append("ellipse")
    //    .attr("class", "swimmers")
    //    .attr("cx", function(d) { return scaleX(d.date); })
    //    .attr("cy", height)
    //    .attr("rx", 2)
    //    .attr("ry", 3)
    //    .transition()
    //    .duration(function(d){
    //        return speed(d.time)})
    //    .ease(d3.easeLinear)
    //    .attr("cy", function(d){return scaleY(50)});

}


function parseData(d){
    //console.log(d);
    return {
        id: d["id"],
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

