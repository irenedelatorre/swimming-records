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
//
//var canvas2 = d3.select('#eventPlot');
//var plot2 = canvas2
//    .append('svg')
//    .attr('width',widthb+margin.r+margin.l)
//    .attr('height',heightb + margin.t + margin.b);

//ANALYTICAL VIZ LEGEND
var expl2 = d3.select("#explanation2");

expl2 = expl2
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

var date1 = new Date(1900,1,1);
var date2 = new Date(2016,10,31);

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
    .defer(d3.csv,'data/20161106-swimming-times.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw1);

function draw1 (err, rows, types, swimmers) {

    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch.call("selectswimmer", this, this.value);});
    d3.select(".swimmer-list3").on("change", function () {swimmerDispatch2.call("selectswimmer2", this, this.value);});

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

        d3.select("#replayViz").html("Stop animation");

        d3.select('#replayViz').on('click',function(){
            if (btnControl==1){

                d3.selectAll(".swimrecords").remove();
                drawMiniMenu(data);

                d3.select("#replayViz").html("Stop animation");

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
                    if (left>1224 && left<1600){
                        return (left-25) + "px";
                    }if (left>1600){
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
                        if (left>1224){
                            return (left-25) + "px";
                        }if (left>1650){
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

            console.log(heightEvent)

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

    //function drawEvents (d){
    //
    //    var oneEvent = d;
    //    var dateExtent = d3.extent(oneEvent.map(function (d) {return d.date}));
    //
    //    var radius = (1024/5),
    //        speedSlower = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
    //        scaleRCircles = d3.scaleSqrt().range([(radius/3), radius]).domain(speedExtent),
    //        scaleX3 = d3.scaleBand().rangeRound([(scaleRCircles(speedExtent[1])), 3*(2*scaleRCircles(speedExtent[1]))]).domain(["Male","Female"]),
    //        scaleX3Axis = d3.scaleBand().rangeRound([(scaleRCircles(speedExtent[1]))-radius*1.5, 3*(2*scaleRCircles(speedExtent[1]))-radius*1.5]).domain(["Male","Female"]),
    //        speedByTime3 = d3.scaleTime().domain(dateExtent).range([100,20000]);
    //
    //
    //
    //    plot2.append('g').attr("transform","translate("+(margin.l)+","+ (margin.t)+")").attr('class','oneEvent');
    //
    //    sketchingEvents = plot2.select(".oneEvent")
    //        .selectAll(".event")
    //        .data(oneEvent);
    //
    //    sketchingEvents
    //        .enter()
    //        .append("circle")
    //        .attr("class", function(d,i){
    //            if (d[i]==d[oneEvent.lenght-1]){
    //                return "event" + " lastevent"
    //            }else{
    //                return "event"
    //            }
    //        })
    //        .attr("r",(radius/3))
    //        .style("opacity",0)
    //        .style("stroke",function(d){return scaleColor2(d.sex)})
    //        .style("stroke-weight","0.5px")
    //        .style("fill","none")
    //        .attr("cx",function(d){return scaleX3(d.sex)})
    //        .attr("cy",210)
    //        .on("mouseover",mouseOverComp)
    //        .on("mousemove",mouseOverComp)
    //        .on("click",mouseOverComp)
    //        .on("mouseleave",mouseLeaveComp)
    //        //.on("click",mouseClick2)
    //        .transition()
    //        .duration(function(d){return speedSlower((d.speed))})
    //        .attr("r",function(d){return scaleRCircles(d.speed)})
    //        .delay(function(d){
    //            return speedByTime3(d.date)})
    //        .ease(d3.easeLinear)
    //        .on("start",function timer (d){
    //            d3.select("#year").html(formatYear(d.date))
    //                .style("padding-left",(radius*2-49/2)+"px")
    //                .style("margin-top",-(300)+"px");
    //            d3.select(this).style("opacity",1)
    //
    //        })
    //        .style("opacity",0.5);
    //
    //
    //    sketchingEvents.exit().remove();
    //
    //    plot2.selectAll(".bySex").remove();
    //
    //    plot2.append("text")
    //        .attr("class","axis-x bySex")
    //        .text("Men")
    //        .attr("x",scaleX3("Male"))
    //        .attr("y",460)
    //        .style("text-anchor","middle");
    //
    //    plot2.append("text")
    //        .attr("class","axis bySex")
    //        .text("Women")
    //        .attr("x",scaleX3("Female"))
    //        .attr("y",460)
    //        .style("text-anchor","middle");
    //
    //
    //    //btns
    //    d3.selectAll('.oneEventBtn').on('click',function(d){
    //        var type = d3.select(this).select();
    //
    //        if (type=="sex"){
    //            d3.select("#sex").html("Combine genders")
    //            plot2.selectAll(".event")
    //                .transition()
    //                .duration(500)
    //                .attr("r",function(d){return scaleRCircles(d.speed)})
    //                .attr("cx",function(d){return scaleX3(d.sex)})
    //                .style("opacity",0.50);
    //
    //            plot2.append("text")
    //                .attr("class","axis-x bySex")
    //                .text("Men")
    //                .attr("x",scaleX3("Male"))
    //                .attr("y",460)
    //                .style("text-anchor","middle");
    //
    //            plot2.append("text")
    //                .attr("class","axis bySex")
    //                .text("Women")
    //                .attr("x",scaleX3("Female"))
    //                .attr("y",460)
    //                .style("text-anchor","middle");
    //
    //            var lastYear = (oneEvent[oneEvent.length-1].date);
    //
    //            d3.select("#year").html(formatYear(lastYear))
    //                .transition()
    //                .duration(500)
    //                .ease(d3.easeQuadInOut)
    //                .style("padding-left",(2*(scaleRCircles(speedExtent[1]))+40)+"px")
    //                .style("margin-top",-(300)+"px");
    //
    //        }if (type=="together"){
    //            plot2.selectAll(".event")
    //                .transition()
    //                .duration(500)
    //                .ease(d3.easeQuadInOut)
    //                .attr("r",function(d){return scaleRCircles(d.speed)})
    //                .attr("cx",radius*2)
    //                .style("opacity",0.50);
    //
    //            plot2.selectAll(".bySex").remove();
    //
    //            var lastYear = (oneEvent[oneEvent.length-1].date);
    //
    //            d3.select("#year").html(formatYear(lastYear))
    //                .transition()
    //                .duration(500)
    //                .ease(d3.easeQuadInOut)
    //                .style("padding-left",(radius*2-49/2)+"px")
    //                .style("margin-top",-(300)+"px");
    //        }
    //    })
    //
    //    function mouseOverComp(d){
    //        d3.select(this).style("stroke","white").style("stroke-width","2px").style("opacity",1);
    //        d3.select("#year").html(formatYear(d.date))
    //        var xy = d3.mouse(document.getElementById("sketch"));
    //        var left = xy[0],
    //            top = xy[1];
    //
    //        d3.select(".custom-tooltip2")
    //            .style("left", (left+40)+ "px")
    //            .style("top", top+ "px")
    //            .style("opacity",1);
    //
    //        var tooltip = d3.select(".custom-tooltip2");
    //        tooltip.select("#swimmer2").html(d.name);
    //        tooltip.select("#speed").html(formatSpeed(d.speed) + " meters/second");
    //        tooltip.select("#time2").html(msToTime(d.time));
    //        tooltip.select("#date2").html(formatDate(d.date));
    //
    //
    //    }
    //    function mouseLeaveComp (d){
    //        d3.select(this).style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5);
    //        var lastYear = (oneEvent[oneEvent.length-1].date);
    //        d3.select("#year").html(formatYear(lastYear));
    //
    //        d3.select(".custom-tooltip2")
    //            .style("opacity",0);
    //    }
    //
    //
    //}
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
