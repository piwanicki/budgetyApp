
// Budget AP Controller
// IIFE (Immediately invoked function expression ) and modules for our budgety app

// Budget controller module
var budgetController = (function() {
    
    //Constructors for expense and income object
    var Expense = function(id, description, value) {
        this.id =id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // if -1 that won't exist... 
    };

    Expense.prototype.calcPerc = function(totalIncome){

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage =function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum+=current.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems : {
            exp : [],
            inc : [],
        },
        totals : {
            exp : 0,
            inc : 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function(type, des, val){
            
            var newItem, ID;

            //Create new item based on "inc" or "exp" type
            if(data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            } else {
                ID = 0;
            };

            //Create a new object based on input type
            if(type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            };

            //Add new object to array based on type
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){

            var ids, index;

            // map is creating a new array with id of objects
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1); // remove element of array
            }

        },

        calculateBudget: function(){
            
            // Calculate total income and expenses

            calculateTotal("exp");
            calculateTotal('inc');

            // Calculate budget : income - expenses 

            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            // example : 
            /*
                a=20 , b=10, c=40 , income=100
            */
            data.allItems.exp.forEach(function(current) {
                current.calcPerc(data.totals.inc);
            });
        },

       getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
       },


        getBudget: function(){
            return {
                budget: data.budget,
                totalIncomes: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentages: data.percentage,
            }
        },

        getData: function () {
            console.log(data);
        },

    
    };

})();

// UI controller module
var UIController = (function(){

    var DOMString = {
        inputType: ".add__type", 
        inputDescription: ".add__description",
        inputValue: ".add__value",
        buttonAdd: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        budgetIncomeValue: ".budget__income--value",
        budgetExpenseValue: ".budget__expenses--value",
        budgetExpensePercentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    var formatNumbers =  function(num, type){
                
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        
        if(int.length > 3 ) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var forEachNodeList = function(list, callback){
        for(var i =0; i< list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                 type: document.querySelector(DOMString.inputType).value, // inc or exp (value = x)
                 description: document.querySelector(DOMString.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMString.inputValue).value)
            };
        },

        getDOMString: function(){
            return DOMString;
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;

            // Create HTML string with placeholder string

                if(type === "inc") {
                    element = DOMString.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === "exp") {
                    element = DOMString.expensesContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%procent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // Replace the placeholder text with some actual data

                newHtml= html.replace("%id%",obj.id);
                newHtml= newHtml.replace("%description%",obj.description);
                newHtml= newHtml.replace("%value%",formatNumbers(obj.value, type));

                // Insert the HTML into the DOM

                document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
            },

            deleteListItem: function (selectorID) { 

                // some magic about select item to remove
                var element = document.getElementById(selectorID)
                element.parentNode.removeChild(element);
             },

            clearFields: function(){
                var fields, fieldsArray;

                fields = document.querySelectorAll(DOMString.inputDescription + ", " + DOMString.inputValue);  // Returning a list instead of array

                fieldsArray = Array.prototype.slice.call(fields);
                
                fieldsArray.forEach(function(current, index, array) {
                    current.value = "";
                });

                fieldsArray[0].focus();
            },

            displayBudget: function(obj) {

                var type;
                obj.budget > 0 ? type = "inc" : type = "exp";

                if(obj.budget > 0 ){
                    document.querySelector(DOMString.budgetLabel).textContent = formatNumbers(obj.budget,type);
                } else {
                    document.querySelector(DOMString.budgetLabel).textContent = (obj.budget).toFixed(2);
                }
                document.querySelector(DOMString.budgetIncomeValue).textContent = formatNumbers(obj.totalIncomes,"inc");
                document.querySelector(DOMString.budgetExpenseValue).textContent = formatNumbers(obj.totalExpenses,"exp");

                if(obj.percentages > 0 ){
                    document.querySelector(DOMString.budgetExpensePercentage).textContent = obj.percentages + '%';
                } else {
                    document.querySelector(DOMString.budgetExpensePercentage).textContent = '-';
                }
            },

            displayPercentages: function(percentagesArray){

                var fields = document.querySelectorAll(DOMString.expensesPercLabel);

               forEachNodeList(fields, function(current, index){

                if(percentagesArray[index] > 0){
                    current.textContent = percentagesArray[index] + '%';
                } else {
                    current.textContent = '---'
                }
               });
            },

            displayMonth: function(){
                var now, year, month, months; 

                now = new Date();
                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', ' November', 'December']

                month = months[now.getMonth()];
                year = now.getFullYear();

                document.querySelector(DOMString.dateLabel).textContent = month + " " + year;
            },

            changedType: function() {

                var fields = document.querySelectorAll(DOMString.inputType + ',' +  DOMString.inputDescription + ',' + DOMString.inputValue );

                forEachNodeList(fields, function (current){
                    current.classList.toggle('red-focus');
                });

                document.querySelector(DOMString.buttonAdd).classList.toggle('red');
            
            }
        };
})();



// Controller module
var controller = (function (bdgtCntrl,UICntrl) { 

    var DOM = UICntrl.getDOMString();

    var setupEventListeners = function() {

        document.querySelector(DOM.buttonAdd).addEventListener("click",cntrlAddItem);

        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13 ){
            cntrlAddItem();
            };
        });

        document.querySelector(DOM.container).addEventListener("click",cntrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICntrl.changedType);
    };

    var updateBudget = function(){

        // 1. Calculate the budget

        bdgtCntrl.calculateBudget();

        // 2. return the budget

        var budget = bdgtCntrl.getBudget();

        // 3. Display the budget

        console.log(budget);
        UICntrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        // 1. Calculate percentage of total 

        bdgtCntrl.calculatePercentages();

        // 2. Read percentages from the budget controller

        var percentages = bdgtCntrl.getPercentages();

        // 3. update UI

        UICntrl.displayPercentages(percentages)

        console.log(percentages);

    };

    var cntrlAddItem = function() {

        var input, newItem;

        // 1. Get the filed input data
        input = UICntrl.getInput();
        
        // 2. Add the item to budget controller
        if( !isNaN(input.value) && input.description !== "" && input.value > 0){

            newItem = bdgtCntrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the list and clear input fields 
            UICntrl.addListItem(newItem,input.type);
            UICntrl.clearFields();

        // 4. Update budget    
            updateBudget();

        // 5. update percentages           
            updatePercentages();
        }
    };


    var cntrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //some input like inc-1, exp-2

            splitID = itemID.split('-');
            type= splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from the data structure

            bdgtCntrl.deleteItem(type, ID);

            // 2. delete the item from the ui

            UICntrl.deleteListItem(itemID);

            // 3. update and show the new budget

            updateBudget();

        }
    };

    return {
        init: function() {
            console.log("Aplikacja uruchomiona.")
            UICntrl.displayMonth();
            UICntrl.displayBudget({
                budget: 0,
                totalIncomes: 0,
                totalExpenses: 0,
                percentages: -1,

            });
            setupEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();




