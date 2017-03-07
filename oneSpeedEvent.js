d3.eventSeries = function(){
    var w,
        h,
        m = {t:5,r:0,b:5,l:0};
        chartW = w - m.l - m.r,
        chartH = h - m.t - m.b,
        radius = [],
        speedExtent = [],
        dateExtent = [],
        eventNames = [],
        scaleRCircles = d3.scaleSqrt().range([radius]).domain(speedExtent),
        speedSlower = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
        speedByTime3 = d3.scaleTime().domain(dateExtent).range([100,10000]),
        womenColor = "red",
        menColor = "blue",
        valueAccessor = function(d){ return d;};

    function exports(_selection){
            w,
            h,
            m = {t:5,r:0,b:5,l:0};
            chartW = w - m.l - m.r,
            chartH = h - m.t - m.b,
            radius = 100,
            scaleRCircles = d3.scaleSqrt().range([(radius/3), radius]).domain(speedExtent);
            speedSlower = d3.scaleLinear().domain(speedExtent).range([1000,5000]),
            speedByTime3 = d3.scaleTime().domain(dateExtent).range([100,10000]),

        _selection.each(draw);
    }

    function draw (d){

        var svg = d3.select(this).selectAll('svg')
            .data([d]);

        var distanceTitle = d3.extent(d.map(function (d) {return d.event}));
        var speedRange = d3.extent(d.map(function (d) {return d.speed}));
        var numberRecords = d.length;

        var svgEnter = svg.enter().append('svg').attr("class","row");

        svgEnter.append('g').attr('class','oneEvent').attr('transform','translate('+m.l+','+(40)+')');

        svgEnter.append('text')
            .text(distanceTitle[0])
            .attr("class","event-names")
            .style("text-anchor","left")
            .attr("y",20)
            .attr("x",0);

        console.log(distanceTitle)

        if (distanceTitle[0]=="4 x 100 m freestyle relay" || distanceTitle[0]=="4 x 100 m medley relay" || distanceTitle[0]=="4 x 200 m freestyle relay" || distanceTitle[0]=="4 x 200 m medley relay" ){
            console.log("hello")
            svgEnter.append('text')
                .text("Records: "+(numberRecords/4))
                .attr("class","legend")
                .style("text-anchor","left")
                .attr("y",15+40)
                .attr("x",0);
        }else{
            svgEnter.append('text')
                .text("Records: "+numberRecords)
                .attr("class","legend")
                .style("text-anchor","left")
                .attr("y",15+40)
                .attr("x",0);
        }

        svgEnter.select(".oneEvent").append('text')
            .text(formatSpeed(speedRange[0])+ " m/s")
            .attr("class","speedTick")
            .style("text-anchor","middle")
            .attr("y",(chartH/2+30))
            .attr("x",(chartW/2));

        svgEnter.select(".oneEvent").append('text')
            .text(formatSpeed(speedRange[1])+ "m/s")
            .attr("class","speedTick")
            .style("text-anchor","middle")
            .attr("y",15)
            .attr("x",(chartW/2));

        svgEnter.select(".oneEvent").append("line")
            .attr("x1",(chartW/2))
            .attr("x2",(chartW/2))
            .attr("y1",25)
            .attr("y2",(chartH/2)+5)
            .attr("class","tick-speed");


        sketchingEvents = svgEnter.select(".oneEvent")
            .selectAll(".modality")
            .data(d);

        sketchingEvents
            .enter()
            .append("circle")
            .attr("class", function(d,i){
                return "event"+d.sex + " " + d.id2 + " event recordSpeeds modality"
            })
            .style("opacity",0)
            .style("stroke",function(d){if (d.sex=="Female"){return womenColor}else{return menColor}})
            .style("stroke-width","0.5px")
            .style("fill","none")
            .attr("cx",(chartW/2))
            .attr("cy",function(d){
                return chartH/2+ m.t-scaleRCircles(d.speed)})
            .attr("r",function(d){
                return scaleRCircles(d.speed)})
            .transition()
            .duration(function(d){return speedSlower(d.speed)})
            .ease(d3.easeLinear)
            .style("opacity",0.5);
    }

    //Getter and setter
    exports.width = function(_v){
        if(!arguments.length) return w;
        w = _v;
        return this;
    };
    exports.radius = function(_r){
        if(!arguments.length) return radius;
        radius = _r;
        return this;
    };
    exports.height = function(_v){
        if(!arguments.length) return h;
        h = _v;
        return this;
    };
    exports.speedExtent = function(_s){
        if(!arguments.length) return speedExtent;
        speedExtent = _s;
        return this;
    };
    exports.dateExtent = function(_d){
        if(!arguments.length) return dateExtent;
        dateExtent = _d;
        return this;
    };
    exports.eventNames = function(_e){
        if(!arguments.length) return eventNames;
        eventNames = _e;
        return this;
    };
    exports.womenColor = function(_w){
        if(!arguments.length) return womenColor;
        womenColor = _w;
        return this;
    };
    exports.menColor = function(_m){
        if(!arguments.length) return menColor;
        menColor = _m;
        return this;
    };

    exports.value = function(_v){
        if(!arguments.length) return layout.value();
        valueAccessor = _v;
        layout.value(_v);
        return this;
    };

    return exports;
}
