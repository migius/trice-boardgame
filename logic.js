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
        nextPlayer: 1,
        selectedDie: -1
    },
    computed: { },
    methods: { 
        SelectDie: function(event) {
            //console.log(this);
            this.selectedDie = parseInt(event.toElement.id.split("-")[1]);
            console.log("Selected el: " + this.selectedDie.toString());
        },
        PlaceDie: function(event) {
            if(this.selectedDie < 0) return;
            const selectedRow = event.toElement.id.split("-")[1];
            const selectedColumn = event.toElement.id.split("-")[2];


            console.log("place at: " + selectedRow + ", " + selectedColumn);

            dieIndex = findDieIndex(this.dice,this.selectedDie);
            this.rows[selectedRow].columns[selectedColumn] = this.dice[dieIndex];
            this.dice.splice(dieIndex, 1);
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
    this.class = function() { return "dice " + this.color + " pips-" + this.pips.toString() + (this.selected() ? " selected" : "") ;};
    this.selected = function() { return this.id === trice.selectedDie};
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