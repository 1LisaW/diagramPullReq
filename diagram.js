// import './d3.min.js';
// const d3 = window.d3;

const newDiagram = (data) =>{
    //
    d3.select("body").selectAll("svg").remove();
    const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
    // определение диапазона окна видимой части графика
    const wrapperGraficD3Width = document.querySelector(".wrapper-grafic-d3").getBoundingClientRect().width;
    const wrapperGraficD3Height = document.querySelector(".wrapper-grafic-d3").getBoundingClientRect().height;
    
    const hourLength = (wrapperGraficD3Width/(7*24));
    let startOfIntervalDay = Math.floor(new Date(data.reduce((acc,curr)=>{
        return Math.min(acc,curr.createdDate)
    },data[data.length-1].createdDate)) / interval) * interval;
    
    let today = Math.floor(new Date() / interval) * interval;    
    // let endOfIntervalDay = Math.ceil(new Date(data[0].createdDate)  / interval) * interval;
    let ticks = (today - startOfIntervalDay+2*interval)/interval;    
    //min-width of diagramm counts as 5px(our slot)*24(ours per day)*days from data (tricks)= 
    //рассчет ширины графика
    const graphWidth = Math.max(2*24*(ticks-2),hourLength* 24 * (ticks-2));

    const graphMargin = 35;
    const graphHeight =graphMargin*1.5+14.1*data.length;


    const diffForPx = graphWidth/(today-startOfIntervalDay);

    const svg = d3.select(".wrapper-grafic-d3")
                  .append("svg")
                  .attr("width", graphWidth)
                  .attr("height",graphHeight)
                  .attr("viewBox", [0, 0, graphWidth, graphHeight])
                  .attr("transform","translate("+(wrapperGraficD3Width-graphWidth)+","+-0+")");
    const scaleTimeline = d3.scaleUtc()
                    .domain([startOfIntervalDay,today+interval])
                    .range([0,graphWidth-graphMargin*0]);
    const x_axis = d3.axisTop()
                     .scale(scaleTimeline)
                     .ticks(ticks)
                     .tickFormat(d3.timeFormat('%d.%m'));

    const linearGradient = svg.append("defs")
                              .append("linearGradient")
                              .attr("id","cl1")
                              .attr("gradientUnits","userSpaceOnUse")
                              .attr("x1","0%")
                              .attr("y1","0%")
                              .attr("x2","100%")
                              .attr("y2","0%");
    linearGradient.append("stop")
                  .attr("offset",Math.max(2,hourLength)/graphWidth)
                  .style("stop-color","grey")
                  .style("stop-opacity","1");
    linearGradient.append("stop")
                  .attr("offset",8*Math.max(2,hourLength)/graphWidth)
                  .style("stop-color","orange")
                  .style("stop-opacity","1");
    linearGradient.append("stop")
                  .attr("offset",24*7*Math.max(2,hourLength)/graphWidth)
                  .style("stop-color","red")
                  .style("stop-opacity","1");                            
    svg.append("g")
        .attr("class","axis")
        .attr("transform", "translate(0,"+graphMargin+")")
        .call(x_axis)
        .selectAll("text")  
        .style("text-anchor", "start");
        
     const line = svg.append("line")
        .attr("x1", graphWidth-10)
        .attr("y1", 10)
        .attr("x2", graphWidth-10)
        .attr("y2", wrapperGraficD3Height)

        .attr("stroke", "rgba(0,0,0,0.2)")
        .style("pointer-events","none");    

    data.forEach((curr,index)=>{
        const sx = (curr.createdDate-startOfIntervalDay)*diffForPx;
        const w = (curr.updatedDate-curr.createdDate)*diffForPx;
        const sy = graphMargin*1.5+14*index;
        const isLabelRight =(sx%wrapperGraficD3Width > wrapperGraficD3Width/2 ? true : false);

        const wraprectangle = svg.append("g")
                                 .attr("class", "trace")
                                 .attr("transform", "translate(0, 0)");
        if((curr.updatedDate-curr.createdDate)/(1000 * 60 * 60) < 1){
          wraprectangle.append("rect")
                       .attr("x",0)
                       .attr("y", 0)
                       .attr("width", graphWidth)
                       .attr("height", 10)
                       .attr("fill","#ffcfd7")
                       .attr('transform', 'translate(' + 0 + ',' + sy + ')');
        };
        const rect = wraprectangle.append("rect")
                         .attr("x",0)
                         .attr("y", 0)
                         .attr("width", w)
                         .attr("height", 10)
                         .attr("fill","url(#cl1)")
                         .attr('transform', 'translate(' + sx + ',' + sy + ')');
        // if((curr.updatedDate-curr.createdDate)/(1000 * 60 * 60) < 1){
        //   rect
        //   // .style("padding","2")
        //       .attr("stroke","red")
        //       .attr("stroke-width","3")
        //       .attr("stroke-dasharray","1");
        // };
            wraprectangle.append("text")
                         .text(curr.title)
                         .attr("x", isLabelRight ? sx-5 : sx+w+5)
                         .attr("y", graphMargin*1.5+14.1*index)
                         .attr("font-size",12)
                         .attr("dominant-baseline",'central')
                         .style("text-anchor", isLabelRight ? "end" : "start");
    })
   
    function handleZoom(e) {
      const g = d3.selectAll(".trace");
      const tx =  Math.max(0,Math.min(e.transform.x, graphWidth -wrapperGraficD3Width));
      const ty =  Math.max(0,Math.min(-e.transform.y, graphHeight));
     
      if (e.sourceEvent.type!=="wheel"){
        svg.attr("cursor", "grabbing");
        
        g.attr('transform', 'translate(' + tx + ',' + -ty + ')'); 
        d3.select('svg .axis')
         .attr('transform', 'translate(' + tx + ',' + graphMargin + ')');
      }
     
    }
   

    let zoom = d3.zoom()
                 .on('zoom', handleZoom);

    d3.select('svg')
        .attr("cursor", "grab")
        .call(zoom);
    svg.on("mousemove", function(d) {
      let [x,y] = [d.clientX,d.clientY];
      line.attr("transform", `translate(${x-document.querySelector(".wrapper-grafic-d3").getBoundingClientRect().x-wrapperGraficD3Width} 0)`);
      y +=20;
    //   if(x>width/2) x-= 100;
    })

};

export {newDiagram};