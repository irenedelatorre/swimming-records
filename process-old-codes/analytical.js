//canvas1
var margin = {t:50,r:50,b:200,l:50};
var width = document.getElementById('sketch1').clientWidth - margin.r - margin.l,
    height = document.getElementById('sketch1').clientHeight - margin.t - margin.b;

var canvas1 = d3.select('#sketch1');
var plot = canvas1
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b);

function drawAnalytical (err, rows, types, swimmers){
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
}