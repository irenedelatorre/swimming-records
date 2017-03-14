//canvas1
var margin = {t:50,r:50,b:200,l:70};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var plot = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

//MINIMENU
var margin2 = {t:5,r:5,b:5,l:5};
var width2 = d3.select('#miniMenu').node().clientWidth - margin2.r - margin2.l,
    height2 = d3.select('#miniMenu').node().clientHeight - margin2.t - margin2.b;

var canvasMiniMenu = d3.select('#miniMenu');

var plotMiniMenu = canvasMiniMenu
    .append('svg')
    .attr('width',width2+margin2.r+margin2.l)
    .attr('height',height2 + margin2.t + margin2.b);

//CANVAS2
var width2b = d3.select('#sketch2').node().clientWidth - margin2.r - margin2.l,
    height2b = d3.select('#sketch2').node().clientHeight - margin2.t - margin2.b;

var canvas2 = d3.select('#sketch2');

var plot2 = canvas2
    .append('svg')
    .attr('width',width2b+margin2.r+margin2.l)
    .attr('height',height2b + margin2.t + margin2.b);

var formatDate = d3.timeFormat("%B %d, %Y"),
    formatDate2 = d3.timeFormat("%b %d, %Y"),
    scaleX = d3.scaleBand().rangeRound([0, width]),
    scaleY = d3.scaleLinear().range([height, 0]),
    scaleColor1 = d3.scaleOrdinal().domain(["Africa","North America","Asia","Oceania","Europe","South America"]).range(["#DB7935","#4039C4","#3CA2CE","#72E82C","#ED1A3B","#E5CE23"]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);

typeDispatch = d3.dispatch('changeviz');
swimmerDispatch = d3.dispatch('changeswimmer');

//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/data.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw1);

var n = 1;

