var margin = {t:50,r:50,b:200,l:100};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var plot = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

var formatDate = d3.timeFormat("%b-%y");
var scaleX = d3.scaleBand().rangeRound([0, width]),
    scaleY = d3.scaleLinear().rangeRound([height, 0]),
    scaleColor1 = d3.scaleOrdinal().domain(["Africa","North America","Asia","Oceania","Europe","South America"]).range(["#DB7935","#4039C4","#3CA2CE","#72E82C","#ED1A3B","#E5CE23"]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);


//TODO: import data, parse, and draw
d3.csv("data/20161031-swimming-times3.csv", parseData, draw1);

function draw1 (err, rows) {


    //console.log(data);
    var data = rows;

    //var nestedSwims = d3.nest()
    //    .key(function(d){
    //        return d.event
    //    })
    //    .entries(data);
    //
    //var events = nestedSwims.map(function(d) { return (d.key); });
    //    events.sort(function(a,b){return a-b});
    var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"]
    console.log(events);

    //var swims = crossfilter (data);
    //var swimsByEvent = swims.dimension(function(d){return d.event});
    //var swimsBySex = swims.dimension(function(d){return d.sex});
    //
    //swimEvents = swimsByEvent.filterAll().top(Infinity);

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});

    //y = always, speed dif. depending on TIME
    scaleY.domain([0,max]);
    scaleX.domain(events);

    //AXIS
    var axisX = d3.axisBottom()
        .scale(scaleX);

    var axisY = d3.axisLeft()
        .scale(scaleY)
        .tickFormat(msToTime);

    plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','axis axis-y');
    plot.append('g').attr('transform','translate('+ margin.l+','+ (margin.t+height)+')').attr('class','axis axis-x');
    plot.append('g').attr("transform","translate("+(margin.l+26)+","+ margin.t+")").attr('class','dots');

    plot.select('.axis-x').transition().call(axisX)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)"
        });
    plot.select('.axis-y').transition().call(axisY);

    speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);

    var date1 = new Date(1900,1,1);
    var date2 = new Date(2016,10,31);

    console.log(date1)

    speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);

    var t = d3.transition()
        .duration(750)
        .ease(d3.easeLinear);


    sketchingSwims = plot.select(".dots")
        .selectAll(".swim")
        .data(data);

    sketchingSwims
        .enter()
        .append("circle")
        .attr("class", "swim")
        .attr("r",5)
        .style("fill",function(d){
            //return scaleColor1(d.continent)
            return scaleColor2(d.sex)
        })
        .style("opacity",0)
        .attr("cx",function(d,i){
            if (d.sex=="Male"){
                return scaleX(d.event)-5
            }else{return scaleX(d.event)+5}
            })
        .attr("cy",(height))
        .transition()
        .style("opacity",0.50)
        .delay(function(d){return speedByTime(d.date)})
        //.duration(function(d){
        //    return speed((d.time/50))})
        .duration(500)
        //.ease(d3.easeQuadInOut)
        .ease(d3.easeLinear)
        .attr("cx",function(d,i){
            if (d.sex=="Male"){
                console.log("Male")
                return scaleX(d.event)-5
            }else{return scaleX(d.event)+5}
        })
        .attr("cy",function(d,i){
            return scaleY(d.time)
        });

    sketchingSwims.exit().remove();



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
        name: d["Name"],
        sex: d["Sex"],
        country: d["Nationality"],
        continent: d["Continent nationality"],
        time: +d["Miliseconds"],
        date: new Date (d["Date"]),
        ranking: +d["Ranking"],
        location: d["Location"],
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
