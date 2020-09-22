/*
Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
});
*/

var trice = new Vue({
    el: '#trice',
    data: {
        rows: [
            {
                columns: [new EmptyCell(),new EmptyCell(),new EmptyCell(),new EmptyCell()]
            },                 
            {   
                columns: [new EmptyCell(),new EmptyCell(),new EmptyCell(),new EmptyCell()]
            }, 
            {
                columns: [new EmptyCell(),new EmptyCell(),new EmptyCell(),new EmptyCell()]
            }
            ],
        diceColors: ["w","o","p"],
        numberOfDice: 4,
        dice: [],
        players: [{name: "Player 1", color: "blue"}, {name: "Player 2", color: "red"}],
        currPlayerIndex: 0,
        selectedDieId: -1,
        selectedRow: -1,
        selectedColumn: -1,
        movedDice: [] //dice moved in board completed
    },
    computed: {         
        boardCompleted: function() {return this.dice.length === 0},
        currentPlayer: function(){ return this.players[this.currPlayerIndex]},
        nextMoveDescription: function(){
                if(!this.boardCompleted) {
                    if(this.selectedDieId === -1) {
                        //select die
                        return this.currentPlayer.name + " must select a die.";
                    }
                    else {
                        //place die
                        return this.currentPlayer.name + " must place a die.";                      
                    }
                }
                else if(this.movedDice.length === 0) {
                    if(this.selectedDieId === -1) {
                        //select die on board
                        return this.currentPlayer.name + " must select a die.";
                    }
                    else {
                        //select die to move
                        return this.currentPlayer.name + " must select an adjacent die.";
                    }
                }
                else
                {
                    return this.currentPlayer.name + " must increment the value of one moved dice";
                }

                return "mmm... i don't know";
            }
    },
    methods: { 
        DoNothing: function(){
            console.log(this.numberOfDice);
        },
        NextPlayer: function() {
            this.currPlayerIndex = this.currPlayerIndex === 1 ? 0 : 1;
        },
        SelectDiePool: function(event) {
            //can't change selection
            if(this.selectedDieId >= 0) return;

            //console.log(this);
            this.selectedDieId = parseInt(event.toElement.id.split("-")[1]);
            console.log("Selected el: " + this.selectedDieId.toString());
            this.NextPlayer();
        },
        SelectCell: function(event) {
            if(!this.boardCompleted) {
                /*PLACE DIE*/
                //no die selected
                if(this.selectedDieId < 0) return;
                const selectedRow = parseInt(event.toElement.id.split("-")[1]);
                const selectedColumn = parseInt(event.toElement.id.split("-")[2]);

                //cell already contains a die
                if($('#' + event.toElement.id + '.dice').length > 0) return;

                console.log("place at: " + selectedRow + ", " + selectedColumn);            

                dieIndex = findDieIndex(this.dice,this.selectedDieId);
                this.rows[selectedRow].columns[selectedColumn] = this.dice[dieIndex];
                this.dice.splice(dieIndex, 1);
                this.selectedDieId = -1;

            } else {
                if(this.selectedDieId >= 0) {
                    //die to change
                    const selectedRow = parseInt(event.toElement.id.split("-")[1]);
                    const selectedColumn = parseInt(event.toElement.id.split("-")[2]);

                    //check adjacency
                    if((this.selectedColumn === selectedColumn && (this.selectedRow === selectedRow-1 || this.selectedRow === selectedRow+1)) ||
                      (this.selectedRow === selectedRow && (this.selectedColumn === selectedColumn-1 || this.selectedColumn === selectedColumn+1))) {
                        console.log("legal move");

                        const d1 = this.rows[this.selectedRow].columns[this.selectedColumn];
                        const d2 = this.rows[selectedRow].columns[selectedColumn];

                        this.movedDice = [d1,d2];

                        this.rows[this.selectedRow].columns[this.selectedColumn] = d2;
                        this.rows[selectedRow].columns[selectedColumn] = d1;

                    }
                    else {
                        console.log("not legal move");
                        return;
                    }

                    this.selectedRow = -1;
                    this.selectedColumn = -1;
                    this.selectedDieId = -1;

                }
                else if(this.movedDice.length > 0) {
                    //just moved
                    const selectedRow = parseInt(event.toElement.id.split("-")[1]);
                    const selectedColumn = parseInt(event.toElement.id.split("-")[2]);

                    if(this.rows[selectedRow].columns[selectedColumn].class().includes("moved")) {
                        //ok
                        //round increment
                        this.rows[selectedRow].columns[selectedColumn].pips %= 6;
                        this.rows[selectedRow].columns[selectedColumn].pips++;

                        this.movedDice = [];
                    }
                    else {
                      return;
                    }
                }
                else {
                    /*SELECT DIE*/
                    this.selectedRow = parseInt(event.toElement.id.split("-")[1]);
                    this.selectedColumn = parseInt(event.toElement.id.split("-")[2]);

                    this.selectedDieId = this.rows[this.selectedRow].columns[this.selectedColumn].id;

                    this.NextPlayer();
                }
            }

        }
    },
    mounted: function() {
        RollDice(this.$data);
    }
});

function findDieIndex(list, id) {
    for (var i = list.length - 1; i >= 0; i--) {
        if(list[i].id === id) return i;
    }
}

function EmptyCell()
{
    this.class = function() {return "empty"};
}

function Die(id, color, pips) {
    this.id = id;
    this.color = color;
    this.pips = pips;
    this.class = function() { 
        //all dice
        let s = "dice ";
        s += this.color + " ";
        s += "pips-" + this.pips.toString() + " ";
        if(this.selected()) { s += "selected " + trice.currentPlayer.color  + " ";}
        if(trice.movedDice.length > 1 && (trice.movedDice[0].id == this.id || trice.movedDice[1].id == this.id)) { s += "moved "; }
        return s;
    }
    this.selected = function() { return this.id === trice.selectedDieId};
    this.elementId = function() { return "dice-" + this.id;};
}

function RollDice(trice){
    for (var i = trice.diceColors.length - 1; i >= 0; i--) {
        const col = trice.diceColors[i];
        for (var j = trice.numberOfDice-1; j >= 0; j--) {
            trice.dice.push(new Die(i*trice.numberOfDice+j, col, Math.ceil(Math.random()*6)));
        }
    }
}



/*
Vue.component('cell', {
  template: '<div :class="myClass">{{ item.id }}</div>',
  props: ['item'],
  computed: {
    myClass () {
      return this.item.class;
    },
  },
});
*/