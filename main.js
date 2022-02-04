import {api} from './src/components/api/api.js';
import * as helpers from './surveFunctions.js'
import {newDiagram} from '/diagram.js';
import {createSorter} from './src/components/sorter/sorter.js';
import { buttonSlider } from './src/components/buttonSlider/buttonSlider.js';
import Chart from './src/components/chart/chart.js';

import {getDateFilter} from"./src/components/dataFilter/dataFilter.js";
import { repoFilter } from './src/components/repoFilter/repoFilter.js';

import './fonts/sb-sans-new.css';
import './fonts/sb-sans.css';
import './main.css';



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

async function getData(sorterOrder){
    const currantData = await api();
    const rerenderChart = () => {
        chart.wrangleVis();
    }

    const orderSorterCallback = createSorter(currantData);
    orderSorterCallback.onSorterChange(helpers.getSorted);
    orderSorterCallback.onSorterChange(rerenderChart);

    for (let name in periodSlider){
        buttonSlider(periodSlider[name].text);
    };

    // **** new visualisation*****

     const interval = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
     let today = Math.floor(new Date() / interval) * interval;

    const dateLimits = helpers.getDateLimits( currantData, today );

    const repoNames = new Set(['all', 'front', 'back']);
    currantData.map(curr => repoNames.add(curr.repoName));

    

    const dateFilterCallbacks = getDateFilter(dateLimits);
    dateFilterCallbacks.onIntervalChange(rerenderChart);

   
    const repoFilterCallbacks = repoFilter("#chart-wrapper", repoNames);
    repoFilterCallbacks.onRepoChange(rerenderChart);

    const repoFilterElem = document.getElementById("repo-filter");


    const chart = new Chart("#chart-wrapper", currantData, dateFilterCallbacks.getCurrantInterval, 
        repoFilterCallbacks.getCurrentRepo,
        orderSorterCallback.getCurrentSorter);


    return helpers.getSorted(currantData);

}



getData("createdDate");

