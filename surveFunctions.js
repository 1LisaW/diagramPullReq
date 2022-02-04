export const getSorted = (d) => {
        // change for dinamic value
        let sorterOrder = document.querySelector(".search_select") ?
            document.querySelector(".search_select").value : "createdDate";
        d.sort((a, b) => a[sorterOrder] - b[sorterOrder]);

        return d;
}

export const getDateLimits = (data, today) => {
    return data.reduce((acc, curr) => {
        acc[0] = acc[0] > curr.createdDate ? curr.createdDate : acc[0];
        acc[1] = curr.isOpened ? today : (acc[1] < curr.updatedDate ? curr.updatedDate : acc[1]);
        return acc;
    }, [data[0].createdDate, data[0].createdDate]);
}