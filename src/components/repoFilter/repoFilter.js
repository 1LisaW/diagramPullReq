import './repoFilter.css';

const repoFilter = ( parent, options ) => {
    const callbacks =[];
    const parentElement = document.querySelector(parent);
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper-repo-filter");
    parentElement.append(wrapper);

    const repoInfo = document.createElement("div");
    repoInfo.setAttribute( "id", "repo-info");
    repoInfo.innerText = "all repos info";
    wrapper.append( repoInfo );

    const filterField = document.createElement("select");
    filterField.setAttribute("id","repo-filter");
    wrapper.append(filterField);

    for (let repo of options ){
        const repoOption = document.createElement("option");
        repoOption.setAttribute( "value", repo );
        repoOption.innerHTML = repo;
        filterField.append( repoOption );
    };
    filterField.addEventListener("change", (event) => {
        const currVal = event.currentTarget.value;
        if (currVal === "all"){
            repoInfo.innerText = "all repos info";
        }
        else if((currVal ==="back")||(currVal === "front")){
            repoInfo.innerText = `${currVal} repos info`;
        }
        else {
            repoInfo.innerText = "filtered by repo: " + currVal;
        }
        callbacks.forEach( callback => callback());
    })
    // return (callback =>{
    //     if (callback){
    //         callbacks.push(callback);
    //     }
    //     return () => filterField.value;
    // })
    return {
        onRepoChange: (callback) => {
             if ( typeof callback !=="function") {
                throw new Error("need function");
             }
            callbacks.push(callback);
        },
        getCurrentRepo: () => filterField.value
        
    }
}

export {repoFilter}
