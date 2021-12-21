const newData = fetch('/data.json');
import {newDiagram} from '/diagram.js';
import {createSorter} from './src/components/sorter/sorter.js';
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
        const {title,createdDate,isOpened,isDeclined,updatedDate}= curr;
        const newValue = {title,createdDate,isOpened,isDeclined,updatedDate}
        
        acc.push(newValue)
        return acc;
    },[]); 
    createSorter(currantData,getSorted);
    return getSorted(currantData);
    
}
function getSorted(currantData){
    let sorterOrder = document.querySelector(".search_select") ? 
        document.querySelector(".search_select").value : "createdDate";
    currantData.sort((a,b)=>b[sorterOrder]-a[sorterOrder]);
    console.log("sorterOrder "+sorterOrder);
    // let arrCreate =
    console.log(currantData.map(({createdDate})=>{return (createdDate)}));
    console.log(currantData.map(({updatedDate})=>{return (updatedDate)}));

    newDiagram(currantData);
    return currantData;
}


getData("createdDate",newData);