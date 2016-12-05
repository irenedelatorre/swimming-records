
d3.recordSeries = function(){
    var _dis = d3.dispatch('seeingevents');

    var w = 500,
        h = 300,
        m ={t:0,r:0,b:0,l:0},
        chartW = w - m.l- m.r,
        chartH = h - m.t -m.b,
        max,
        min = 0,
        maxR = 50000;
        scaleX = d3.scaleLinear().range([1, maxR]).domain([0,max]),
        scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
        events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"];

    function exports(_selection){
        var w,
            h,
            m ={t:5,r:5,b:5,l:5},
            chartW = w - m.l- m.r,
            chartH = h - m.t -m.b,
            max,
            scaleX = d3.scaleLinear().range([1, maxR]).domain([0,max]),
            scaleColor = d3.scaleOrdinal().domain(["Female","Male"]).range(["#AD1BEA","#0CA3B9"]),
            events = ["50 m freestyle","50 m backstroke","50 m breaststroke","50 m butterfly","100 m freestyle","100 m backstroke","100 m breaststroke","100 m butterfly","200 m freestyle","200 m backstroke","200 m breaststroke","200 m butterfly","200 m individual medley","400 m freestyle","400 m individual medley","800 m freestyle","1500 m freestyle","4 x 100 m freestyle relay","4 x 200 m freestyle relay","4 x 100 m medley relay"];

        _selection.each(draw);
    }

    function draw (data){

        speed = d3.scaleLinear().domain([min,max]).range([50000,max/3]);

        var date1 = new Date(1900,1,1);
        var date2 = new Date(2016,10,31);

        speedByTime = d3.scaleTime().domain([date1,date2]).range([100,80000]);

        var svg = d3.select(this).selectAll("svg").data([data]);

        var svgEnter = svg.enter()
            .append('svg')
            .attr('width',chartW).attr('height',chartH);

        svgEnter.append('g')
            .attr('class','records');

        var records = svgEnter.select(".records").selectAll(".swimrecords").data(data);

        records.enter()
            .append("circle")
            .attr("class", function(d){
                //console.log(d);
                return "swimrecords " + d.id2})
            .attr("r",function(d){
                console.log(d.time + " " + max);
                return (scaleX2(d.time))})
            .style("stroke",function(d){return scaleColor2(d.sex)})
            .style("fill","none")
            .attr("cx",chartW/2)
            .attr("cy",chartH/2)
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

    exports.max = function(_m){
        if(!arguments.length) return max;
        max = _m;
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
