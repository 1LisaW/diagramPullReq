import "d3";
// * as d3 from "./node_modules/d3/dist/d3.min.js"
import {moment} from "moment";
import "lightpick";
// import * as d3.d3Tip from "./node_modules/d3-tip/dist/index.js"
// window.d3 = d3;

const newData = fetch('./data/all_prs.json');
import {newDiagram} from '/diagram.js';
import {createSorter} from './src/components/sorter/sorter.js';
import { buttonSlider } from './src/components/buttonSlider/buttonSlider.js';
import Chart from './src/components/chart/chart.js';
// import "./src/components/chart/d3-tip.js";

import {getDateFilter} from"./src/components/dataFilter/dataFilter.js";
import { repoFilter } from './src/components/repoFilter/repoFilter.js';

const periodSlider={
    monthAgo:{
        text:"&lt мес."
    },
    weekAgo:{
        text:"&lt нед."
    },
    nowdays:{
        text:"текущий период"
    },
    weekPlus:{
        text:"&gt нед."
    },
    monthPlus:{
        text:"&gt мес."
    }

};

const wrapperDiagram = document.querySelector('.wrapper-grafic');


function millisToDateOursMinutesAndSeconds(millis) {
    const currantDate = new Date(millis);
    const day = currantDate.getDay();
    const month = currantDate.getMonth()+1;
    const year = currantDate.getFullYear();
    const date = currantDate.toString('yyyy MM dd');
    const days = Math.floor(millis/( 60000 * 60 * 24));
    const ours = Math.floor(millis/ (60000 * 60)) %24;
    const minutes = Math.floor(millis / 60000) %60;
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    console.log( day + "." + (month < 10 ? '0' : '') + month + "." + year);
    console.log((ours < 10 ? '0' : '') + ours + ":"+ (minutes < 10 ? '0' : '') +
    + minutes  + ":" + (seconds < 10 ? '0' : '') + seconds);
    return (ours < 10 ? '0' : '') + ours + ":"+ (minutes < 10 ? '0' : '') + minutes +
    + ":" + (seconds < 10 ? '0' : '') + seconds;
};

const addElemGrid = (elem)=>{
    const newElem = document.createElement("div");
    newElem.classList.add('grafic-row');
    if (elem.isOpened){
        newElem.classList.add('grafic-row--opened');
    }
    else{
        newElem.classList.add('grafic-row--closed');
    }
    //1 px===1 our
    newElem.style.width = ((elem.updatedDate-elem.createdDate)/3600000).toFixed(0);
    const text = document.createTextNode(((elem.updatedDate-elem.createdDate)/3600000).toFixed(1));
    newElem.appendChild(text);
    wrapperDiagram.appendChild(newElem);
}



async function getData(sorterOrder,newData){
    const dataJSON = await newData;
    const data = await dataJSON.json();
    const currantData =  data.data.reduce((acc,curr,ind)=>{
        const {
            repoName, id, title, createdDate, isOpened, isDeclined, updatedDate
        } = curr;
        const newValue = {
            repoName,
            id,
            title,
            createdDate,
            isOpened,
            isDeclined,
            updatedDate
        }
        
        acc.push(newValue)
        return acc;
    },[]); 
    createSorter(currantData,getSorted);
    for (let name in periodSlider){
        buttonSlider(periodSlider[name].text);
    };

    // **** new visualisation*****

     const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
     let today = Math.floor(new Date() / interval) * interval;

    const dateLimits = currantData.reduce( (acc, curr) => {
        acc[0] = acc[0] > curr.createdDate ? curr.createdDate : acc[0];
        acc[1] = curr.isOpened ? today : (acc[1] < curr.updatedDate ? curr.updatedDate : acc[1]);
        return acc;
    }, [currantData[0].createdDate,currantData[0].createdDate]);
    const repoNames = new Set(['all']);
    currantData.map(curr => repoNames.add(curr.repoName));

    const rerenderChart=()=>{
        chart.wrangleVis();
    }
    
    getDateFilter(dateLimits, rerenderChart);
    const datepickerFirstDate = document.getElementById("datepicker-first-field");
    const datepickerSecondDate = document.getElementById("datepicker-second-field");
    

    repoFilter( "#chart-wrapper", repoNames );
    const repoFilterElem = document.getElementById("repo-filter");


    const chart = new Chart("#chart-wrapper", currantData);

    // console.log(chart);

    datepickerFirstDate.addEventListener("click", () => {
        console.log("here!");
        chart.wrangleVis();
    });
    datepickerSecondDate.addEventListener("change", () => {
        chart.wrangleVis();
    });
    repoFilterElem.addEventListener("change", () => {
        chart.wrangleVis();
    });
  
    return getSorted(currantData);
    
}
function getSorted(currantData){
    let sorterOrder = document.querySelector(".search_select") ? 
        document.querySelector(".search_select").value : "createdDate";
    currantData.sort((a,b)=>b[sorterOrder]-a[sorterOrder]);

    // newDiagram(currantData);
    return currantData;
}


getData("createdDate",newData);

// const newScale = d3.scaleTime().range([0,400]).domain([new Date('01.01.2011'), new Date("05.01.2011")]);
// console.log('test',new Date('01.01.2011'));
// console.log(newScale(new Date('01.01.2011')));
// console.log(newScale(new Date('02.01.2011')));
// console.log(newScale(new Date('03.01.2011')));
// console.log(newScale(new Date('04.01.2011')));
// console.log(newScale(new Date('31.12.2010')));


