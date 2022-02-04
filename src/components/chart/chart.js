import * as d3 from "d3";
import d3Tip from "../../../node_modules/d3-tip/index.js";
import moment from "moment";
moment.locale('ru');

import './chart.css';
d3.formatLocale(
{
        "dateTime": "%A, %e %B %Y г. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
        "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        "months": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
    }
);
// const myFormatters = d3.locale();
// d3.timeFormat = myFormatters.timeFormat;

export default class Chart{
    constructor(_parent, _data, _getIntervalDates, _getRepoFilter ){
        const vis = this;
        vis.parentElement = _parent;
        vis.data = _data;
        vis.getIntervalDates = _getIntervalDates;
        vis.getRepoFilter = _getRepoFilter;
        vis.initVis();
    }
    initVis(){
        const vis = this;
        //create wrapper for chart
        vis.chartWrapper = document.createElement("div");
        vis.chartWrapper.setAttribute("id","chart");
        const parentNode = document.querySelector(vis.parentElement);
        parentNode.append(vis.chartWrapper);

        vis.parentWidth = vis.chartWrapper.getBoundingClientRect().width;

        // consts for sizing chart
        vis.MARGIN = {
            TOP: 40,
            LEFT:60,
            RIGHT:20,
            BOTTOM:40
        };
        vis.HEIGHT = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
        vis.WIDTH = vis.parentWidth - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

        //creating svg
        vis.svg = d3.select("#chart")
            .append("svg")
            .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
            .attr("margin","auto")
            .attr("fill", "grey");

        //creating main group in svg
        vis.g = vis.svg.append("g")
            .attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);

        //creating y axis - pullrequest's heap. 
        vis.y = d3.scaleBand();
        vis.yAxisCall = d3.axisLeft();
        vis.yAxis = vis.g.append("g")
            .attr("class", "y axis");
        //creating x axis - timeline. 
        vis.x = d3.scaleTime().range([0,vis.WIDTH]);
        vis.xAxisCall = d3.axisBottom();
        vis.xAxis =
         d3.select("#x-axis").append("svg")
                        .attr( "width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
                        .attr("height", 40)
                        .attr("transform", "translate(" + (vis.MARGIN.LEFT )+ "," + - (vis.HEIGHT + vis.MARGIN.BOTTOM +vis.MARGIN.TOP) +")")

                        .append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(" + 0 + "," +  20 + ")");
        
        // console.log(vis.yAxis._groups[0][0].getBoundingClientRect());
        vis.wrangleVis();
    }

    wrangleVis(){
        const vis = this;
        vis.interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

        vis.today = Math.floor(new Date() / vis.interval) * vis.interval;
        // const parseTime = d3.timeParse('%d/%m/%Y');
        vis.intervalDates = vis.getIntervalDates();
        vis.repoValue = vis.getRepoFilter();
        vis.hourLength = vis.parentWidth
            / (24* (vis.intervalDates[1] - vis.intervalDates[0]) / vis.interval);


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


        const isDateInPeriod = (date) => {
            if (!date){
                date = vis.today;
            }
            return (date >= vis.intervalDates[0]) && (date <= vis.intervalDates[1]);
        };
        const isUnclosedInPeriod = (createdDate, isOpened) => {

            return ( createdDate < vis.intervalDates[0] )&&( isOpened );
        };
        //util for filtering incoming data by repoName
        const getFiltredByRepo = (item) => {
            if (vis.repoValue === "all"){
                return true;
            }
            else if ((vis.repoValue === "back") || (vis.repoValue === "front")){
                return !!item.repoName.match(vis.repoValue);
            }
            else{
                return item.repoName === vis.repoValue;
            }
        };
        //util for filtering inoming data by date interval + getFiltredByRepo()
        const getFiltredDate = (item) =>{
                    return getFiltredByRepo(item) &&( isDateInPeriod(item.createdDate) || isDateInPeriod(item.updatedDate) ||
                     isUnclosedInPeriod(item.createdDate, item.isOpened));
        };
        //get filtered date
        vis.filtredData = vis.data.filter( item => getFiltredDate(item));
        vis.HEIGHT = vis.filtredData.length * 21;
        // console.log(vis.filtredData);
        vis.svg
            .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
        vis.y
            .range([vis.HEIGHT,0]);

         vis.div = d3.select("#chart").append("div")
             .attr("class", "tooltip")
             .style("opacity", 0);

        vis.updateVis();
    }

