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
        tricePositions: [[[0,0],[0,1],[0,2]],[[0,1],[0,2],[0,3]], //1st row
                         [[1,0],[1,1],[1,2]],[[1,1],[1,2],[1,3]], //2nd row
                         [[2,0],[2,1],[2,2]],[[2,1],[2,2],[2,3]], //3rd row
                         [[0,0],[1,0],[2,0]], //1st col
                         [[0,1],[1,1],[2,1]], //2nd col
                         [[0,2],[1,2],[2,2]], //3rd col
                         [[0,3],[1,3],[2,3]], //4th col
                         [[0,0],[1,1],[2,2]], //  \-
                         [[0,1],[1,2],[2,3]], //  -\
                         [[2,0],[1,1],[0,2]], //  /-
                         [[2,1],[1,2],[0,3]]  //  -/
                         ],
        diceColors: ["w","o","p"],
        numberOfDice: 4,
        dice: [],
        players: [{name: "Player 1", color: "blue"}, {name: "Player 2", color: "red"}],
        currPlayerIndex: 0,
        selectedDieId: -1,
        selectedRow: -1,
        selectedColumn: -1,
        winnerPlayerIndex: -1,        
        movedDice: [] //dice moved in board completed
    },
    computed: {         
        boardCompleted: function() {return this.dice.length === 0},
        currentPlayer: function() {return this.players[this.currPlayerIndex]},
        nextPlayerIndex: function() {return this.currPlayerIndex === 1 ? 0 : 1; },
        nextMoveDescription: function(){
                if(this.winnerPlayerIndex >= 0) {
                    this.currPlayerIndex = this.winnerPlayerIndex;
                    return this.players[this.winnerPlayerIndex].name + " is the winner!";
                }
                else if(!this.boardCompleted) {
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
        UndoMove: function(){
            console.log("todo");
        },
        CheckWinCondition: function(){
            //per ogni possibile trice
            for (var i = this.tricePositions.length - 1; i >= 0; i--) {
                d1 = trice.rows[trice.tricePositions[i][0][0]].columns[trice.tricePositions[i][0][1]];
                d2 = trice.rows[trice.tricePositions[i][1][0]].columns[trice.tricePositions[i][1][1]];
                d3 = trice.rows[trice.tricePositions[i][2][0]].columns[trice.tricePositions[i][2][1]];

                //console.log(trice.tricePositions[i]);
                let winCond = 0;

                //check there are 3 dice
                if(d1.class().includes("empty") || d2.class().includes("empty") || d3.class().includes("empty")) continue;

                //color check
                if(d1.color === d2.color && d2.color === d3.color) winCond++;

                //pips check
                if(d1.pips === d2.pips && d2.pips === d3.pips) winCond++;

                //order check
                if(d1.pips === d2.pips + 1 && d2.pips === d3.pips + 1) winCond++;
                if(d1.pips === d2.pips - 1 && d2.pips === d3.pips - 1) winCond++;




                //final check
                if(winCond === 0) { 
                    console.log("no win/lose");
                    continue;
                }

                d1.isWinningDie = true;
                d2.isWinningDie = true;
                d3.isWinningDie = true;

                if(winCond === 1) { 
                    console.log("WIN!"); 
                    this.winnerPlayerIndex = this.currPlayerIndex;
                }
                else { 
                    console.log("LOSE!"); 
                    this.winnerPlayerIndex = this.nextPlayerIndex;
                }

            }
        },
        NextPlayer: function() {
            this.currPlayerIndex = this.nextPlayerIndex;
        },
        SelectDiePool: function(event) {
            //game ended
            if(this.winnerPlayerIndex >= 0) return;
            
            //can't change selection
            if(this.selectedDieId >= 0) return;

            //console.log(this);
            this.selectedDieId = parseInt(event.toElement.id.split("-")[1]);
            console.log("Selected el: " + this.selectedDieId.toString());
            this.NextPlayer();
        },
        SelectCell: function(event) {
            if(!this.boardCompleted) {
                //game ended
                if(this.winnerPlayerIndex >= 0) return;

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

                //check for win or loose
                this.CheckWinCondition();

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

                        //check for win or loose
                        this.CheckWinCondition();
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
        if(this.isWinningDie) { s += "winning " + trice.players[trice.winnerPlayerIndex].color; }
        return s;
    }
    this.selected = function() { return this.id === trice.selectedDieId};
    this.elementId = function() { return "dice-" + this.id;};
    this.isWinningDie = false;
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