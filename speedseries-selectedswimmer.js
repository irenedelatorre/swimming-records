d3.speedSeriesASwimmer = function(){
    var w,
        h,
        m = {t:5,r:0,b:5,l:0},
        id;

        var chartW = w - m.l - m.r,
        chartH = h - m.t - m.b,
        radius = [],
        speedExtent = [],
        dateExtent = [],
        eventNames = [],
        chartStartingPoint = 0,
        chartEndPoint = chartW - 10,
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
            id,
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


        //
        ////TITLES
        var svg = d3.select(this).selectAll('svg')
            .data([data]);

        var svgEnter = svg.enter().append('svg').attr("class","row");

        svgEnter.append('g').attr('class','oneEvent').attr('transform','translate('+m.l+','+(40)+')');

        svgEnter.append('text')
            .text(distanceTitle[0])
            .attr("class","event-names")
            .style("text-anchor","left")
            .attr("y",20)
            .attr("x",0);

        if (distanceTitle[0]=="4 x 100 m freestyle relay" || distanceTitle[0]=="4 x 100 m medley relay" || distanceTitle[0]=="4 x 200 m freestyle relay" || distanceTitle[0]=="4 x 200 m medley relay" ){
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



        //DOTS
        var canvas2 = d3.select(this).insert('canvas')
            .attr('width',chartW)
            .attr('height',chartH)
            .attr("class","row")
            .attr("transform","translate("+m.l+","+ m.t+")")
            //.style("opacity",0)
            .node(),

        ctxChart2 = canvas2.getContext("2d");

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

        var nestBySwimmer = d3.nest()
            .key(function (d) {
                return d.name
            })
            .entries(data);


        drawOneEvent();

        //var myReq = requestAnimationFrame(drawOneEvent);

        function drawOneEvent(){

            //ctx.clearRect(0, 0, width, height);
            ctxChart2.globalCompositeOperation = 'normal';
            ctxChart2.fillStyle = "#192F38";
            ctxChart2.fillRect(0, 0, chartW, chartH);

            ctxChart2.beginPath();
            ctxChart2.fillStyle = "none";
            ctxChart2.strokeStyle = "#475960";
            ctxChart2.lineWidth = "1pt";
            ctxChart2.setLineDash([0, 0]);
            ctxChart2.moveTo(chartStartingPoint,chartH);
            ctxChart2.lineTo(chartStartingPoint,(chartTopPoint-20));
            ctxChart2.stroke();
            ctxChart2.moveTo((chartEndPoint+mySize+1),chartH);
            ctxChart2.lineTo((chartEndPoint+mySize+1),(chartTopPoint-20));
            ctxChart2.stroke();
            ctxChart2.closePath();


            ////delimitation of distances
            ctxChart2.beginPath();
            ctxChart2.textAlign = "center";
            ctxChart2.fillStyle ="#758288";
            ctxChart2.font ="8pt Raleway Medium";
            ctxChart2.fillText("Start",chartStartingPoint,chartTopPoint-35);
            ctxChart2.textAlign = "center";
            ctxChart2.fillText("End",(chartEndPoint+mySize+1),chartTopPoint-35);
            ctxChart2.textAlign = "left";
            ctxChart2.fillText("First and last records",(chartEndPoint+mySize+10),chartTopPoint-35);

            ctxChart2.textAlign = "left";
            ctxChart2.fillStyle = "#758288";
            ctxChart2.font ="8pt Raleway Medium";
            ctxChart2.fillText(formatYear(data[0].date),0,scaleYEvent(data[0].date));
            ctxChart2.fillText(formatYear(data[numberRecords-1].date),0,scaleYEvent(data[numberRecords-1].date));

            ctxChart2.textAlign = "left";

            ctxChart2.font ="bold 9pt Raleway";

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

                ctxChart2.beginPath();
                ctxChart2.fillStyle = "none";
                ctxChart2.lineWidth = "1pt";
                ctxChart2.globalCompositeOperation = 'screen';
                ctxChart2.globalAlpha = 0.25;
                ctxChart2.setLineDash([4, 2]);
                ctxChart2.strokeStyle = scaleColor("Female");
                ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(femaleRecordsFirst.date));
                ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(femaleRecordsFirst.date));
                ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(femaleRecordsLast.date));
                ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(femaleRecordsLast.date));
                ctxChart2.stroke();
                ctxChart2.closePath();

                ctxChart2.beginPath();
                ctxChart2.strokeStyle = scaleColor("Male");
                ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(maleRecordsFirst.date));
                ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(maleRecordsFirst.date));
                ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(maleRecordsLast.date));
                ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(maleRecordsLast.date));
                ctxChart2.stroke();
                ctxChart2.strokeStyle = "none";
                ctxChart2.globalCompositeOperation = 'normal';
                ctxChart2.closePath();

                if (d.key == "50 m freestyle" ){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+7);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-15);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-7);
                } if (d.key == "50 m backstroke") {
                    ctxChart2.fillStyle = scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time), chartEndPoint + mySize + 10, scaleYEvent((maleRecordsFirst.date))-7);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time), chartEndPoint + mySize + 10, scaleYEvent((maleRecordsLast.date))+16);
                    ctxChart2.fillStyle = scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time), chartEndPoint + mySize + 10, scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time), chartEndPoint + mySize + 10, scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="50 m breaststroke"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-15);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+15);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="50 m butterfly"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-10);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+4);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+11);
                }if(d.key=="100 m freestyle"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-7);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+7);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+5);
                }if (d.key=="100 m backstroke"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+3);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+2);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="100 m breaststroke"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))+7);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+7);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-7);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-7);
                }if(d.key=="100 m butterfly"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-5);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));
                }if(d.key=="200 m freestyle"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-8);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m backstroke"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m breaststroke"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="200 m butterfly"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))+8);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))-8);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="200 m individual medley"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-3);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="400 m freestyle"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+2);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+4);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="400 m individual medley"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-1);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+1);
                }if(d.key=="800 m freestyle"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-1);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+2);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="1500 m freestyle"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if(d.key=="4 x 100 m medley relay"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date))-8);
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))-6);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date))+8);
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))+8);
                }if(d.key=="4 x 200 m freestyle relay"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date))+8);
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date))-8);

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(femaleRecordsFirst.date),0,scaleYEvent(femaleRecordsFirst.date));
                }if (d.key=="4 x 100 m freestyle relay"){
                    ctxChart2.fillStyle =scaleColor("Male");
                    ctxChart2.fillText(msToTime(maleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(maleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((maleRecordsLast.date)));
                    ctxChart2.fillStyle =scaleColor("Female");
                    ctxChart2.fillText(msToTime(femaleRecordsFirst.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsFirst.date)));
                    ctxChart2.fillText(msToTime(femaleRecordsLast.time),chartEndPoint+mySize+10,scaleYEvent((femaleRecordsLast.date)));

                    ctxChart2.textAlign = "left";
                    ctxChart2.fillStyle = "#758288";
                    ctxChart2.font ="8pt Raleway Medium";
                    ctxChart2.fillText(formatYear(maleRecordsFirst.date),0,scaleYEvent(maleRecordsFirst.date));
                }

                ctxChart2.globalAlpha=1;
                ctxChart2.closePath;


            })

            nestBySwimmer.forEach(function(d){
                if (d.key == id){
                    var swimmerSelected = d.values;
                    swimmerSelected.forEach(function(d){
                        ctxChart2.beginPath();
                        ctxChart2.fillStyle = "none";
                        ctxChart2.lineWidth = "1pt";
                        ctxChart2.globalCompositeOperation = 'screen';
                        ctxChart2.globalAlpha = 0.25;
                        ctxChart2.setLineDash([0, 0]);
                        ctxChart2.strokeStyle = scaleColor(d.sex);
                        ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(d.date));
                        ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(d.date));
                        ctxChart2.moveTo(chartStartingPoint-5,scaleYEvent(d.date));
                        ctxChart2.lineTo(chartEndPoint+mySize+5,scaleYEvent(d.date));
                        ctxChart2.stroke();
                        ctxChart2.strokeStyle = "none";
                        ctxChart2.globalCompositeOperation = 'normal';
                        ctxChart2.globalAlpha = 1;
                        ctxChart2.closePath();
                    })


                }else{

                }
            })
            //Loop over the dataset and draw each circle to the canvas
            for (var i = 0; i < data.length; i++) {
                var swimmer = data[i];
                var mySpeed = (swimmer.speed*50)/chartEndPoint;
                var aleatory = noise.simplex2(swimmer.xPosChart/10, swimmer.yPosChart)*mySpeed-mySpeed*2;
                var celebration = Math.random() * (mySize*1.1 - mySize/2) + mySize*1.1;

                if (swimmer.xPosChart>0 && swimmer.xPosChart<chartEndPoint){
                    swimmer.xPosChart = swimmer.xPosChart + mySpeed;
                    if (id == swimmer.name){
                            ctxChart2.beginPath();
                            ctxChart2.globalCompositeOperation = 'screen';
                            ctxChart2.globalAlpha = 1;
                            ctxChart2.fillStyle = scaleColor(swimmer.sex);
                            ctxChart2.arc(swimmer.xPosChart, swimmer.yPosChart + aleatory, mySize, 0,  2 * Math.PI);
                            ctxChart2.fill();
                            ctxChart2.globalCompositeOperation = 'normal';
                            ctxChart2.globalAlpha = 1;
                            ctxChart2.closePath();
                        }if (id != swimmer.name){
                            //Draw each circle
                            ctxChart2.beginPath();
                            ctxChart2.globalCompositeOperation = 'screen';
                            ctxChart2.globalAlpha = 0.1;
                            ctxChart2.fillStyle = scaleColor(swimmer.sex);
                            ctxChart2.arc(swimmer.xPosChart, swimmer.yPosChart + aleatory, 1, 0,  2 * Math.PI);
                            ctxChart2.fill();
                            ctxChart2.globalCompositeOperation = 'normal';
                            ctxChart2.globalAlpha = 1;
                            ctxChart2.closePath();
                    }
                }else{
                    swimmer.xPosChart = chartEndPoint;
                    if (id == swimmer.name){
                        ctxChart2.beginPath();
                        ctxChart2.globalCompositeOperation = 'screen';
                        ctxChart2.globalAlpha = 1;
                        ctxChart2.fillStyle = scaleColor(swimmer.sex);
                        ctxChart2.arc(swimmer.xPosChart, swimmer.yPosChart, celebration, 0,  2 * Math.PI);
                        ctxChart2.fill();
                        ctxChart2.globalCompositeOperation = 'normal';
                        ctxChart2.globalAlpha = 1;
                        ctxChart2.closePath();
                    }if (id != swimmer.name){
                        //Draw each circle
                        ctxChart2.beginPath();
                        ctxChart2.globalCompositeOperation = 'screen';
                        ctxChart2.globalAlpha = 0.1;
                        ctxChart2.fillStyle = scaleColor(swimmer.sex);
                        ctxChart2.arc(swimmer.xPosChart, swimmer.yPosChart, 1, 0,  2 * Math.PI);
                        ctxChart2.fill();
                        ctxChart2.globalCompositeOperation = 'normal';
                        ctxChart2.globalAlpha = 1;
                        ctxChart2.closePath();
                    }
                }

            }

            myReq = requestAnimationFrame(drawOneEvent);

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
    exports.id = function(_i){
        if(!arguments.length) return id;
        id = _i;
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