    updateVis(){
        const vis = this;
        // let i = 0;
        const step = 20;
        //получение минимальной даты создания/даты начала интервала для отрисовки прямоугольников
        function getMinDateForRect() {
            return Math.min(d3.min(vis.filtredData, d => d.createdDate), vis.intervalDates[0]);
        }
        // определение домена для расчета ширины прямоугольников -
        // разница между датой окончания интервала фильтра и минимальной даты создания/начала интервала
        function getLengthScaleDomain(){
            return [0,
                vis.intervalDates[1] - getMinDateForRect()
            ]
        };
        // определение диапазона отрисовки - умножение ширины svg на коэффициент отношения разницы даты окончания интервала
        // и минимальной даты создания/ даты начала к разнице даты окончания интервала и даты начала интервала.
        function getLengthScaleRange(){
            return [0, vis.WIDTH * (vis.intervalDates[1] - getMinDateForRect())
                //  getLengthScaleDomain()[1])
                    /(vis.intervalDates[1] - vis.intervalDates[0])];
        };
        vis.length = d3.scaleLinear()
                .range(getLengthScaleRange())
                .domain(getLengthScaleDomain());
        vis.translate = d3.scaleLinear()
                .range(getLengthScaleRange())
                    // [0, vis.WIDTH])
                .domain(getLengthScaleDomain());



        vis.t = d3.transition().duration(1000);
        vis.x.domain([vis.intervalDates[0], vis.intervalDates[1]]);
        vis.y.domain(vis.filtredData.map(d => d.title + d.id ));
        vis.xAxisCall.scale(vis.x);
        vis.xAxis.transition(vis.t).call(vis.xAxisCall)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dy", "-1.55em");

        

        vis.yAxisCall.scale(vis.y);
        vis.yAxis.transition(vis.t).call(vis.yAxisCall);
        vis.rects = vis.g.selectAll(".rect")
                        .data(vis.filtredData, d => {
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
                    return vis.y(d.title +d.id )})
                .attr("height", step)
                .attr("x", 0)
                .attr("width", d => vis.length(d.isOpened ? vis.today - d.createdDate : d.updatedDate - d.createdDate))
                .attr("fill", "url(#cl1)")
                .attr('transform', d => 'translate(' + (vis.intervalDates[0] > d.createdDate ? -1:1)
                            * vis.translate(Math.abs(vis.intervalDates[0] - d.createdDate)) + ',' + 0 + ')');

            // get date info for tooltip
            // const addZeroToDate = (number) => {
            //     if (number < 10) {
            //         return "0" + number;
            //     }
            //     return number;
            // }

            const getConvertedDateForTooltip = (data, typeOfDate) => {
                 if ((typeOfDate === "updatedDate") && (data.target.__data__.isOpened)) {
                     return " ... "
                 }
                const convertedDate = moment(data.target.__data__[typeOfDate]).format("DD MMM YYYY HH:mm");
                return convertedDate;
                // day + "/" + month + "/" + year + " " + hours + ":" + mins;
            }
            const getDurationOfPullRequest = ( dateStart, dateEnd, isOpened )  => {
                const startDate = moment( dateStart );
                const endDate = isOpened ? moment( vis.today ) : moment( dateEnd );
                // const durationMs = moment(dateEnd).diff(dateStart,"days");

                const days = endDate.diff( startDate, "days" );
                const hours = endDate.diff(startDate, "hours") % 24;
                const mins = endDate.diff(startDate, "minutes") % 60;
                // console.log(days);
                const checkForZero = ( val, mesure ) => {
                    return val ? (val) + mesure : "";
                }
                return (checkForZero(days, "d, ")+
                            checkForZero(hours, "h, ") +
                            checkForZero(mins, "m")
                );
            }
            
            vis.rects.on("mouseover", function (d) {
                    vis.div.html(
                            '<div>' + // The first <div> tag
                            getConvertedDateForTooltip(d,"createdDate") +" - "
                            + getConvertedDateForTooltip(d, "updatedDate") +
                            "</div>" +"("
                             + getDurationOfPullRequest(d.target.__data__.createdDate, 
                                d.target.__data__.updatedDate ,
                                d.target.__data__.isOpened) +")"
                            + "<br/>" +
                            d.target.__data__.title
                            )
                         .style("left", (d.offsetX) + "px")
                             .style("top", (d.offsetY - 28) + "px");
                      vis.div.transition()
                          .duration(200)
                          .attr("transform", `translate( ${d.offsetX}, ${d.offsetY})`)
                          .style("opacity", .9);
                })
                .on("mouseout", function(d){
                     vis.div.transition()
                         .duration(200)
                         .style("opacity", 0);
                });

        vis.rects.enter().append("rect")
                    .attr("class","enter rect")
                    .attr("y", d => {
                        // i++;
                        return vis.y(d.title +d.id )
                    })
                    .attr("height", step)
                    .attr("x", 0)
                    .attr("width", d => {
                        return vis.length(d.isOpened ? vis.today - d.createdDate : d.updatedDate - d.createdDate)
                        })
                    .attr("fill", "url(#cl1)")
                    .attr('transform', d => {
                             return 'translate(' + (vis.intervalDates[0] > d.createdDate ? -1 : 1) * vis.translate(Math.abs( vis.intervalDates[0] - d.createdDate )) + ',' + 0 + ')'
                            })
                    .on("mouseover", function (d) {
                       
                       
                        vis.div.html(
                                '<div>' + // The first <div> tag
                                getConvertedDateForTooltip(d, "createdDate") + " - "
                                + getConvertedDateForTooltip(d, "updatedDate") +
                                "</div>" + "("
                                 + getDurationOfPullRequest(d.target.__data__.createdDate, 
                                    d.target.__data__.updatedDate,
                                    d.target.__data__.isOpened) + ")"+
                                    "<br/>" +
                                 d.target.__data__.title)
                            .style("left", (d.offsetX) + "px")
                            .style("top", (d.offsetY - 28) + "px");
                             vis.div.transition()
                                 .duration(200)
                                 .attr("transform", `translate( ${d.offsetX}, ${d.offsetY})`)
                                 .style("opacity", .9);
                    })
                    .on("mouseout", function (d) {
                        vis.div.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

    }

}
