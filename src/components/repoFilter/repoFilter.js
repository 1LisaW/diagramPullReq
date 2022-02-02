
const repoFilter = ( parent, options ) => {
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
        // console.log (repo);
    };
    filterField.addEventListener("change", (event) => {
        const currVal = event.currentTarget.value;
        if (currVal !== "all"){
            repoInfo.innerText = "filtered by repo: " + currVal;
        }
        else {
            repoInfo.innerText ="all repos info";
        }
    })
}

export {repoFilter}