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

Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});



var trice = new Vue({
    el: '#trice',
    data: {
        rows: [],
        tricePositions: [],
        rowNum: 3,
        colNum: 4,
        diceColors: ["w","o","p"],
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
        numberOfDice: function  () {return this.colNum*this.rowNum/this.diceColors.length;},
        boardCompleted: function() {return this.dice.length === 0},
        currentPlayer: function() {return this.players[this.currPlayerIndex]},
        nextPlayerIndex: function() {return this.currPlayerIndex === 1 ? 0 : 1; },
        nextMoveDescription: function(){
                if(this.rows.length === 0) return "";
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
        CreateGrid: function(){
            this.rows = [];
            for (var i = 0; i < this.rowNum; i++) {
                let c = [];  
                for (var j = 0; j < this.colNum; j++) {
                    c.push(new EmptyCell());
                }
                this.rows.push({columns: c});
            }
        },
        CreateTricePositions: function(){
            this.tricePositions = [];
            //horizontal
            for (var i = 0; i < this.rowNum; i++) {
                let shift = 0;
                while(this.colNum - shift >= 3)
                {
                    this.tricePositions.push([[i,shift],[i,shift+1],[i,shift+2]]);
                    shift++;
                }
            }

            //vertically  
            for (var i = 0; i < this.colNum; i++) {
                let shift = 0;
                while(this.rowNum - shift >= 3)
                {
                    this.tricePositions.push([[shift,i],[shift+1,i],[shift+2,i]]);
                    shift++;
                }
            }

            //diag \\  ----
            let shiftVert = 0            
            while(this.colNum  - shiftVert >= 3) {
                let shiftHor = 0;  
                while(this.rowNum - shiftHor >= 3) {                    
                    this.tricePositions.push([[shiftHor,shiftVert],[shiftHor+1,shiftVert+1],[shiftHor+2,shiftVert+2]]);
                    this.tricePositions.push([[shiftHor+2,shiftVert],[shiftHor+1,shiftVert+1],[shiftHor,shiftVert+2]]);
                    shiftHor++;   
                }
                shiftVert++;
            }


        },
        CheckWinCondition: function(){

            let winningTrice = [];

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


                if(winCond === 1) { 
                    console.log("WIN!"); 
                    winningTrice.push({winner: this.currPlayerIndex, dice: [d1,d2,d3], isLose: false});
                }
                else { 
                    //if a player make a double trice he lose and don't check for others winning conditions
                    console.log("LOSE!"); 
                    winningTrice = [{winner: this.nextPlayerIndex, dice: [d1,d2,d3], isLose: true}];
                    break;
                }
            }

            if(winningTrice.length === 1)
            {                
                winningTrice[0].dice[0].isWinningDie = true;
                winningTrice[0].dice[1].isWinningDie = true;
                winningTrice[0].dice[2].isWinningDie = true;

                this.winnerPlayerIndex  = winningTrice[0].winner;
            }
            else if(winningTrice.length > 1)
            {
                //multiple winning conditions... (only possible on isLose false)

                this.winnerPlayerIndex  = winningTrice[0].winner;

                for (var i =  winningTrice.length - 1; i >= 0; i--) {
                    if(winningTrice[i].isLose)
                    {
                        alert("ERROR! -- isLose in multiple winning conditions!");
                    }
  
                    winningTrice[i].dice[0].isWinningDie = true;
                    winningTrice[i].dice[1].isWinningDie = true;
                    winningTrice[i].dice[2].isWinningDie = true;


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
        //RollDice(this.$data);
        $('#startModal').modal();
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

function NewGame()
{
    if((trice.colNum*trice.rowNum)%trice.diceColors.length !== 0 )
    {
        alert("The cell number must by multiple of " + trice.diceColors.length.toString());
        return;
    }

    RollDice(trice);
    trice.currPlayerIndex = 0;
    trice.selectedDieId = -1;
    trice.selectedRow = -1;
    trice.selectedColumn = -1;
    trice.winnerPlayerIndex = -1;
    trice.movedDice = [];
    trice.CreateGrid();
    trice.CreateTricePositions();
}



function Die(id, color, pips) {
    this.id = id;
    this.color = color;
    this.pips = pips;
    this.rotation = Math.floor(Math.random()*10);
    this.class = function() { 
        //all dice
        let s = "dice ";
        s += this.color + " ";
        s += "pips-" + this.pips.toString() + " ";
        if(this.selected()) { s += "selected " + trice.currentPlayer.color  + " ";}
        if(trice.movedDice.length > 1 && (trice.movedDice[0].id == this.id || trice.movedDice[1].id == this.id)) { s += "moved "; }
        if(this.isWinningDie) { s += "winning " + trice.players[trice.winnerPlayerIndex].color + " " ; }
        s += "dr-" + this.rotation + " " ;
        return s;
    }
    this.selected = function() { return this.id === trice.selectedDieId};
    this.elementId = function() { return "dice-" + this.id;};
    this.isWinningDie = false;
}

function RollDice(tr){
    tr.dice = [];
    for (var i = tr.diceColors.length - 1; i >= 0; i--) {
        const col = tr.diceColors[i];
        for (var j = tr.numberOfDice-1; j >= 0; j--) {
            tr.dice.push(new Die(i*tr.numberOfDice+j, col, Math.ceil(Math.random()*6)));
        }
    }
    tr.dice.shuffle();
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