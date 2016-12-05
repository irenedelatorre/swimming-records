//canvas1
var margin = {t:50,r:50,b:50,l:55};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var plot = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

//MINIMENU
var margin2 = {t:5,r:0,b:5,l:0};
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
    formatYear = d3.timeFormat("%Y"),
    formatSpeed = d3.format(".2f"),
    scaleX = d3.scaleBand().range([0, width]),
    scaleY = d3.scaleLinear().range([height, 0]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);

typeDispatch = d3.dispatch('changeviz');
swimmerDispatch = d3.dispatch('changeswimmer');
swimmerDispatch2 = d3.dispatch('selectswimmer');


var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","4 x 100 m freestyle relay","4 x 100 m medley relay","800 m freestyle","4 x 200 m freestyle relay","1500 m freestyle"]

//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/20161106-swimming-times.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .await(draw1);

function draw1 (err, rows, types, swimmers) {

    d3.select(".type-list").on("change", function () {typeDispatch.call("changeviz", this, this.value);});
    d3.select(".swimmer-list").on("change", function () {swimmerDispatch.call("changeswimmer", this, this.value);});
    d3.select(".swimmer-list2").on("change", function () {swimmerDispatch2.call("selectswimmer", this, this.value);});

    var data = rows;

    //FILTERS
    var data = rows.sort(function(a,b){return a.date - b.date}),
        swims = crossfilter (data),
        swimsByEvent = swims.dimension(function(d){return d.event}),
        //swimsBySex = swims.dimension(function(d){return d.sex}),
        //swimsByContinent = swims.dimension(function(d){return d.continent}),
        // swimsByCountry = swims.dimension(function(d){return d.country}),
        // swimsByLocation = swims.dimension(function(d){return d.location}),
        swimsBySwimmer = swims.dimension(function(d){return d.name});

    var swimsSwimmer = swimsBySwimmer.filterAll().top(Infinity);

    //speed
    var max = d3.max(data, function(d){return d.time});
    var min = d3.min(data, function(d){return d.time});

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain([0,max]);
    scaleX = scaleX.domain(events).padding([25]) ;

    //LEGEND
    var expl = d3.select("#explanation2");

    expl2 = expl
        .append('svg')
        .attr('width',width+margin.r+margin.l)
        .attr('height',height + margin.t + margin.b);

    expl2.append('g').attr("transform","translate("+(margin2.l)+","+ (margin2.t)+")").attr('class','expl2');

    startExpl2 = expl2.select(".expl2");
    startExpl2
        .append("circle")
        .attr("class","expl1")
        .attr("r",0)
        .attr("cx",5)
        .attr("cy",10)
        .style("fill",scaleColor2("Male"))
        .transition()
        .duration(300)
        .attr("r",5)
        .style("opacity",0.5);

    startExpl2
        .append("circle")
        .attr("class","expl2")
        .attr("r",0)
        .attr("cx",95)
        .style("fill",scaleColor2("Female"))
        .attr("cy",10)
        .transition()
        .duration(100)
        .attr("r",5)
        .style("opacity",0.5);

    startExpl2.append("text").attr("class","textExpl2").attr("x",20).attr("y",15);
    startExpl2.append("text").attr("class","textExpl3").attr("x",110).attr("y",15);

    expl2.select(".textExpl2")
        .transition()
        .delay(100)
        .text("Men");

    expl2.select(".textExpl3")
        .transition()
        .delay(100)
        .text("Female");

    //AXIS
    var axisX = d3.axisBottom()
        .scale(scaleX);

    var axisY = d3.axisLeft()
        .scale(scaleY)
        .tickFormat(msToTime)
        .tickSizeInner(-width);

    plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','axis axis-y');
    plot.append('g').attr('transform','translate('+ margin.l+','+ (margin.t+height)+')').attr('class','axis axis-x');
    plot.append('g').attr("transform","translate("+(margin.l)+","+ margin.t+")").attr('class','dots');

    plot.select('.axis-x').transition().duration(500).call(axisX)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-65)"
        });

    plot.select('.axis-y').transition().duration(500).call(axisY);

    var speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);

    var date1 = new Date(1900,1,1);
    var date2 = new Date(2016,10,31);

    var speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);

    //SCATTERPLOT
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
        .on("start", function timer(d){d3.select("#timer").html(formatDate2(d.date))})
        .duration(500)
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

        var swimsSwimmer = swimsBySwimmer.filterAll();

        d3.select("#timer").html("");

        if (swimmer == "All") {
            drawDefault(swimsSwimmer);
        } else {
            swimsSwimmer = swimsBySwimmer.filter(swimmer).top(Infinity);
            var swimsNOTSelected = swimsBySwimmer.filter(function (d) {
                return d != swimmer
            }).top(Infinity);

            var name = swimsSwimmer[0].name,
                id = swimsSwimmer[0].id2,
                idNOT = swimsNOTSelected.map(function (d, i) {return d.id2}),
                dateExtent = d3.extent(swimsSwimmer.map(function (d) {return d.date})),
                max = d3.max(swimsSwimmer, function (d) {return d.time}),
                min = d3.min(swimsSwimmer, function (d) {return d.time});

            var date1 = dateExtent[0];
            var date2 = dateExtent[1];

            var speedByTime = d3.scaleTime().domain([date1, date2]).range([100, 500]);

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
                .attr("cx",function(d,i){
                    if (d.sex=="Male"){
                        return scaleX(d.event)-5
                    }else{return scaleX(d.event)+5}
                })
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
                .style("fill",function(d){return scaleColor2(d.sex)}) .attr("cx",function(d,i){
                    if (d.sex=="Male"){
                        return scaleX(d.event)-5
                    }else{return scaleX(d.event)+5}
                })
                .attr("cy",function(d,i){return scaleY(d.time)});
        }
    });

    function drawDefault (){

        d3.select("#timer").html("");

        //y = always, speed dif. depending on TIME
        scaleY = scaleY.domain([0,max]);
        scaleX = scaleX.domain(events);

        //AXIS
        var axisX = d3.axisBottom()
            .scale(scaleX);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickFormat(msToTime)
            .tickSizeInner(-width);

        plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','axis axis-y');
        plot.append('g').attr('transform','translate('+ margin.l+','+ (margin.t+height)+')').attr('class','axis axis-x');
        plot.append('g').attr("transform","translate("+(margin.l)+","+ margin.t+")").attr('class','dots');

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
            .duration(500)
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
        d3.select("#timer").html("");

        swimsCountry = d3.nest()
            .key(function (d) {
                return d.country
            })
            .sortKeys(d3.ascending)
            .entries(data);

        var extentRecords = d3.max(data.map(function (d) {
            return d.nCountry}));
        console.log(extentRecords);
        var countries = swimsCountry.map(function(d){return d.key});
        scaleX = scaleX.domain(countries);
        scaleY = scaleY.domain([0,extentRecords]);

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
            .attr("cx",function(d,i){return scaleX(d.country)})
            .attr("cy",function(d,i){return scaleY(d.nCountry)})
            .attr("r",3)
            .style("opacity",0.50)
            .style("fill",function(d){return scaleColor2(d.sex)});
    }

    function drawContinents (d){

        d3.select("#timer").html("");

        var swimsContinent = d3.nest()
            .key(function (d) {return d.continent})
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

        var xy = d3.mouse(document.getElementById("body"));
        var left = xy[0],
            top = xy[1];

        d3.select(".custom-tooltip1")
            .style("left", (left+40)+ "px")
            .style("top", top+ "px")
            .style("opacity",1);

    }

    function mouseout (d){
        d3.select(this).style("stroke","rgba(64, 224, 208, 0.05)");
    }

    //DRAW COMPETITIONS
    drawCompetitions(data);

    function drawCompetitions(d){
        var speedExtent = d3.extent(d.map(function (d) {return d.speed}));

        var speed = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
            scaleRMiniCircles = d3.scaleSqrt().range([10, 50]).domain(speedExtent),
            scaleX2 = d3.scaleBand().rangeRound([50, (width2)]).domain(events),
            scaleX2Axis = d3.scaleBand().range([10, (width2-50)]).domain(events),
            scaleX2Time = d3.scaleTime().domain([date1,date2]).range([0, width2-50]),
            showOnDate = d3.scaleTime().domain([date1,date2]).range([100,80000]);

        var expl = d3.select("#explanation");

        expl = expl
            .append('svg')
            .attr('width',width+margin.r+margin.l)
            .attr('height',height + margin.t + margin.b);

        expl.append('g').attr("transform","translate("+(margin2.l)+","+ (margin2.t)+")").attr('class','expl competitions');

        startExpl = expl.select(".expl");
        startExpl
            .append("circle")
            .attr("class","expl1")
            .attr("r",0)
            .attr("cx",190)
            .attr("cy",25)
            .style("stroke","white")
            .style("fill","rgba(255,255,255,0)")
            .style("stroke-width","1px")
            .style("opacity",("1"));

        startExpl
            .append("circle")
            .attr("class","expl2")
            .attr("r",0)
            .attr("cx",230)
            .attr("cy",25)
            .style("stroke","white")
            .style("fill","rgba(255,255,255,0)")
            .style("stroke-width","1px")
            .style("opacity",("1"));

        startExpl.append("text").attr("class","textExpl1").attr("x",245).attr("y",30);

        startExpl.append("text").attr("class","textExpl2").attr("x",25).attr("y",30);
        startExpl.append("text").attr("class","textExpl3").attr("x",100).attr("y",30);

        expl.select(".expl1")
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("r",25);

        expl.select(".expl2")
            .transition()
            .delay(2000)
            .duration(700)
            .attr("r",7);

        expl.select(".textExpl1")
            .transition()
            .delay(3000)
            .text("Area and speed of the circle in relation to speed (meters per second) of the record (the fastest the record, the bigger the circle)");

        startExpl
            .append("circle")
            .attr("class","expl1")
            .attr("cx",10)
            .attr("cy",25)
            .attr("r",0)
            .transition()
                .delay(4500)
                .duration(500)
            .attr("r",10)
            .style("stroke",scaleColor2("Male"))
            .style("stroke-width","1px")
            .style("fill","none")
            .style("opacity",("1"));

        startExpl
            .append("circle")
            .attr("class","expl2")
            .attr("cx",85)
            .attr("cy",25)
            .attr("r",0)
            .transition()
            .delay(4500)
            .duration(500)
            .attr("r",10)
            .style("stroke","white")
            .style("stroke",scaleColor2("Female"))
            .style("stroke-width","1px")
            .style("fill","none")
            .style("opacity",("1"));

        expl.select(".textExpl2")
            .transition()
            .delay(5000)
            .text("Men");

        expl.select(".textExpl3")
            .transition()
            .delay(5000)
            .text("Female");




        plotMiniMenu.append('g').attr("transform","translate("+(margin2.l)+","+ (margin2.t+100)+")").attr('class','axis axis-x competitions');
        plotMiniMenu.append('g').attr("transform","translate("+(margin2.l)+","+ margin2.t+")").attr('class','competition');
        plotMiniMenu.append('g').attr("transform","translate("+(margin2.l)+","+ margin2.t+")").attr('class','eventTitle');

        //AXIS
        var axisXMiniMenu = d3.axisBottom()
            .scale(scaleX2Time)
            .tickSize([20]);

        plotMiniMenu.select('.axis-x').transition().duration(500).call(axisXMiniMenu)

        sketchingRecords = plotMiniMenu.select(".competition")
            .selectAll(".swimrecords")
            .data(data);

        sketchingRecords
            .enter()
            .append("a")
            .attr("xlink:href", "#beginning")
            .append("circle")
            .attr("class", function(d){return "swimrecords " + d.id2 + " " + d.event})
            .attr("r",0)
            .style("stroke",function(d){return scaleColor2(d.sex)})
            .style("fill","rgba(255,255,255,0)")
            .style("stroke-width","1px")
            .style("opacity",1)
            .attr("cx",function(d,i){return scaleX2Time(d.date)})
            .attr("cy",100)
            .on("mouseover",mouseOverMiniMenu)
            .on("mousemove",mouseOverMiniMenu)
            .on("mouseout",mouseLeaveMiniMenu)
            .on("click",function(d){
                swimsByEvent.filterAll().top(Infinity);
                d3.select("#year").html("");
                plot2.select(".oneEvent").remove();

                var oneEvent = swimsByEvent.filter(d.event).top(Infinity).sort(function(a,b){return d3.ascending( a.date, b.date )});

                //swimEvent.sort(function(a,b){return d3.ascending( a.date, b.date )});
                //    //.on("end", drawEvents(swimEvent))
                drawEvents(oneEvent);

                d3.select("#eventTitle").html(d.event);
                d3.selectAll('.hideViz1').style("opacity",1)
            })
            .transition()
            .delay(5500)
            .transition()
            .delay(function(d){return showOnDate(d.date)})
            .duration(function(d){
                return speed((d.speed))})
            .ease(d3.easeQuadInOut)
            //.ease(d3.easeLinear)
            .style("stroke-width","0.5px")
            .style("opacity",0.5)
            .attr("r",function(d){
                return scaleRMiniCircles(d.speed)});

        //btns
        d3.selectAll('.clustering').on('click',function(){
            var type = d3.select(this).attr('id');
            if (type=="date1"){
                plotMiniMenu.selectAll(".swimrecords")
                    .on("mouseover",mouseOverMiniMenu)
                    .on("mousemove",mouseOverMiniMenu)
                    .on("mouseout",mouseLeaveMiniMenu)
                    .transition()
                    .duration(500)
                    .style("opacity",0.25)
                    .attr("r",function(d){
                        return scaleRMiniCircles(d.speed)})
                    .attr("cx",function(d,i){return scaleX2Time(d.date)})
                    .attr("cy",100);

                //AXIS
                var axisXMiniMenu = d3.axisBottom()
                    .scale(scaleX2Time)
                    .tickSize([20]);

                plotMiniMenu.select('.axis-x').transition().duration(500).call(axisXMiniMenu);

                d3.select(".custom-tooltip3")
                    .style("display","inherit");



            }if (type=="competition"){
                plotMiniMenu.selectAll(".swimrecords")
                    .on("mouseover",mouseOverMiniMenuComp)
                    .on("mousemove",mouseOverMiniMenuComp)
                    .on("mouseout",mouseLeaveMiniMenu)
                    .transition()
                    .duration(500)
                    .style("opacity",0.25)
                    .attr("r",function(d){
                        return scaleRMiniCircles(d.speed)})
                    .attr("cx",function(d,i){return scaleX2(d.event)})
                    .attr("cy",100);

                d3.select(".custom-tooltip3")
                    .style("display","none");

                //AXIS
                var axisXMiniMenu = d3.axisBottom()
                    .scale(scaleX2Axis)
                    .tickSize([0]);

                plotMiniMenu.select('.axis-x').transition().duration(500).call(axisXMiniMenu)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });
            }
        });

        //Events

        function mouseOverMiniMenu(d){
            d3.selectAll(".swimrecords").style("stroke-width","0.15px").style("opacity",0.2);
            d3.selectAll("."+d.id2).style("stroke-width","1px").style("opacity",1);
            d3.select(this).style("stroke","white").style("stroke-width","2px").style("opacity",1);

            var xy = d3.mouse(document.getElementById("miniMenu"));
            var left = xy[0],
                top = 40;

        //.style("padding-left",(radius*2-49/2)+"px")
        //        .style("margin-top",-(500)+"px");

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
                .style("margin-top", (height2+190) + "px")
                .style("opacity",1)
                .style("display","inherit");

            var tooltip = d3.select(".custom-tooltip3");
            tooltip.select("#swimmer3").html(d.name);
            tooltip.select("#country3").html(d.country);
            tooltip.select("#speed3").html(formatSpeed(d.speed) + " meters/second");
            tooltip.select("#time3").html(msToTime(d.time));
            tooltip.select("#date3").html(formatDate(d.date));
        }
        function mouseOverMiniMenuComp(d){
            //d3.selectAll(".swimrecords").style("stroke-width","0.15px").style("opacity",0.2);

            d3.select(this).style("stroke","white").style("stroke-width","2px").style("opacity",1);

            //d3.selectAll("." + d.event).style("stroke","white").style("stroke-width","2px").style("opacity",1);



            var tooltip = d3.select(".custom-tooltip3");
            tooltip.select("#swimmer3").html("");
            tooltip.select("#country3").html("");
            tooltip.select("#speed3").html("");
            tooltip.select("#time3").html("");
            tooltip.select("#date3").html("");
        }

        function mouseLeaveMiniMenu (d){
            d3.selectAll(".swimrecords").style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5)
        }

        swimmerDispatch2.on("selectswimmer", function(swimmer,i) {

            console.log(swimmer)
            if (swimmer == "All") {
                d3.selectAll(".swimrecords").style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5)
            } else {
                dataSwimmer = data.filter(function(d){if (d.name==swimmer){return d}})

                console.log(dataSwimmer)

                var id = dataSwimmer[0].id2;

                d3.selectAll(".swimrecords").style("stroke-width","0.15px").style("opacity",0.2);
                d3.selectAll("."+id).style("stroke-width","1px").style("opacity",1);

                var xy = d3.mouse(document.getElementById("miniMenu"));
                left = scaleX2Time(dataSwimmer[0].date);
                console.log(left)

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
                    .style("margin-top", (height2+190) + "px")
                    .style("opacity",1);

                var tooltip = d3.select(".custom-tooltip3");
                tooltip.select("#swimmer3").html(dataSwimmer[0].name);
                tooltip.select("#country3").html(dataSwimmer[0].country);
                tooltip.select("#speed3").html("");
                tooltip.select("#time3").html("");
                tooltip.select("#date3").html("");


            }
        });



        function drawEvents (d){
            var oneEvent = d;
            var speedExtent = d3.extent(oneEvent.map(function (d) {return d.speed}));
            var dateExtent = d3.extent(oneEvent.map(function (d) {return d.date}));

            var radius = (1024/5),
                speedSlower = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
                scaleRCircles = d3.scaleSqrt().range([(radius/3), radius]).domain(speedExtent),
                scaleX3 = d3.scaleBand().rangeRound([(scaleRCircles(speedExtent[1])), 3*(2*scaleRCircles(speedExtent[1]))]).domain(["Male","Female"]),
                scaleX3Axis = d3.scaleBand().rangeRound([(scaleRCircles(speedExtent[1]))-radius*1.5, 3*(2*scaleRCircles(speedExtent[1]))-radius*1.5]).domain(["Male","Female"]),
                speedByTime3 = d3.scaleTime().domain(dateExtent).range([100,20000]);

            plot2.append('g').attr("transform","translate("+(margin2.l)+","+ (margin2.t)+")").attr('class','oneEvent');

            sketchingEvents = plot2.select(".oneEvent")
                .selectAll(".event")
                .data(oneEvent);

            sketchingEvents
                .enter()
                .append("circle")
                .attr("class", function(d,i){
                    if (d[i]==d[oneEvent.lenght-1]){
                        return "event" + " lastevent"
                    }else{
                        return "event"
                    }
                    })
                .attr("r",(radius/3))
                .style("opacity",0)
                .style("stroke",function(d){return scaleColor2(d.sex)})
                .style("stroke-weight","0.5px")
                .style("fill","none")
                .attr("cx",radius*2)
                .attr("cy",210)
                .on("mouseover",mouseOverComp)
                .on("mousemove",mouseOverComp)
                .on("click",mouseOverComp)
                .on("mouseleave",mouseLeaveComp)
                //.on("click",mouseClick2)
                .transition()
                .duration(function(d){return speedSlower((d.speed))})
                .attr("r",function(d){return scaleRCircles(d.speed)})
                .delay(function(d){
                    return speedByTime3(d.date)})
                .ease(d3.easeLinear)

                .on("start",function timer (d){
                    //console.log(d);
                    d3.select("#year").html(formatYear(d.date))
                        .style("padding-left",(radius*2-49/2)+"px")
                        .style("margin-top",-(300)+"px");
                    d3.select(this).style("opacity",1)

                })
                .style("opacity",0.50);
                //


            sketchingEvents.exit().remove();

            plot2.selectAll(".bySex").remove();


            //btns
            d3.selectAll('.oneEvent').on('click',function(d){
                var type = d3.select(this).attr('id');
                if (type=="sex"){
                    plot2.selectAll(".event")
                        .transition()
                        .duration(500)
                        .attr("r",function(d){return scaleRCircles(d.speed)})
                        .attr("cx",function(d){return scaleX3(d.sex)})
                        .style("opacity",0.50);

                    plot2.append("text")
                        .attr("class","axis-x bySex")
                        .text("Male")
                        .attr("x",scaleX3("Male"))
                        .attr("y",460)
                        .style("text-anchor","middle");

                    plot2.append("text")
                        .attr("class","axis bySex")
                        .text("Female")
                        .attr("x",scaleX3("Female"))
                        .attr("y",460)
                        .style("text-anchor","middle");

                    var lastYear = (oneEvent[oneEvent.length-1].date);

                    d3.select("#year").html(formatYear(lastYear))
                        .transition()
                        .duration(500)
                        .ease(d3.easeQuadInOut)
                        .style("padding-left",(2*(scaleRCircles(speedExtent[1]))+40)+"px")
                        .style("margin-top",-(500)+"px");

                }if (type=="together"){
                    plot2.selectAll(".event")
                        .transition()
                        .duration(500)
                        .ease(d3.easeQuadInOut)
                        .attr("r",function(d){return scaleRCircles(d.speed)})
                        .attr("cx",radius*2)
                        .style("opacity",0.50);

                    plot2.selectAll(".bySex").remove();

                    var lastYear = (oneEvent[oneEvent.length-1].date);

                    d3.select("#year").html(formatYear(lastYear))
                        .transition()
                        .duration(500)
                        .ease(d3.easeQuadInOut)
                        .style("padding-left",(radius*2-49/2)+"px")
                        .style("margin-top",-(500)+"px");
                }
            })

            function mouseOverComp(d){
                d3.select(this).style("stroke","white").style("stroke-width","2px").style("opacity",1);
                d3.select("#year").html(formatYear(d.date))
                var xy = d3.mouse(document.getElementById("sketch2"));
                var left = xy[0],
                    top = xy[1];

                d3.select(".custom-tooltip2")
                    .style("left", (left+40)+ "px")
                    .style("top", top+ "px")
                    .style("opacity",1);

                var tooltip = d3.select(".custom-tooltip2");
                tooltip.select("#swimmer2").html(d.name);
                tooltip.select("#speed").html(formatSpeed(d.speed) + " meters/second");
                tooltip.select("#time2").html(msToTime(d.time));
                tooltip.select("#date2").html(formatDate(d.date));


            }
            function mouseLeaveComp (d){
                d3.select(this).style("stroke",function(d){return scaleColor2(d.sex)}).style("stroke-width","0.5px").style("opacity",0.5);
                var lastYear = (oneEvent[oneEvent.length-1].date);
                d3.select("#year").html(formatYear(lastYear));

                d3.select(".custom-tooltip2")
                    .style("opacity",0);
            }


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
        .attr("value", n.Swimmer);

    d3.select(".swimmer-list2") //class in the html file
        .append("option") //it has to be called this name
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);
}

