//BUDGET CONTROLLER
var budgetController= (function(){
    //data model for expenses
    var Expense =function(id,description, value){
        this.id = id;
        this.description=description;
        this.value=value;
        this.percentage=-1
    }
    //we calculate the percentage WE HAVE AN INTEGER PERCENTAGE VALUE
    Expense.prototype.calcPercentage=function(totalIcome){
        if(totalIcome>0){
            this.percentage = Math.round((this.value / totalIcome) * 100);
        }else{
            this.percentage = -1;
        }
    }

    //get the value and return it 
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }

    //data model for income
    var Income= function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal= function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum+=current.value;
        })
        //save it to our data structure
        data.totals[type]=sum;
    }

    //data structure ready to receive data 
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percantage:-1
    }
    return{
        //allow other modules to add an item into our data structure
        addItem:function(type,des, val){
            var newItem,ID;
            //generate new ID BASED ON 'INC OR 'EXP' TYPE
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID=0;
            }
            if(type==='exp'){
                newItem = new Expense(ID, des, val); 
            }else if(type==='inc'){
                newItem= new Income(ID,des, val);
            }    
            //PUSH IT INTO OUR DATA STRUCTURE
            data.allItems[type].push(newItem);
            //RETURN THE NEW ELEMENT
            return newItem;  //we return so the other module which will call the method have the newItem available
        },

        //delete an item from our data structure
        deleteItem:function(type, id){
            var ids, index;
            ids= data.allItems[type].map(function(current){
                return current.id;
            }) 
            index=ids.indexOf(id);
            if(index !==-1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget:function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income- expenses 
            data.budget=data.totals.inc-data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage=-1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current, index, array){
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages:function(){
            var allPerc= data.allItems.exp.map(function(current){
                //getPerentage is the method we added to the Expense prototype
                //we create an array with all the percentage values from our objects
                return current.getPercentage();
            })
            return allPerc;
        },

        getBudget:function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        //testing method to see if we save to our database
        testing: function(){
            console.log(data);
        }
    }
})();



//UI CONTROLLER
var UIController=(function(){
    //IN CASE WE WANT TO CHANGE THE CLASS NAMES
    var DOMstrings={
        inputType: '.add__type', // willl be either 'inc' or 'exp'
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetMonth: '.budget__title--month',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel:'.item__percentage',
        dateLabel:'.budget__title--month',
        inputType:'.add__type'
    }

    //takes a number as an input and gives it a specific appearence 
    var formatNumber= function(num, type){
        var numSplit, int, dec, sign;
        //1. + or - before number 
        //2. exactly 2 decimal points 
        //3. comma separating the thousands 
        //example 2310.456--> +2,310.45
        num = Math.abs(num);
        num = num.toFixed(2);
        // use the split method on the string that .toFixed() returns
        numSplit = num.split('.');//returns an array 
        int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
        dec = numSplit[1];
        type === 'exp' ? sign = '-' : sign = '+';
        return sign+' '+int+'.'+dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            //this is the current , index parameters that we will pass later
            //it will execute the code we have in the callback as many times as the length is
            callback(list[i], i);
        }
    }

    return {
        getInput:function(){
            //read input values and return all them at the same time as an object to be used from controler
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            //create html string with placeholder text
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //replace the placeholder text with some actual data
            newHtml= html.replace('%id%', obj.id);
            newHtml= newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            //insert the HTML into the DOM (first we select the element we want to manipulate and then we add the html we want with insertAdjacentHTML();)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem:function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            //returns a list it doesn't have the methods arrays have
            fields=document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
            //trick to make the nodelist to an array by using the slice method through call method
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(currentValue, index, arrayEntire){
                //set the value to an empty sting will clear the fields
                currentValue.value="";
            })

            //set the focus to the first elemenet of the array
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget>0? type='inc': type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
    
            //when we dont have income it will not display -1 for percentage but ---
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +'%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages:function(percentages){
            var fields;
            // select all item-percentage. will return a Node list 
            fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            /*loop through the selection we did above and change the text content property 
            we will create our own forEach because we have a Nodelist */
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index]+'%';
                }else{
                    current.textContent = '--';
                }
            })
        },

        displayMonth:function(){
            var now,year,month,months;
            now= new Date();
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' '+year;
        },

        changedType: function(event){
           //select the elements that we will apply the red border
           var fields = document.querySelectorAll(
               DOMstrings.inputType+','+
               DOMstrings.inputDescription+','+
               DOMstrings.inputValue
           )
           nodeListForEach(fields,function(current){
               //we add the red focus class
                current.classList.toggle('red-focus');
           });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },

        getTheDOMstrings: function(){
            return DOMstrings; //DOMstrings is a private variable we need to return it to be accesible from other modules
        }


    }
})();



//GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl,UICtrl){
    //we add the eventlisteners inside of a function for better structure
    var setupEventListeners= function(){
        //we get the dom strings from the ui controller
        var DOM = UICtrl.getTheDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);//we can pass a function we have not only anonymous functions
        //keypress listener for enter at the form 
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }

    var updateBudget=function(){
        var budget;
        //we write a custom function because we will use the same code twice 
         // 1. calculate the budget
        budgetCtrl.calculateBudget();
         // 2.return the budget
        budget=budgetCtrl.getBudget();
        //  3. display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    

    var ctrlAddItem= function(){
        var input, newItem;
        // WE WRITE WHAT WE NEED TO DO ITS FROM THE TODO LIST WE DID AT THE START
        // 1. get the field input data
        input=UICtrl.getInput();

        //we check if the inputs so they have a value
        //and not sumbit empty lines 
        if(input.description !=="" && !isNaN(input.value &&input.value>0)){
            // 2. add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value); //we get the input object from step 1 which contains all the documen....values from inputs. this will add the new exp or inc from input to our database

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. clear the fields
            UICtrl.clearFields();

            //5. calculate and update budget
            updateBudget();

            //6. calculate and update percantages
            updatePercentages();
        }
    };

    var updatePercentages=function(){
        var percentages;
        //1. calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. read percentages from the budget controller
        percentages=budgetCtrl.getPercentages();
        //3. update the ui the new percentage
        UICtrl.displayPercentages(percentages);
    }

    var ctrDeleteItem= function(event){
        var itemID, splitID,type, ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type= splitID[0];
            ID=parseInt(splitID[1]);

            //1. Delete the item from the data structure 
            budgetCtrl.deleteItem(type,ID);
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
            //4. calculate and update percentages
            updatePercentages();
        }
    }

    return {
        init: function(){
            console.log('application has started');
            //we use the display budget with a custom object to set everything to zero
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();
