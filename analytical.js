//canvas1
var margin = {t:0,r:50,b:140,l:65};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var plot = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

//legend
var margin2 = {t:5,r:5,b:5,l:0};
var expl2 = d3.select("#explanation2");

expl2 = expl2
    .append('svg')
    .attr('width',width+margin2.r+margin2.l)
    .attr('height',height + margin2.t + margin2.b);

var date1 = new Date(1900,1,1);
var date2 = new Date(2016,10,31);

var formatDate = d3.timeFormat("%B %d, %Y"),
    formatDate2 = d3.timeFormat("%b %d, %Y"),
    formatYear = d3.timeFormat("%Y"),
    formatSpeed = d3.format(".2f"),
    scaleX = d3.scaleBand().range([0, width]),
    scaleY = d3.scaleLinear().range([height, 15]),
    scaleColor2 = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]);

typeDispatch = d3.dispatch('changeviz');
swimmerDispatch = d3.dispatch('changeswimmer');
eventDispatch = d3.dispatch('selectEvent');


var events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","4 x 100 m freestyle relay","4 x 100 m medley relay","800 m freestyle","4 x 200 m freestyle relay","1500 m freestyle"]

//TODO: import data, parse, and draw
//d3.csv("data/20161106-swimming-times.csv", parseData, draw1);

var queue = d3_queue.queue()
    .defer(d3.csv,'data/data.csv',parseData)
    .defer(d3.csv,'data/metadata.csv',parseType)
    .defer(d3.csv,'data/swimmer-metadata.csv',parseSwimmer)
    .defer(d3.csv,'data/events-metadata.csv',parseEvents)
    .await(draw1);

