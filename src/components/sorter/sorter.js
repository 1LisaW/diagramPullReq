import './sorter.css';

const  createSorter = (newData,callback)=>{
  const select_block = document.querySelector('header');
  const wrapper = document.createElement("div");
  wrapper.classList.add("dropdown");
  const label = document.createElement("label");
  label.setAttribute("for","search");
  label.classList.add("search_label");
  label.innerHTML = "Выберите сортировку";
  const select = document.createElement("select");
  select.classList.add("search_select");
  select.setAttribute("name","select");
  const options = [
    {value:"createdDate",text:"По дате создания"},
    {value:"updatedDate",text:"По дате окончания"}
  ];

  select_block.appendChild(label);
  select_block.appendChild(wrapper);
  wrapper.appendChild(select);
  for(let item of options){
    const option = document.createElement("option");
    option.setAttribute("value",item.value);
    option.innerHTML = item.text;
    select.appendChild(option);
}
  select.addEventListener("change",(data)=>{
     callback(newData,data.currentTarget.value);
  });
}

export {createSorter};