function draw1 (err, rows, types, swimmers) {

    d3.select(".type-list").on("change", function () {
        typeDispatch.call("changeviz", this, this.value);
    });

    d3.select(".swimmer-list").on("change", function () {
        swimmerDispatch.call("changeswimmer", this, this.value);
    });

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

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});

    var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"]

    //y = always, speed dif. depending on TIME
    scaleY.domain([0,max]);
    scaleX.domain(events);

    //AXIS
    var axisX = d3.axisBottom()
        .scale(scaleX);

    var axisY = d3.axisLeft()
        .scale(scaleY)
        .tickFormat(msToTime)
        .tickSizeInner(-width);

    plot.on("mouseover",mouseOverPlot);

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

    speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);


    sketchingSwims = plot.select(".dots")
        .selectAll(".swim")
        .data(data);

    sketchingSwims
        .enter()
        .append("circle")
        .attr("class", function(d){return "swim " + d.id2})
        .attr("r",3)
        .style("fill",function(d){return scaleColor2(d.sex)})
        .style("opacity",0)
        .attr("cx",function(d,i){
            if (d.sex=="Male"){
                return scaleX(d.event)-5
            }else{return scaleX(d.event)+5}
        })
        .attr("cy",(height))
        .on("mouseover",mousemove)
        .on("mousemove",mousemove)
        .on("mouseout",mouseout)
        .transition()
        .style("opacity",0.50)
        .delay(function(d){return speedByTime(d.date)})
        .on("start", function timer(d){
            d3.select("#timer").html(formatDate2(d.date))
        })
        //.duration(function(d){
        //    return speed((d.time/50))})
        .duration(500)
        //.ease(d3.easeQuadInOut)
        .ease(d3.easeLinear)
        .attr("cx",function(d,i){
            if (d.sex=="Male"){
                return scaleX(d.event)-5
            }else{return scaleX(d.event)+5}
        })
        .attr("cy",function(d,i){
            return scaleY(d.time)
        });

    typeDispatch.on("changeviz",function(type,i){

        if(type=="Default"){
            drawDefault()
        }if (type=="Swimmer nationality"){
            drawCountries()
        } if (type=="Continent nationality"){
            drawContinents ()
        }
    });

    //dispatch function
    swimmerDispatch.on("changeswimmer", function(swimmer,i) {
        console.log(swimmer);
        swimsBySwimmer.filterAll();

        if (swimmer == "All") {
            drawDefault()
        } else {
            swimsSwimmer = swimsBySwimmer.filter(swimmer).top(Infinity);
            var swimsNOTSelected = swimsBySwimmer.filter(function (d) {
                return d != swimmer
            }).top(Infinity);

            var name = swimsSwimmer[0].name;
            var id = swimsSwimmer[0].id2;
            var idNOT = swimsNOTSelected.map(function (d, i) {return d.id2});
            var dateExtent = d3.extent(swimsSwimmer.map(function (d) {return d.date}));
            var max = d3.max(swimsSwimmer, function (d) {return d.time});
            var min = d3.min(swimsSwimmer, function (d) {return d.time});
            console.log(max);
            var date1 = dateExtent[0];
            var date2 = dateExtent[1];

            var minVelocity,
                maxVelocity;

            if(max<27000){
                minVelocity = 50;
                maxVelocity = 100;

            }if(max<152000){
                minVelocity = 100;
                maxVelocity = 500;

            }if(max<400000){
                minVelocity = 500;
                maxVelocity = 800;

            }else{
                minVelocity = 800;
                maxVelocity = 2000;};

            speed = d3.scaleLinear().domain([min, max]).range([minVelocity, maxVelocity]);
            speedByTime = d3.scaleTime().domain([date1, date2]).range([100, 500]);

            scaleY.domain([0,max]);
            scaleX.domain(events);

            //AXIS UPDATE

            var axisX = d3.axisBottom()
                .scale(scaleX);

            var axisY = d3.axisLeft()
                .scale(scaleY)
                .tickFormat(msToTime)
                .tickSizeInner(-width);

            plot.select('.axis-x').transition().call(axisX)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)"
                });

            plot.select('.axis-y').transition().duration(1000).call(axisY);

            plot.selectAll(".swim")
                .transition()
                .duration(1000)
                .ease(d3.easeQuadInOut)
                .attr("cy",function(d,i){return scaleY(d.time)})
                .attr("r",1).style("opacity",0.05)
                .style("fill",function(d){return scaleColor2(d.sex)});

            plot.selectAll("." + id)
                .attr("r",4)
                .style("opacity",0.52)
                .style("fill","white")
                .on("mouseover",function(d){d3.select(this).style("stroke","white");})
                .on("mouseout",mouseout)
                .transition()
                .duration(2000)
                .ease(d3.easeQuadInOut)
                .style("opacity",0.75)
                .style("fill",function(d){return scaleColor2(d.sex)})
                .attr("cx",function(d,i){
                    if (d.sex=="Male"){
                        return scaleX(d.event)-5
                    }else{return scaleX(d.event)+5}
                })
                .attr("cy",function(d,i){return scaleY(d.time)});
        }
    });

    function drawDefault (){
        //speed
        var max = d3.max(data, function(d){return d.time});
        var min = d3.min(data, function(d){return d.time});

        var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"]

        //y = always, speed dif. depending on TIME
        scaleY.domain([0,max]);
        scaleX.domain(events);

        //AXIS
        var axisX = d3.axisBottom()
            .scale(scaleX);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickFormat(msToTime)
            .tickSizeInner(-width);

        plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','axis axis-y');
        plot.append('g').attr('transform','translate('+ margin.l+','+ (margin.t+height)+')').attr('class','axis axis-x');
        plot.append('g').attr("transform","translate("+(margin.l+26)+","+ margin.t+")").attr('class','dots');

        plot.select('.axis-x').transition()
            .duration(1000)
            .call(axisX)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });
        plot.select('.axis-y').transition().duration(500).call(axisY);

        speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);

        var date1 = new Date(1900,1,1);
        var date2 = new Date(2016,10,31);

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
            .attr("class", function(d){return "swim " + d.id2})
            .attr("r",3)
            .style("fill",function(d){return scaleColor2(d.sex)})
            .style("opacity",0)
            .attr("cx",function(d,i){
                if (d.sex=="Male"){
                    return scaleX(d.event)-5
                }else{return scaleX(d.event)+5}
            })
            .attr("cy",(height))
            .on("mouseover",mousemove)
            .on("mousemove",mousemove)
            .on("mouseout",mouseout)
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
                    return scaleX(d.event)-5
                }else{return scaleX(d.event)+5}
            })
            .attr("cy",function(d,i){
                return scaleY(d.time)
            });

        sketchingSwims.exit().remove();

        sketchingSwims
            .transition()
            .duration(1000)
            .attr("r",3)
            .style("opacity",0.52)
            //.duration(function(d){
            //    return speed(d.time)})
            //.ease(d3.easeLinear)
            .attr("cx",function(d,i){
                if (d.sex=="Male"){
                    return scaleX(d.event)-5
                }else{return scaleX(d.event)+5}
            })
            .attr("cy",function(d,i){
                return scaleY(d.time)
            });
    }

    function drawCountries (d){
        swimsCountry = d3.nest()
            .key(function (d) {
                return d.country
            })
            .sortKeys(d3.ascending)
            .entries(data);

        var extentRecords = d3.extent(data.map(function (d) {
            return d.nCountry}));
        console.log(extentRecords)
        var countries = swimsCountry.map(function(d){return d.key});
        scaleX.domain(countries);
        scaleY.domain(extentRecords);

        //UPDATE AXIS
        var axisX = d3.axisBottom()
            .scale(scaleX);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickSizeInner(-width);

        plot.select('.axis-x').transition()
            .duration(1000)
            .call(axisX)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

        plot.select('.axis-y').transition().duration(1000).call(axisY);

        plot.selectAll(".swim")
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("cx",function(d,i){
                return scaleX(d.country)
            })
            .attr("cy",function(d,i){
                return scaleY(d.nCountry)})
            .attr("r",3)
            .style("opacity",0.50)
            .style("fill",function(d){return scaleColor2(d.sex)});
    }

    function drawContinents (d){

        swimsContinent = d3.nest()
            .key(function (d) {
                return d.continent
            })
            .sortKeys(d3.ascending)
            .entries(data);

        var continents = swimsContinent.map(function(d){return d.key});
        var extentRecords = d3.extent(data.map(function (d) {return d.nContinent}));

        scaleX = scaleX.domain(continents);
        scaleY = scaleY.domain(extentRecords);

        //UPDATE AXIS
        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickSizeInner(-width);

        plot.select('.axis-x').transition()
            .duration(1000)
            .call(axisX);

        plot.select('.axis-y').transition().duration(1000).call(axisY);

        plot.selectAll(".swim")
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("cx",function(d,i){return (scaleX(d.continent))})
            .attr("cy",function(d,i){return scaleY(d.nContinent)})
            .attr("r",3)
            .style("opacity",0.50)
            .style("fill",function(d){return scaleColor2(d.sex)});
    }

    function mousemove(d){
        d3.select(this).style("stroke","white");

        var tooltip = d3.select(".custom-tooltip1");
        tooltip.select("#swimmer").html(d.name);
        tooltip.select("#country").html((d.country));
        tooltip.select("#date").html(formatDate(d.date));
        tooltip.select("#time").html(msToTime(d.time));

        var xy = d3.mouse(document.getElementById("sketch1"));
        var left = xy[0],
            top = xy[1];

        d3.select(".custom-tooltip1")
            .style("left", left+ "px")
            .style("top", top + "px")
    }

    function mouseOverPlot(d){

        var xy = d3.mouse(document.getElementById("sketch1"));
        var left = xy[0],
            top = xy[1];

        d3.select(".custom-tooltip1")
            .style("left", left+ "px")
            .style("top", top + "px")
    }


    function mouseout (d){
        d3.select(this).style("stroke","rgba(64, 224, 208, 0.05)");
    }

    //DRAW COMPETITIONS

    drawCompetitions(data);

    function drawCompetitions(d){
        var speedExtent = d3.extent(d.map(function (d) {return d.speed}));


        var speed = d3.scaleLinear().domain([speedExtent]).range([100,2000]),
            scaleRMiniCircles = d3.scaleSqrt().range([10, 30]).domain(speedExtent),
            scaleX2 = d3.scaleBand().rangeRound([20, width2]).domain(events),
            speedByTime2 = d3.scaleTime().domain([date1,date2]).range([100,10000]);

        plotMiniMenu
            .append("line")
            .attr("x1", 0)
            .attr("x2",width2)
            .attr("y1",105)
            .attr("y2",105)
            .attr("class","axisLine");

        plotMiniMenu.append('g').attr("transform","translate("+(margin2.l+20)+","+ margin2.t+")").attr('class','competition');
        plotMiniMenu.append('g').attr("transform","translate("+(margin2.l)+","+ margin2.t+")").attr('class','eventTitle');


        sketchingRecords = plotMiniMenu.select(".competition")
            .selectAll(".swimrecords")
            .data(data);

        sketchingRecords
            .enter()
            .append("circle")
            .attr("class", function(d){return "swimrecords " + d.id2})
            .attr("r",0)
            .style("stroke",function(d){return scaleColor2(d.sex)})
            .style("fill","rgba(255,255,255,0)")
            .style("opacity",0.25)
            .attr("cx",function(d,i){return scaleX2(d.event)})
            .attr("cy",100)
            .on("mouseover",mouseOver2)
            .on("mousemove",mouseOver2)
            //.on("mouseout",mouseout)
            .on("click",function(d){
                plot2.select(".oneEvent").remove();
                var swimEvent = swimsByEvent.filter(d.event).top(Infinity);
                drawEvents(swimEvent);
                d3.select("#eventTitle").html("Event " + d.event);
                d3.selectAll('.btn-default').style("opacity",100)
            })
            .transition()
            .delay(function(d){return speedByTime2(d.date)})
            .duration(function(d){
                return speed((d.time))})
            .ease(d3.easeQuadInOut)
            //.ease(d3.easeLinear)
            .attr("r",function(d){
                return scaleRMiniCircles(d.speed)});

        function drawEvents (d){

            plot2.append('g').attr("transform","translate("+(margin2.l)+","+ (margin2.t)+")").attr('class','oneEvent');

            var oneEvent = d;
            var radius = width2b/5,
                max2 = d3.max(oneEvent, function(d){return d.time}),
                min2 = d3.min(oneEvent, function(d){return d.time}),
                speedSlower = d3.scaleLinear().domain([0,max2]).range([1000,10000]),
                scaleRCircles = d3.scaleLinear().range([(radius/3), radius]).domain([min2,max2]),
                scaleX3 = d3.scaleBand().rangeRound([(width2b/4), (3*(width2b/4)+radius*2)]).domain(["Male","Female"]),
                speedByTime3 = d3.scaleTime().domain([date1,date2]).range([100,10000]);

            sketchingEvents = plot2.select(".oneEvent")
                .selectAll(".event")
                .data(oneEvent);

            sketchingEvents
                .enter()
                .append("circle")
                .attr("class", function(d){
                    return "event"})
                .attr("r",0)
                .style("opacity",0.25)
                .style("stroke",function(d){return scaleColor2(d.sex)})
                .style("stroke-weight","0.5px")
                .style("fill","none")
                .attr("cx",width2b/2)
                .attr("cy",250)
                .transition()
                .duration(function(d){
                    return speedSlower((d.time))})
                .ease(d3.easeLinear)
                //.ease(d3.easeQuadInOut)
                .attr("r",function(d){return scaleRCircles(d.time)})
                .style("opacity",0.50)
                .style("stroke-weight","0.5px");

            //btns
            d3.selectAll('.btn').on('click',function(){
                var type = d3.select(this).attr('id');
                if (type=="sex"){
                    plot2.selectAll(".event")
                        .transition()
                        .duration(500)
                        .attr("r",function(d){return scaleRCircles(d.time)})
                        .attr("cx",function(d){return scaleX3(d.sex)})
                }else{
                    plot2.selectAll(".event")
                        .transition()
                        .duration(500)
                        .ease(d3.easeQuadInOut)
                        .attr("r",function(d){return scaleRCircles(d.time)})
                        .attr("cx",width2b/2)
                }
            })

        }

        function mouseOver2(d){
            var tooltip = d3.select(".custom-tooltip2");
            tooltip.select("#type").html(d.event);

            d3.select(".custom-tooltip2")
                .style("left",(scaleX2(d.event)-50)+"px")
                .style("top", 220 +"px")
        }
    }


}



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
    d3.select(".swimmer-list") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer)
}

