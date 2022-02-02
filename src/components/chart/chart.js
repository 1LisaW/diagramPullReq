// import "../../../node_modules/d3-tip/dist/index.js";
// import "./d3-tip.js";

export default class Chart{
    constructor(_parent, _data ){
        const vis = this;
        vis.parentElement = _parent;
        vis.data = _data;
        vis.initVis();
    }
    initVis(){
        const chartWrapper = document.createElement("div");
        chartWrapper.setAttribute("id","chart");
        const vis = this;
        const parentNode = document.querySelector(vis.parentElement);
        parentNode.append(chartWrapper)
        vis.parentWidth = chartWrapper.getBoundingClientRect().width;
        vis.MARGIN = {
            TOP: 40,
            LEFT:60,
            RIGHT:20,
            BOTTOM:40
        };
        vis.HEIGHT = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.WIDTH = vis.parentWidth - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

        vis.svg = d3.select("#chart")
            .append("svg")
            // .attr("viewBox", [0, 0, vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT, vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM])
            // .attr("preserveAspectRatio","none")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            // .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
            .attr("margin","auto")
            .attr("fill", "grey");

        

        vis.g = vis.svg.append("g")
            // .attr("width", vis.WIDTH)
            .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        vis.x = d3.scaleTime().range([0,vis.WIDTH]);
        vis.y = d3.scaleBand();
        // .range([vis.HEIGHT,0]);

        vis.xAxisCall = d3.axisBottom();
        vis.yAxisCall = d3.axisLeft();

        vis.xAxis = vis.g.append("g")
                        .attr("class","x axis")
                        // .attr("transform",`translate(0,${vis.HEIGHT})`);
        vis.yAxis = vis.g.append("g")
                        .attr("class", "y axis");
      

        // console.log("svg", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM);

        vis.wrangleVis();
    }

    wrangleVis(){
        const vis = this;
        vis.interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

        vis.today = Math.floor(new Date() / vis.interval) * vis.interval;
        const parseTime = d3.timeParse('%d/%m/%Y');
        vis.dateStart = parseTime(document.getElementById("datepicker-first-field").value).getTime();
        vis.dateEnd = parseTime(document.getElementById("datepicker-second-field").value).getTime();
        vis.hourLength = vis.parentWidth 
            / (24* (vis.dateEnd - vis.dateStart) / vis.interval);
            // console.log("hourLength", vis.hourLength);
            // console.log("24* (vis.dateEnd - vis.dateStart", 24 * (vis.dateEnd - vis.dateStart));
            // console.log(" vis.parentWidth ", vis.parentWidth);


         const linearGradient = vis.svg.append("defs")
             .append("linearGradient")
             .attr("id", "cl1")
             .attr("gradientUnits", "userSpaceOnUse")
             .attr("x1", "0%")
             .attr("y1", "0%")
             .attr("x2", "100%")
             .attr("y2", "0%");
         linearGradient.append("stop")
             .attr("offset", Math.max(2, vis.hourLength) / vis.parentWidth)
             .style("stop-color", "grey")
             .style("stop-opacity", "1");
         linearGradient.append("stop")
             .attr("offset", 8 * Math.max(2, vis.hourLength) / vis.parentWidth)
             .style("stop-color", "orange")
             .style("stop-opacity", "1");
         linearGradient.append("stop")
             .attr("offset", 24 * 7 * Math.max(2, vis.hourLength) / vis.parentWidth)
             .style("stop-color", "red")
             .style("stop-opacity", "1");

         // console.log((vis.dateEnd-vis.dateStart)/vis.interval);

        const repoFilter = document.getElementById("repo-filter").value === "all" ? null 
            : document.getElementById("repo-filter").value;
        const isDateInPeriod = (date) => {
            if (!date){
                date = vis.today;
            }
            return (date >= vis.dateStart) && (date <= vis.dateEnd);
        }
        const isUnclosedInPeriod = (createdDate, isOpened) => {

            return ( createdDate < vis.dateStart )&&( isOpened );
        } 
        vis.filtredData = vis.data.filter( item => {
            if (repoFilter){
                // console.log(repoFilter);
                return (item.repoName == repoFilter)
                &&( isDateInPeriod( item.createdDate) || isDateInPeriod( item.updatedDate ) 
                || isUnclosedInPeriod(item.createdDate, item.isOpened));
            }
            else{
                return isDateInPeriod(item.createdDate) || isDateInPeriod(item.updatedDate) ||
                        isUnclosedInPeriod(item.createdDate, item.isOpened);
            }
        });
        // Tooltip
        const tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(d => {
                let text = `<strong>Title:</strong> <span style='color:red;text-transform:capitalize'>${d.title}</span><br>`
                text += `<strong>id:</strong> <span style='color:red'>${d.id}</span><br>`
                text += `<strong>Created date:</strong> <span style='color:red;text-transform:capitalize'>${d.createdDate}</span><br>`
                // text += `<strong>isOpen:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
                // text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
                return text
            })
        vis.g.call(tip)

        // vis.bisectDate = d3.bisector(d => d.createdDate).left;
        // console.log(vis.filtredData);
        vis.HEIGHT = vis.filtredData.length * 21;
        // - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;

        vis.svg
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
        vis.y
            .range([vis.HEIGHT,0]);

        // vis.xAxis
                // .attr("transform", null);
                // .attr("transform",`translate(0,${vis.HEIGHT})`);


        vis.updateVis();
    }