function draw1 (err, rows, types, swimmers, listofevents) {

    d3.select("#analyticalViz").on("click",showAnalyticalViz);

    d3.select(".type-list").on("change", function () {typeDispatch.call("changeviz", this, this.value);});
    d3.select(".swimmer-list").on("change", function () {swimmerDispatch.call("changeswimmer", this, this.value);});
    d3.select(".event-list").on("change", function () {eventDispatch.call("selectEvent", this, this.value);});

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

    //y = always, speed dif. depending on TIME
    scaleY = scaleY.domain([0,max]);
    scaleX = scaleX.domain(events).padding([25]) ;

    var speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);
    var speedByTime = d3.scaleTime().domain([date1,date2]).range([100,5000]);

    showAnalyticalViz(data)

    function showAnalyticalViz(){

        //LEGEND
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
            .text("Women");

        //AXIS
        var axisX = d3.axisBottom()
            .scale(scaleX);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickFormat(msToTime)
            .tickSizeInner(-width);

        plot.append('g').attr('transform','translate('+ margin.l+','+ margin.t+')').attr('class','axis axis-yDots axis-y');
        plot.append('g').attr('transform','translate('+ margin.l+','+ (margin.t+height)+')').attr('class','axis axis-xDots axis-x');
        plot.append('g').attr("transform","translate("+(margin.l)+","+ margin.t+")").attr('class','dots');

        //console.log(margin2.l/)

        plot.select('.axis-x').transition().duration(500).call(axisX)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

        plot.select('.axis-y').transition().duration(500).call(axisY);

        console.log(data.event)
        events.forEach(function (e) {
            if (e.event == data.event) {
                return stateAbv = e.abv
            }
        });

        //SCATTERPLOT
        sketchingSwims = plot.select(".dots")
            .selectAll(".swim")
            .data(data);

        sketchingSwims
            .enter()
            .append("circle")
            .attr("class", function(d){
                listofevents.forEach(function (e) {
                    if (e.event == d.event) {
                        return id = e.id
                    }
                });
                return "swim " + d.id2 + " " + id
            })
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
            .duration(100)
            .ease(d3.easeLinear)
            .attr("cx",function(d,i){
                if (d.sex=="Male"){
                    return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
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

        var lastDate = formatDate2(new Date(2016,10,31));


        //dispatch function
        swimmerDispatch.on("changeswimmer", function(swimmer,i) {

            var form = document.getElementById("sorting");
            var formValue = form.options[form.selectedIndex].text;
            form.selectedIndex=0;

            var form2 = document.getElementById("event-list");
            var formValue2 = form2.options[form2.selectedIndex].text;
            form2.selectedIndex=0;

            d3.select("#timer").html(lastDate);

            var swimsSwimmer = swimsBySwimmer.filterAll();

            if (swimmer == "All swimmers") {
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

                scaleY.domain([(0),max]);
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
                            return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                        }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
                    })
                    .attr("cy",function(d,i){return scaleY(d.time)})
                    .attr("r",1).style("opacity",0.1)
                    .style("fill",function(d){return scaleColor2(d.sex)});

                plot.selectAll("." + id)
                    .attr("r",4)
                    .style("opacity",0.52)
                    .style("fill","white")
                    .transition()
                    .duration(2000)
                    .ease(d3.easeQuadInOut)
                    .style("opacity",0.75)
                    .style("fill",function(d){return scaleColor2(d.sex)})
                    .attr("cx",function(d,i){
                        if (d.sex=="Male"){
                            return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                        }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
                    })
                    .attr("cy",function(d,i){return scaleY(d.time)});
            }
        });

        //dispatch function 2
        eventDispatch.on("selectEvent", function(event,i) {

            var form = document.getElementById("sorting");
            var formValue = form.options[form.selectedIndex].text;
            form.selectedIndex=0;

            var form2 = document.getElementById("swimmer-list");
            var formValue2 = form2.options[form2.selectedIndex].text;
            form2.selectedIndex=0;

            d3.select("#timer").html(lastDate);

            var swimsSwimmer = swimsBySwimmer.filterAll();

            if (event == "All events") {
                drawDefault(swimsSwimmer);
            } else {
                var eventSwims = swimsByEvent.filter(event).top(Infinity);
                var eventsNOTSelected = swimsByEvent.filter(function (d) {
                    return d != event
                }).top(Infinity);

                listofevents.forEach(function (e) {
                    if (e.event == eventSwims[0].event) {
                        return id = e.id
                    }
                });

                var name = eventSwims[0].event,
                    dateExtent = d3.extent(eventSwims.map(function (d) {return d.date})),
                    max = d3.max(eventSwims, function (d) {return d.time}),
                    min = d3.min(eventSwims, function (d) {return d.time});

                var date1 = dateExtent[0];
                var date2 = dateExtent[1];

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
                    .attr("r",1).style("opacity",0.1)
                    .style("fill",function(d){return scaleColor2(d.sex)});

                plot.selectAll("." + id)
                    .attr("r",4)
                    .style("opacity",0.52)
                    .style("fill","white")
                    .transition()
                    .duration(2000)
                    .ease(d3.easeQuadInOut)
                    .style("opacity",0.75)
                    .style("fill",function(d){return scaleColor2(d.sex)})
                    .attr("cx",function(d,i){
                        if (d.sex=="Male"){
                            return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                        }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
                    })
                    .attr("cy",function(d,i){return scaleY(d.time)});
            }
        });

        function drawDefault (){

            d3.select("#timer").html(lastDate);

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

            //speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);

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
                        return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                    }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
                })
                .attr("cy",(height))
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
                .duration(500)
                .attr("r",3)
                .style("opacity",0.52)
                .attr("cx",function(d,i){
                    if (d.sex=="Male"){
                        return scaleX(d.event)-8+(Math.random()* (3 + 0.5) - 0.5);
                    }else{return scaleX(d.event)+8+(Math.random()* (3 + 0.5) - 0.5);}
                })
                .attr("cy",function(d,i){
                    return scaleY(d.time)
                });
        }

        function drawCountries (d){
            d3.select("#timer").html(lastDate);

            swimsCountry = d3.nest()
                .key(function (d) {
                    return d.country
                })
                .sortKeys(d3.ascending)
                .entries(data);

            var extentRecords = d3.max(data.map(function (d) {return d.nCountry}));
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
                .attr("cx",function(d,i){return scaleX(d.country)+(Math.random()* (3 + 0.5) - 0.5)})
                .attr("cy",function(d,i){return scaleY(d.nCountry)})
                .attr("r",3)
                .style("opacity",0.50)
                .style("fill",function(d){return scaleColor2(d.sex)});
        }

        function drawContinents (d){

            d3.select("#timer").html(lastDate);

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
                .attr("cx",function(d,i){return (scaleX(d.continent)+(Math.random()* (3 + 0.5) - 0.5))})
                .attr("cy",function(d,i){return scaleY(d.nContinent)})
                .attr("r",3)
                .style("opacity",0.50)
                .style("fill",function(d){return scaleColor2(d.sex)});
        }

        function mousemove(d){
            d3.select(this).style("stroke","white").style("stroke-width","2px");

            var tooltip = d3.select(".custom-tooltip1");

            tooltip.select("#swimmer").html(d.name);
            tooltip.select("#country").html((d.country));
            tooltip.select("#date").html(formatDate(d.date));
            tooltip.select("#time").html(msToTime(d.time));

            var xy = d3.mouse(document.getElementById("sketch1"));
            var left = xy[0],
                top = xy[1];

            d3.select(".custom-tooltip1")
                .style("left", function(){
                    if (left>(11*(width/12))){
                        return (left-200)+ "px";
                    }else{
                        return (left+50 )+ "px";
                    }
                })
                .style("top", (top) + "px")
                .style("display","inherit");
        }

        function mouseout (d){d3.select(this).style("stroke","rgba(64, 224, 208, 0.05)");}
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
    d3.select(".type-list")
        .append("option")
        .html(n.type)
        .attr("value", n.type)
}

function parseSwimmer(n){
    d3.select(".swimmer-list")
        .append("option")
        .html(n.Swimmer + " (" + n.records + ")")
        .attr("value", n.Swimmer);
}

function parseEvents(n){
    d3.select(".event-list")
        .append("option")
        .html(n.Event + " (" + n.Number + ")")
        .attr("value", n.Event);

    return {
        event: n.Event,
        id: n.id,
    }
}
