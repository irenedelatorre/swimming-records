var margin = {t:50,r:50,b:200,l:100};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

//var canvas1 = d3.select('#sketch1');
//var plot = canvas1
//    .append('svg')
//    .attr('width',width+margin.r+margin.l)
//    .attr('height',height + margin.t + margin.b);

var formatDate = d3.timeFormat("%b-%y");
var scaleX = d3.scaleBand().rangeRound([0, width]),
    scaleY = d3.scaleLinear().rangeRound([height, 0]),
    scaleColor1 = d3.scaleOrdinal().domain(["Africa","North America","Asia","Oceania","Europe","South America"]).range(["#DB7935","#4039C4","#3CA2CE","#72E82C","#ED1A3B","#E5CE23"]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);

typeDispatch = d3.dispatch('changeviz');
swimmerDispatch = d3.dispatch('changeswimmer');


//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/20161106-swimming-times.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw1);

function draw1 (err, rows, types, swimmers) {

    d3.select(".type-list").on("change", function () {
        typeDispatch.call("changeviz", this, this.value);
    });

    d3.select(".swimmer-list").on("change", function () {
        swimmerDispatch.call("changeswimmer", this, this.value);
    });

    //console.log(data);
    var data = rows;

    //FILTERS
    var data = rows;
    var swims = crossfilter (data);
    var swimsByEvent = swims.dimension(function(d){return d.event});
    var swimsBySex = swims.dimension(function(d){return d.sex});
    var swimsByContinent = swims.dimension(function(d){return d.continent});
    var swimsByCountry = swims.dimension(function(d){return d.country});
    var swimsByLocation = swims.dimension(function(d){return d.location});
    var swimsBySwimmer = swims.dimension(function(d){return d.name});

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);


    //var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"]

    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

    var swimmingModule = d3.swimSeries();

    var plot1 = d3.select("#sketch1")
        .datum(data)
        .call(swimmingModule);

    //dispatch function
    swimmerDispatch.on("changeswimmer", function(swimmer,i){
        console.log(swimmer);
        swimsBySwimmer.filterAll();

        if (swimmer == "All" ){
            swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);
        }else{
            swimsSwimmer = swimsBySwimmer.filter(swimmer).top(Infinity);
        }

        var swimsinDispatch = d3.nest()
            .key(function(d){return d.name})
            .entries(swimsSwimmer);

        var name = swimsinDispatch.map(function(d,i){return d.key});

        if (swimmer == name){
            d3.select(".swim")

        }



    });

    //function drawSwimmer (){
    //    console.log(swimsSwimmer)
    //
    //}


    //sketchingSwims
    //
    //    .transition()
    //    .duration(100)
    //    .style("opacity",0.52)
    //    //.duration(function(d){
    //    //    return speed(d.time)})
    //    //.ease(d3.easeLinear)
    //    .style("opacity",0.52)
    //    .attr("cx",function(d,i){
    //        return scaleX(d.event)})
    //    .attr("cy",function(d,i){
    //        return scaleY(d.time)
    //    });



}


function parseData(d){
    return {
        event: d["Event"],
        distance: +d["Distance"],
        name: d["Swimmer"],
        sex: d["Sex"],
        country: d["Swimmer nationality"],
        continent: d["Continent nationality"],
        time: +d["Miliseconds"],
        date: new Date (d["Date"]),
        ranking: +d["Ranking"],
        location: d["Meet location"],
        meet: d["Meet"],
        when: d["When"]

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
    d3.select(".swimmer-list") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer)
}