    updateVis(){
        const vis = this;
        let i = 0;
        const step = 20;
        //получение минимальной даты создания/даты начала интервала для отрисовки прямоугольников
        function getMinDateForRect() {
            return Math.min(d3.min(vis.filtredData, d => d.createdDate), vis.dateStart);
        }
        // определение домена для расчета ширины прямоугольников - 
        // разница между датой окончания интервала фильтра и минимальной даты создания/начала интервала 
        function getLengthScaleDomain(){
            return [0, 
                vis.dateEnd - getMinDateForRect()
            ]
        };
        // определение диапазона отрисовки - умножение ширины svg на коэффициент отношения разницы даты окончания интервала 
        // и минимальной даты создания/ даты начала к разнице даты окончания интервала и даты начала интервала.
        function getLengthScaleRange(){
            return [0, vis.WIDTH * (vis.dateEnd - getLengthScaleDomain()[1])
                    /(vis.dateEnd - vis.dateStart)];
        };
        vis.length = d3.scaleLinear()
                .range(getLengthScaleRange())
                .domain(getLengthScaleDomain());
        vis.translate = d3.scaleLinear()
                .range([0, vis.WIDTH])
                .domain(getLengthScaleDomain());



        vis.t = d3.transition().duration(1000);
        vis.x.domain([vis.dateStart, vis.dateEnd]);
        vis.y.domain(vis.filtredData.map(d => d.title + d.id ));
        vis.xAxisCall.scale(vis.x);
        vis.xAxis.transition(vis.t).call(vis.xAxisCall)
        .selectAll("text")
            .style("text-anchor", "end")
            // .attr("dx", "-.8em")
            .attr("dy", "-1.55em")
            // .attr("transform", "rotate(-65)");;

        vis.yAxisCall.scale(vis.y);
        vis.yAxis.transition(vis.t).call(vis.yAxisCall);
        let inc =0;
        vis.rects = vis.g.selectAll(".rect")
                        .data(vis.filtredData, d => {
                            console.log("step ", inc);
                            inc++;
                            console.log("title +id ", d.title +d.id );
                            return d.title +d.id });
        
        vis.rects.exit()
                .attr("class","exit rect")
                .transition(vis.t)
                .attr("height",0)
                .attr("y", vis.HEIGHT)
                .style("fill-opacity","0.1")
                .remove();
        vis.rects
            .attr("class","update rect")
            .transition(vis.t)
                .attr("y", d => {
                    i++;
                    return vis.y(d.title +d.id )})
                    // vis.y(1+step*(i-1))})
                .attr("height", step)
                .attr("x", 0)
                .attr("width", d => vis.length(d.isOpened ? vis.today - d.createdDate : d.updatedDate - d.createdDate))
                .attr("fill", "url(#cl1)")
                .attr('transform', d => 'translate(' + (vis.dateStart > d.createdDate ? -1:1) 
                            * vis.translate(Math.abs(vis.dateStart - d.createdDate)) + ',' + 0 + ')');;

        vis.rects.enter().append("rect")
                    .attr("class","enter rect")
                    .attr("y", d => {
                        i++;
                        return vis.y(d.title +d.id )
                    })
                    .attr("height", step)
                    .attr("x", 0)
                    .attr("width", d => {
                        // console.log(vis.length((d.isOpened ? vis.today - d.createdDate : d.updatedDate - d.createdDate) / 100));
                        return vis.length(d.isOpened ? vis.today - d.createdDate : d.updatedDate - d.createdDate)
                        })
                    .attr("fill", "url(#cl1)")
                    .attr('transform', d => {
                             return 'translate(' + (vis.dateStart > d.createdDate ? -1 : 1) * vis.translate(Math.abs( vis.dateStart - d.createdDate )) + ',' + 0 + ')'
                            });

        /******************************** Tooltip Code ********************************/

        // const focus = vis.g.append("g")
        //     .attr("class", "focus")
        //     .style("display", "none")

        // focus.append("line")
        //     .attr("class", "x-hover-line hover-line")
        //     .attr("y1", 0)
        //     .attr("y2", vis.HEIGHT)

        // focus.append("line")
        //     .attr("class", "y-hover-line hover-line")
        //     .attr("x1", 0)
        //     .attr("x2", vis.WIDTH)

        // focus.append("circle")
        //     .attr("r", 7.5)

        // focus.append("text")
        //     .attr("x", 15)
        //     .attr("dy", ".31em")

        // vis.g.append("rect")
        //     .attr("class", "overlay")
        //     .attr("width", vis.WIDTH)
        //     .attr("height", vis.HEIGHT)
        //     .on("mouseover", () => focus.style("display", null))
        //     .on("mouseout", () => focus.style("display", "none"))
        //     .on("mousemove", mousemove)

        // function mousemove() {
        //     const x0 = vis.x.invert(d3.pointer(event,this)[0])
        //     const i = Math.min(vis.filtredData.length - 1, vis.bisectDate(vis.filtredData, x0, 1));
        //     const d0 = vis.filtredData[i - 1]
        //     const d1 = vis.filtredData[i];

        //     const d = x0 - d0.createdDate > d1.createdDate - x0 ? d1 : d0
        //     // focus.attr("transform", `translate(${vis.translate(d.createdDate)}, ${vis.y(d.title +d.id )})`)
        //     focus.select("text").text(d.title)
        //     focus.select(".x-hover-line").attr("y2", vis.HEIGHT - vis.y(d.title +d.id))
        //     focus.select(".y-hover-line").attr("x2", -vis.x(d.createdDate))
        // }



    }

}