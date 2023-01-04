//import { FILLselect, FINDparentele } from "../repo/tools/vg-displaytools.js"
//import { wrdom, wotablerow, Categories, Tiers, Systems, SwapToExample } from "./Hardcodes.js"

var {FormList} = require('../../repo/tools/box/vhc-formlist.js');

//CHANGES MADE TO OTHER FILES: Added 'FILLselect' to vg-displaytools.js

//TODO: Change system input to input, allow it to accept datalist
//TODO: Clarify what we are checking before adding input - currently, checks system+category combo
//TODO: Notify user of system already added

//TODO: extend FormList to utilize get/set .form (returns/accepts=[])
const wrdom ={
    cont:'container',
    values:{
      system:'system',
      tiers: 'tiers',
      category:'category',
      swap:'swap',
      swapto:'swapto'
    }
}

const Tiers = [
    {
        text: 'Complete',
        value: 'complete'
    },
    {
        text: 'Clever',
        value: 'clever'
    },
    {
        text: 'Constant',
        value: 'constant'
    },
    {
        text: 'Classic',
        value: 'classic'
    }
]

const Categories = [
    {
        text: "Thermostat",
        value: "thermostat",
        list: []
    },
    {
        text: "Humidifier",
        value: "humidifier",
        list: []
    },
]

const Systems = [
    {
        text: "Indoor",
        value: "sys1"
    },
    {
        text: "Outdoor",
        value: "sys2"
    }
]

const tempdata = [
    {
        system: "system0",
        category: "hum",
        swap: "hum 1",
        swapto: "hum 2"
    },
    {
        system: "system1",
        category: "therm",
        swap: "therm 1",
        swapto: "therm2"
    }
]

const mainoptions = {
    system:{
        options:[
            {
                text: "Outdoor",
                value: "system1"
            },
            {
                text: "Indoor",
                value: "system2"
            }
        ]
    },
    categories:{
        options:[
            {
                text:"Thermostat",
                value:"therm"
            },
            {
                text:"Humidifier",
                value:"hum"
            }
        ]
    }
}

const wotablerow=`
    <div class = "${wrdom.values.system}"></div>
    <div class = "${wrdom.values.tiers}"></div>
    <div class = "${wrdom.values.category}"></div>
    <div class = "${wrdom.values.swap}"></div>
    <select class = "${wrdom.values.swapto}"><select>
`

const SwapToExample = [
    {
        text: "Thermostat Large",
        value: "TH45"
    },
    {
        text: "Thermostat Small",
        value: "TH25"
    }
]


class SwapTable extends FormList{
    constructor({
            cont,
            list
        }){
        super({
          cont:cont,
          list:list
        });
        //Initialize vars
        this.data = data; //data from quote
        this.dom = wrdom;
        this.rowform = wotablerow;

        //Define systems, tiers, and categories
        this.systems = Systems;
        this.tiers = Tiers;
        this.categories = Categories;

        /*
        //Create ListForm
        this.form = new FormList({
            cont: document.getElementById('table-cont')
        })
        */

        //Load already created data
        this.LOADlist(this.list);

        //Fill all pre-made dropdowns

        //FILL SYSTEMS
        //FILLselect(document.getElementById('system-select'), this.systems);
        //FILL TIERS
        //FILLselect(document.getElementById('tier-select'), this.tiers);
        //FILL CATEGORIES
        //FILLselect(document.getElementById('category-select'), this.categories);

        //Event listener for adding a new row
        console.log(this.cont);
        this.cont.getElementsByClassName('add-row')[0].addEventListener('click', (eve)=>{
            //Grab inputs and create an item
            let SystemSelectInput = document.getElementById('system-select');
            let TierSelectInput = document.getElementById('tier-select');
            let CategorySelectInput = document.getElementById('category-select');
            let NewItem = {
                system:SystemSelectInput[SystemSelectInput.selectedIndex].text,
                tiers:TierSelectInput[TierSelectInput.selectedIndex].text,
                category:CategorySelectInput[CategorySelectInput.selectedIndex].text,
                swap:"Thermostat 242", //Here goes the swap item
                swapto:SwapToExample //Here goes the list of options you want to swap to
            }

            //Check for row, then add if not already added
            let RowCheck = document.getElementById("row-"+NewItem[wrdom.values.system]+"-"+NewItem[wrdom.values.tiers]+"-"+NewItem[wrdom.values.category])
            if (!RowCheck) {
                this.data.push(NewItem);
                this.form.LOADlist(this.data);
            }
        })
    };//END CONSTRUCTOR
    INITcontent(){return`
    <div class='fl-list' id = 'table-cont'>

    </div>
    <div class = 'fl-header' id="input-cont">
        <select class = "bottom-select" id = "system-select"></select>
        <select class = "bottom-select" id = "tier-select"></select>
        <select class = "bottom-select" id = "category-select"></select>
        <div class = "action-button add-row">Add Input</div>
    </div>
    `};

    SETrow(item={}){
        let row = document.createElement('div');
        row.classList.add('form-row');
        row.innerHTML=wotablerow;
        //Change ID of row to enable row check
        if (item!={}) {
            row.id = "row-"+item[wrdom.values.system]+"-"+item[wrdom.values.tiers]+"-"+item[wrdom.values.category];
        }
        //Loop through class names in dom
        for(let v in wrdom.values){
            if(v) {
                let elem = row.getElementsByClassName(wrdom.values[v])[0]; //Check if element exists in the table
                if (elem) {
                    //Check and fill item table
                    if (item != {}) {
                        //Check type of input
                        if (wrdom.values[v] == "swapto" && elem.tagName == "SELECT") {
                            FILLselect(elem, item[wrdom.values[v]]);
                        } else {
                            elem.innerText = item[wrdom.values[v]]
                        }
                    } else {
                        elem.innerText = data[0][v]
                    }

                    //Event listener for change of swapto dropdown
                    if (elem.className == "swapto") {
                        elem.addEventListener('change', (eve)=>{
                            console.log("Changed SwapTo Dropdown to", elem[elem.selectedIndex].text)
                        })
                    }
                }
            }
        }

        return row;
    }

    GETrow(){

    }

}

module.exports={
  SwapTable
}
