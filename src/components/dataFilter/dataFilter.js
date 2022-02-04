import './dataFilter.css';
import 'lightpick/css/lightpick.css'

import moment from "moment";
import Lightpick from "lightpick";

const getDateFilter = (dates)=> {
    const callbacks = [];
    const chartWrapper = document.getElementById("chart-wrapper");
    const dataWrapper = document.createElement("div");
    dataWrapper.classList.add("data-wrapper");
    chartWrapper.append(dataWrapper);
    const infoText = document.createElement("div");
    infoText.classList.add("datepicker-text");
    // setting start values for datepicker's text
    infoText.innerHTML = moment(dates[1]).subtract(7,'day').format('Do MMMM YYYY ') + ' to ' + moment(dates[1]).format('Do MMMM YYYY ');
    dataWrapper.append(infoText);

    const pickerFirstField = document.createElement("input");
    pickerFirstField.setAttribute("id", "datepicker-first-field");
    pickerFirstField.setAttribute("type", "text");
    dataWrapper.append(pickerFirstField);
    const pickerSecondField = document.createElement("input");
    pickerSecondField.setAttribute("id", "datepicker-second-field");
    pickerSecondField.setAttribute("type", "text");
    dataWrapper.append(pickerSecondField);

    const picker = new Lightpick({
        field: pickerFirstField,
        secondField: pickerSecondField,
        repick: true,
        startDate: moment(dates[1]).subtract(7, "day"),
        endDate: moment(dates[1]),
        minDate: moment(dates[0]),
        maxDate:
        moment(dates[1]),

        onSelect: (start, end) => {
            var str = '';
            str += start ? start.format('Do MMMM YYYY') + ' to ' : '';
            str += end ? end.format('Do MMMM YYYY') : '...';
            infoText.innerHTML = str;
            callbacks.forEach( callback => callback());
        }
    })
    const getNewInterval = ()=>{
        return [
            moment(pickerFirstField.value, "DD/MM/YYYY")._d.getTime(),
            moment(pickerSecondField.value, "DD/MM/YYYY")._d.getTime()
        ];
    }

    return {
        onIntervalChange : (callback) => {
        callbacks.push(callback);
        return getNewInterval;
        },
        getCurrantInterval: getNewInterval
        }
};
export {getDateFilter}
