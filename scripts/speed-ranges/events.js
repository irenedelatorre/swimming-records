//MINIMENU
var margin = {t:5,r:0,b:5,l:0};
var width = d3.select('#miniMenu').node().clientWidth - margin.r - margin.l,
    height = d3.select('#miniMenu').node().clientHeight - margin.t - margin.b;

var canvasMiniMenu = d3.select('#miniMenu');

var plotMiniMenu = canvasMiniMenu
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

var widthb = d3.select('#eventPlot').node().clientWidth - margin.r - margin.l,
    heightb = d3.select('#eventPlot').node().clientHeight - margin.t - margin.b;

//ANALYTICAL VIZ LEGEND
var expl2 = d3.select("#explanation2");

expl2 = expl2
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

var formatDate = d3.timeFormat("%B %d, %Y"),
    formatDate2 = d3.timeFormat("%b %d, %Y"),
    formatYear = d3.timeFormat("%Y"),
    formatSpeed = d3.format(".2f"),
    scaleX = d3.scaleBand().range([0, width]),
    scaleY = d3.scaleLinear().range([height, 0]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);


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
    .await(draw1);

function draw1 (err, rows, types, swimmers) {

    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch.call("selectswimmer", this, this.value);});
    d3.select(".swimmer-list3").on("change", function () {swimmerDispatch2.call("selectswimmer2", this, this.value);});


    var date1and2 = d3.extent(rows.map(function (d) {return d.date}));

    var date1 = date1and2[0];
    var date2 = date1and2[1];

    var data = rows;


    //FILTERS
    var data = rows.sort(function(a,b){return a.date - b.date}),
        swims = crossfilter (data),
        swimsByEvent = swims.dimension(function(d){return d.event}),
        swimsBySwimmer = swims.dimension(function(d){return d.name});

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});

    //date
    var dateExtent = d3.extent(data.map(function (d) {return d.date}));

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain([0,max]);
    scaleX = scaleX.domain(events).padding([25]) ;

    var speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);
    var speedByTime = d3.scaleTime().domain([date1,date2]).range([100,30000]);
    var speedExtent = d3.extent(data.map(function (d) {return d.speed}));

    //DRAW COMPETITIONS
    drawCompetitions(data);

    function drawCompetitions(d){

        var speed = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
            scaleRMiniCircles = d3.scaleSqrt().range([10, 50]).domain(speedExtent),
            scaleX2 = d3.scaleBand().rangeRound([50, (width-50)]).domain(events).padding([50]),
            scaleX2Axis = d3.scaleBand().range([50, (width-50)]).domain(events).padding([50]),
            scaleX2Time = d3.scaleTime().domain([date1,date2]).range([50, width-50]),
            showOnDate = d3.scaleTime().domain([date1,date2]).range([100,40000]);

        plotMiniMenu.append('g').attr("transform","translate("+(margin.l)+","+ (margin.t+100)+")").attr('class','axis axis-x axis-xCompetitions');
        plotMiniMenu.append('g').attr("transform","translate("+(margin.l)+","+ margin.t+")").attr('class','competition');
        plotMiniMenu.append('g').attr("transform","translate("+(margin.l)+","+ margin.t+")").attr('class','eventTitle');

        //AXIS
        var axisXMiniMenu = d3.axisBottom()
            .scale(scaleX2Time)
            .tickSize([20]);

        plotMiniMenu.select('.axis-x').transition().duration(500).call(axisXMiniMenu);

        drawMiniMenu(data);

        d3.select("#replayViz").html("Finish animation");

        d3.select('#replayViz').on('click',function(){
            if (btnControl==1){

                d3.selectAll(".swimrecords").remove();
                drawMiniMenu(data);

                d3.select("#replayViz").html("Finish animation");

                btnControl = 0;

            }else {

                d3.selectAll(".swimrecords")
                    .transition()
                    .duration(300)
                    .style("stroke-width","0.5px")
                    .style("opacity",0.5)
                    .attr("r",function(d){
                        return scaleRMiniCircles(d.speed)});

                d3.select("#replayViz").html("Replay animation");

                btnControl = 1;
            }
        });

        function drawMiniMenu (){

            sketchingRecords = plotMiniMenu.select(".competition")
                .selectAll(".swimrecords")
                .data(data);

            sketchingRecords
                .enter()
                .append("a")
                //.attr("xlink:href", "#speedVizbeginning")
                .append("circle")
                .attr("class", function(d){return "swimrecords " + d.id2 + " " + d.event})
                .attr("r",0)
                .style("stroke",function(d){return scaleColor2(d.sex)})
                .style("fill","rgba(255,255,255,0)")
                .style("stroke-width","1px")
                .style("opacity",1)
                .attr("cx",function(d,i){return scaleX2Time(d.date)})
                //.attr("cx",function(d,i){return scaleX2(d.event)})
                .attr("cy",100)
                .on("mouseover",mouseOverMiniMenu)
                .on("mousemove",mouseOverMiniMenu)
                .on("mouseout",mouseLeaveMiniMenu)
                .on("click",function(d){
                    swimsByEvent.filterAll().top(Infinity);
                    d3.select("#year").html("");
                    plot2.select(".oneEvent").remove();

                    var oneEvent = swimsByEvent.filter(d.event).top(Infinity).sort(function(a,b){return d3.ascending( a.date, b.date )});

                    drawEvents(oneEvent);

                    d3.select("#eventTitle").html(d.event);
                    d3.selectAll('.hideViz1').style("opacity",1)
                })
                .transition()
                .duration(500)
                .transition()
                .delay(function(d){return showOnDate(d.date)})
                //.duration(function(d){return speed((d.speed))})
                .duration(3000)
                .ease(d3.easeQuadInOut)
                //.ease(d3.easeLinear)
                .style("stroke-width","0.5px")
                .style("opacity",0.5)
                .attr("r",function(d){
                    return scaleRMiniCircles(d.speed)});
        }

        //Minimenu tooltip
        function mouseOverMiniMenu(d){
            d3.selectAll(".swimrecords").style("stroke-width","0.15px").style("opacity",0.2);
            d3.selectAll("."+d.id2).style("stroke-width","1px").style("opacity",1);
            d3.select(this).style("stroke","white").style("stroke-width","2px").style("opacity",1);

            var xy = d3.mouse(document.getElementById("miniMenu"));
            var left = xy[0],
                top = 40;

            d3.select(".custom-tooltip3")
                .style("left",function(){
                    if (left>1224 && left<1500){
                        return (left-25) + "px";
                    }if (left>1500){
                        return (width-200) + "px"
                    }
                    else{
                        return (left+50) + "px"
                    }
                })
                .style("margin-top", (height+190) + "px")
                .style("opacity",1)
                .style("display","inherit");

            var tooltip = d3.select(".custom-tooltip3");
            tooltip.select("#swimmer3").html(d.name);
            tooltip.select("#country3").html(d.country);
            tooltip.select("#speed3").html("Speed: " + formatSpeed(d.speed) + " meters/second");
            tooltip.select("#time3").html("Total time: " + msToTime(d.time));
            tooltip.select("#date3").html("Record broken on " + formatDate(d.date));

        }

        function mouseLeaveMiniMenu (d){
            d3.selectAll(".swimrecords").style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5)

            var tooltip = d3.select(".custom-tooltip3");
            tooltip.select("#swimmer3").html("");
            tooltip.select("#country3").html("");
            tooltip.select("#speed3").html("");
            tooltip.select("#time3").html("");
            tooltip.select("#date3").html("");
        }

        //highlight a swimmer
        swimmerDispatch.on("selectswimmer", function(swimmer,i) {

            if (swimmer == "All swimmers") {
                d3.selectAll(".swimrecords").style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5)
            } else {
                dataSwimmer = data.filter(function(d){if (d.name==swimmer){return d}})

                var id = dataSwimmer[0].id2;

                d3.selectAll(".swimrecords").style("stroke-width","0.15px").style("opacity",0.2);
                d3.selectAll("."+id).style("stroke-width","1px").style("opacity",1);

                var xy = d3.mouse(document.getElementById("miniMenu"));
                left = scaleX2Time(dataSwimmer[0].date);

                d3.select(".custom-tooltip3")
                    .style("left",function(){
                        if (left>(10*(width/12))){
                            return (left-25) + "px";
                        }if (left>(11*(width/12))){
                            return (1650) + "px"
                        }
                        else{
                            return (left+50) + "px"
                        }
                    })
                    .style("margin-top", (height+190) + "px")
                    .style("opacity",1);

                var tooltip = d3.select(".custom-tooltip3");
                tooltip.select("#swimmer3").html(dataSwimmer[0].name);
                tooltip.select("#country3").html(dataSwimmer[0].country);
                tooltip.select("#speed3").html("");
                tooltip.select("#time3").html("");
                tooltip.select("#date3").html("");

            }
        });

    }

    //small events
    var nestedEvents = d3.nest()
        .key(function (d) {
            return event = d.event
        })
        .sortKeys(function(a,b){
            return events.indexOf(a) - events.indexOf(b)
        })
        .sortValues(function(a,b){
            return a.date - b.date})
        .entries(data);

    var drawEvents = d3.select(".eventPlot")
        .selectAll(".event")
        .data(nestedEvents);

    drawEvents = drawEvents
        .enter()
        .append('div')
        .attr('class', 'event col-md-3');

    drawEvents
        .each(function (d, i) {

            var modality = d.values;

            var widthEvent = d3.select(this).node().clientWidth - margin.r - margin.l,
                heightEvent = d3.select(this).node().clientHeight - margin.t - margin.b;

            var eventSeries = d3.eventSeries()
                .width(widthEvent)
                .height(widthb/4)
                .radius([widthEvent/10,widthEvent/2])
                .speedExtent(speedExtent)
                .dateExtent(dateExtent)
                .womenColor("#AD1BEA")
                .menColor("#0CA3B9")
                .eventNames(eventNames);

            d3.select(this)
                .datum(d.values)
                .call(eventSeries)
            ;
        });

    //highlight a swimmer
    swimmerDispatch2.on("selectswimmer2", function(swimmer,i) {

        if (swimmer == "All swimmers") {
            d3.selectAll(".recordSpeeds").style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5)
        } else {
            dataSwimmer = data.filter(function(d){if (d.name==swimmer){return d}})

            var id = dataSwimmer[0].id2;

            d3.selectAll(".recordSpeeds").style("stroke-width","0.15px").style("opacity",0.2);
            d3.selectAll("."+id).style("stroke-width","1px").style("opacity",1);

        }
    });

    //highlight sexes
    d3.select("#showAll").classed("showActive",true);

    d3.select('#showMen').on('click',function(){
        d3.select("#showMen").classed("showActive",true);
        d3.select("#showWomen").classed("showActive",false);
        d3.select("#showAll").classed("showActive",false);

        d3.selectAll(".recordSpeeds").style("stroke-width","0.15px").style("opacity",0.2);
        d3.selectAll(".eventMale").style("stroke-width","0.5px").style("opacity",1);

    });

    d3.select('#showWomen').on('click',function(){
        d3.select("#showMen").classed("showActive",false);
        d3.select("#showWomen").classed("showActive",true);
        d3.select("#showAll").classed("showActive",false);

        d3.selectAll(".recordSpeeds").style("stroke-width","0.15px").style("opacity",0.2);
        d3.selectAll(".eventFemale").style("stroke-width","0.5px").style("opacity",1);

    });

    d3.select('#showAll').on('click',function(){
        d3.select("#showMen").classed("showActive",false);
        d3.select("#showWomen").classed("showActive",false);
        d3.select("#showAll").classed("showActive",true);

        d3.selectAll(".recordSpeeds").style("stroke-width","0.5px").style("opacity",0.5);

    });

    d3.select('#up').on('click',function(){
        $("html, body").animate({
            scrollTop: ($("#body").offset().top)
        }, 500);
    });

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
    d3.select(".swimmer-list2") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);

    d3.select(".swimmer-list3") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);
}
