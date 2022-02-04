const newData = fetch('./data/all_prs.json');

const api = async () => {
    const dataJSON = await newData;
    const data = await dataJSON.json();
    const currantData = data.data.reduce((acc, curr, ind) => {
        const {
            repoName,
            id,
            title,
            createdDate,
            isOpened,
            isDeclined,
            updatedDate
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
    }, []);
    currantData.sort((a, b) => a["createdDate"] - b["createdDate"]);
    return currantData;
}

export {api}