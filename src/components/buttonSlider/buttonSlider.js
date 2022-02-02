import './buttonSlider.css';

const d3 = window.d3;
const graphMargin = 35;

const moveSvg = (buttonName) => {
    const ticks = document.querySelectorAll(".tick").length-2;
    const svg = document.querySelector("svg");
    const slideValue = (svg.width.baseVal.value/ticks)*6;
    const widthWrapper = document.querySelector(".wrapper-grafic-d3").getBoundingClientRect().width;
    const axis = d3.select(".axis");
    const requestList =d3.selectAll(".trace");
    switch(buttonName){
        case "&lt нед.":
            const tx = Math.max(0,Math.min(axis._groups[0][0].viewportElement.currentTranslate.x+slideValue, svg.width.baseVal.value -widthWrapper));
            axis.attr('transform', 'translate(' + tx + ',' + graphMargin + ')');
            requestList.attr('transform', 'translate(' + tx + ')');

            // svg.currentTranslate.x += (svg.currentTranslate.x+4*widthWrapper >= svg.width.baseVal.value ?
                // 0 : slideValue);
            break;
        case "&gt нед.":
            svg.currentTranslate.x -= (svg.currentTranslate.x-slideValue < 0 ?
                 svg.currentTranslate.x : slideValue);
            break;
    }

};

const buttonSlider = (buttonName) => {
    const select_block = document.querySelector('header');
    let wrapper = document.querySelector(".buttonWrapper");
    if (!wrapper){
        wrapper = document.createElement('div');
        wrapper.classList.add("buttonWrapper");
        select_block.appendChild(wrapper);
    };
    const button = document.createElement("button");
    button.classList.add("btn");
    button.innerHTML=buttonName;
    wrapper.appendChild(button);
    button.addEventListener("click",()=>{moveSvg(buttonName)});

}


export {buttonSlider};
