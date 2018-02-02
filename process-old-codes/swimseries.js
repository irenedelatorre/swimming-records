
d3.swimSeries = function(){
    var _dis = d3.dispatch('changeswimmer');

    var w = document.getElementById('sketch1').clientWidth,
        h = document.getElementById('sketch1').clientHeight,
        m ={t:50,r:50,b:200,l:100},
        chartW = w - m.l- m.r,
        chartH = h - m.t -m.b,
        scaleX = d3.scaleBand().rangeRound([0, w]),
        scaleY = d3.scaleLinear().rangeRound([h, 0]),
        scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
        events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"];

    function exports(_selection){
        var w = 800,
            h = 550,
            m ={t:50,r:50,b:200,l:100},
            chartW = w - m.l- m.r,
            chartH = h - m.t -m.b,
            scaleX = d3.scaleBand().rangeRound([0, chartW]),
            scaleY = d3.scaleLinear().rangeRound([chartH, 0]),
            scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
            events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"];
        _selection.each(draw);
    }

    function draw (data){

        //speed
        var max = d3.max(data, function(d){return d.time});
        var min = d3.min(data, function(d){return d.time});

        //y = always, speed dif. depending on TIME
        scaleY.domain([0,max]);
        scaleX.domain(events);

        speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);

        var date1 = new Date(1900,1,1);
        var date2 = new Date(2016,10,31);

        speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);

        var plot = d3.select(this).selectAll("svg").data([data]);

        var plotEnter = plot.enter()
            .append('svg') .attr('width',chartW).attr('height',chartH);

        //AXIS
        var axisX = d3.axisBottom()
            .scale(scaleX);

        var axisY = d3.axisLeft()
            .scale(scaleY);

        plotEnter.append('g').attr('transform','translate('+ m.l+','+ m.t+')').attr('class','axis axis-y');
        plotEnter.append('g').attr('transform','translate('+ m.l+','+ (m.t+h)+')').attr('class','axis axis-x');
        plotEnter.append('g').attr("transform","translate("+(m.l+26)+","+ m.t+")").attr('class','dots');

        plotEnter.select('.axis-x').transition().call(axisX)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

        plotEnter.select('.axis-y').transition().call(axisY);

        //swims
        var sketchingSwims = plotEnter.select(".dots")
            .selectAll(".swim")
            .data(data);

        sketchingSwims
            .enter()
            .append("circle")
            .attr("class", "swim")
            .attr("r",5)
            .style("fill",function(d){
                return scaleColor(d.sex)
            })
            .style("opacity",0)
            .attr("cx",function(d,i){
                if (d.sex=="Male"){
                    return scaleX(d.event)-5
                }else{return scaleX(d.event)+5}
            })
            .attr("cy",(chartH))
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

        //sketchingSwims.exit().remove();
        //
        //sketchingSwims
        //    .style("opacity",0)
        //    .attr("cx",function(d,i){
        //        if (d.sex=="Male"){
        //            return scaleX(d.event)-5
        //        }else{return scaleX(d.event)+5}
        //    })
        //    .attr("cy",(height))
        //    .transition()
        //    .style("opacity",0.50)
        //    .delay(function(d){return speedByTime(d.date)})
        //    .duration(500)
        //    .ease(d3.easeLinear)
        //    .attr("cx",function(d,i){
        //        if (d.sex=="Male"){
        //            return scaleX(d.event)-5
        //        }else{return scaleX(d.event)+5}
        //    })
        //    .attr("cy",function(d,i){
        //        return scaleY(d.time)
        //    });
    }
    exports.width = function(_x){
        if(!arguments.length) return w;

        w = _x;
        return this;
    };

    exports.height = function(_h){
        if(!arguments.length) return h;
        h = _h;
        return this;
    };

    return exports
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
