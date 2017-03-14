d3.speedSeries = function(){
    var w,
        h,
        m = {t:5,r:0,b:5,l:0};
    chartW = w - m.l - m.r,
        chartH = h - m.t - m.b,
        radius = [],
        speedExtent = [],
        dateExtent = [],
        eventNames = [],
        chartStartingPoint = 0,
        chartEndPoint = chartW - 10;
        chartTopPoint = 50,
        scaleYEvent = d3.scaleTime().domain(dateExtent).range([chartTopPoint,chartH-25]),
        valueAccessor = function(d){ return d;};

    function exports(_selection){
            w,
            h,
            m = {t:5,r:0,b:5,l:0};
            chartW = w - m.l - m.r,
            chartH = h - m.t - m.b,
            radius = 100,
            chartStartingPoint = 35,
            chartEndPoint = chartW - 150;
            chartTopPoint = 10,
            scaleYEvent = d3.scaleTime().domain(dateExtent).range([chartTopPoint,chartH-25]);


            _selection.each(draw);
    }

    function draw (data){

        var distanceTitle = d3.extent(data.map(function (d) {return d.event}));
        var speedRange = d3.extent(data.map(function (d) {return d.speed}));

        data.sort(function(a,b){return a.date - b.date});

        //Order by date, position Y in relation to index
        var numberRecords = data.length;

        data.forEach(function(d){
            d.xPosChart = startingPoint;
            d.yPosChart = scaleYEvent(d.date);

        });


        //DOTS
        var canvas1 = d3.select(this).insert('canvas')
            .attr('width',chartW)
            .attr('height',chartH)
            .attr("class","row")
            .attr("transform","translate("+m.l+","+ m.t+")")
            //.style("opacity",0)
            .node(),
        
        ctxChart = canvas1.getContext("2d");

        //[0] = male; [1] = female
        var nestBySex = d3.nest()
            .key(function (d) {
                return d.event
            })
            .key(function (d) {
                return d.sex
            })
            .sortKeys(function(a,b){
                return a.sex - b.sex})
            .sortValues(function(a,b){
                return a.date - b.date})
            .entries(data);



        drawOneEvent();

        requestAnimationFrame(drawOneEvent);

        function drawOneEvent(){

            //ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'normal';
            ctxChart.fillStyle = "#192F38";
            ctxChart.fillRect(0, 0, chartW, chartH);

            ctxChart.beginPath();
            ctxChart.fillStyle = "none";
            ctxChart.strokeStyle = "#475960";
            ctxChart.lineWidth = "1pt";
            ctxChart.setLineDash([0, 0]);
            ctxChart.moveTo(chartStartingPoint,chartH);
            ctxChart.lineTo(chartStartingPoint,(chartTopPoint-20));
            ctxChart.stroke();
            ctxChart.moveTo((chartEndPoint+mySize+1),chartH);
            ctxChart.lineTo((chartEndPoint+mySize+1),(chartTopPoint-20));
            ctxChart.stroke();
            ctxChart.closePath();


            ////delimitation of distances
            ctxChart.beginPath();
            ctxChart.textAlign = "center";
            ctxChart.fillStyle ="#758288";
            ctxChart.font ="8pt Raleway Medium";
            ctxChart.fillText("Start",chartStartingPoint,chartTopPoint-35);
            ctxChart.textAlign = "center";
            ctxChart.fillText("End",(chartEndPoint+mySize+1),chartTopPoint-35);
            ctxChart.textAlign = "left";
            ctxChart.fillText("First and last records",(chartEndPoint+mySize+10),chartTopPoint-35);
            //ctxChart.closePath();


            //first and last records per men and women
            //console.log(nestBySex[0].values[0].date);
            //ctxChart.textAlign = "left";
            //ctxChart.fillStyle = scaleColor("Male");
            //ctxChart.font ="8pt Raleway Medium";
            //ctxChart.fillText(formatYear(nestBySex[0].values[0].date),0,scaleYEvent(data[0].date)-2);
            //ctxChart.fillText(formatYear(nestBySex[0].values[nestBySex[0].values.length-1].date),0,scaleYEvent(data[numberRecords-1].date)-2);

            ctxChart.textAlign = "left";
            ctxChart.fillStyle = "#758288";
            ctxChart.font ="8pt Raleway Medium";
            ctxChart.fillText(formatYear(data[0].date),0,scaleYEvent(data[0].date));
            ctxChart.fillText(formatYear(data[numberRecords-1].date),0,scaleYEvent(data[numberRecords-1].date));

            ctxChart.textAlign = "left";

            ctxChart.font ="bold 9pt Raleway";

            nestBySex.forEach(function(d){
                var femaleRecords;
                var maleRecords;

                if (d.values[0].key=="Female"){
                    femaleRecords = d.values[0].values;
                    maleRecords = d.values[1].values;
                }if (d.values[1].key=="Female"){
                    femaleRecords = d.values[1].values;
                    maleRecords = d.values[0].values;
                }
                var femaleRecordsFirst = femaleRecords[0];
                var femaleRecordsLast = femaleRecords[femaleRecords.length -1];
                var maleRecordsFirst = maleRecords[0];
                var maleRecordsLast = maleRecords[maleRecords.length-1];

                ctxChart.beginPath();
                ctxChart.fillStyle = "none";
                ctxChart.lineWidth = "1pt";
                ctxChart.globalCompositeOperation = 'screen';
                ctxChart.globalAlpha = 0.5;
                ctxChart.setLineDash([4, 2]);
                ctxChart.strokeStyle = scaleColor("Female");
                ctxChart.moveTo(chartStartingPoint-5,scaleYEvent(femaleRecordsFirst.date));
                ctxChart.lineTo(chartEndPoint+mySize+5,scaleYEvent(femaleRecordsFirst.date));
                ctxChart.moveTo(chartStartingPoint-5,scaleYEvent(femaleRecordsLast.date));
                ctxChart.lineTo(chartEndPoint+mySize+5,scaleYEvent(femaleRecordsLast.date));
                ctxChart.stroke();
                ctxChart.closePath();

                ctxChart.beginPath();
                ctxChart.strokeStyle = scaleColor("Male");
                ctxChart.moveTo(chartStartingPoint-5,scaleYEvent(maleRecordsFirst.date));
                ctxChart.lineTo(chartEndPoint+mySize+5,scaleYEvent(maleRecordsFirst.date));
                ctxChart.moveTo(chartStartingPoint-5,scaleYEvent(maleRecordsLast.date));
                ctxChart.lineTo(chartEndPoint+mySize+5,scaleYEvent(maleRecordsLast.date));
                ctxChart.stroke();
                ctxChart.strokeStyle = "none";
                ctxChart.globalCompositeOperation = 'normal';
                ctxChart.globalAlpha = 1;
                ctxChart.closePath();

                if (d.key == "50 m freestyle" ){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+7);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-15);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-7);
                } if (d.key == "50 m backstroke") {
                    ctxChart.fillStyle = scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time), chartEndPoint + mySize + 10, scaleYEvent((maleRecordsFirst.date))-7);
                    ctxChart.fillText(msToTime(maleRecordsLast.time), chartEndPoint + mySize + 10, scaleYEvent((maleRecordsLast.date))+16);
                    ctxChart.fillStyle = scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time), chartEndPoint + mySize + 10, scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time), chartEndPoint + mySize + 10, scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="50 m breaststroke"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-15);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+15);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="50 m butterfly"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-10);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+4);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+11);
                }if(d.key=="100 m freestyle"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-7);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+7);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+5);
                }if (d.key=="100 m backstroke"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+3);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+2);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="100 m breaststroke"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))+7);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+7);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-7);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-7);
                }if(d.key=="100 m butterfly"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-5);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="200 m freestyle"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-8);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m backstroke"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m breaststroke"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m butterfly"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))+8);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-8);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="200 m individual medley"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-3);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="400 m freestyle"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+2);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+4);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="400 m individual medley"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-1);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+1);
                }if(d.key=="800 m freestyle"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-1);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+2);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="1500 m freestyle"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="4 x 100 m medley relay"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-6);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="4 x 200 m freestyle relay"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+8);
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-8);

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if (d.key=="4 x 100 m freestyle relay"){
                    ctxChart.fillStyle =scaleColor("Male");
                    ctxChart.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart.fillStyle =scaleColor("Female");
                    ctxChart.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));

                    ctxChart.textAlign = "left";
                    ctxChart.fillStyle = "#758288";
                    ctxChart.font ="8pt Raleway Medium";
                    ctxChart.fillText(formatYear(maleRecordsFirst.date),0,scaleYEvent(maleRecordsFirst.date));
                }


            })

            //Loop over the dataset and draw each circle to the canvas
            for (var i = 0; i < data.length; i++) {
                var swimmer = data[i];
                var mySpeed = (swimmer.speed*50)/chartEndPoint;

                if (swimmer.xPosChart>0 && swimmer.xPosChart<chartEndPoint+1){
                    swimmer.xPosChart = swimmer.xPosChart + mySpeed;

                }else{
                    swimmer.xPosChart = chartEndPoint;
                }

                //Draw each circle
                ctxChart.beginPath();
                ctxChart.globalCompositeOperation = 'screen';
                ctxChart.globalAlpha = 0.75;
                ctxChart.fillStyle = scaleColor(swimmer.sex);
                ctxChart.arc(swimmer.xPosChart, swimmer.yPosChart +noise.simplex2(swimmer.xPosChart/10, swimmer.yPosChart)*mySpeed-mySpeed*2, mySize, 0,  2 * Math.PI);
                ctxChart.fill();
                ctxChart.globalCompositeOperation = 'normal';
                ctxChart.globalAlpha = 1;
                ctxChart.closePath();



            }
            requestAnimationFrame(drawOneEvent);
        }


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

    exports.value = function(_v){
        if(!arguments.length) return layout.value();
        valueAccessor = _v;
        layout.value(_v);
        return this;
    };

    return exports;
}
