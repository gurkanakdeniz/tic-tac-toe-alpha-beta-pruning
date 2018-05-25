var playerImage = new Image();
playerImage.src = "images/o.png";
var computerImage = new Image();
computerImage.src = "images/x.png";
var board = new Array();
var BOARD_SIZE = 9;
var UNOCCUPIED = ' ';
var HUMAN_PLAYER = 'O';
var COMPUTER_PLAYER = 'X';
var active_turn = "HUMAN";
var choice;
var searchTimes = new Array();
var showAverageTime = true;

var derinlikVal = "";
var agacGosterVal = "";
var hamleGosterVal = "";

var hamleGoruntudivText = "";
var hamleGoruntudiv2Text = "";

//tum dugumler
var dugumler = {};

//dugumlere ait kenarlar { n0: [ n1, n1231], n2 } gibi dugum - baglintlili olduklari seklinde
var kenarlar = {};

// x derinliginde olan dugumler derinlik - dugumler seklinde
var derinlikDugum = {};

//cyto icin cizim datalari
var demoNodes = [];
var demoEdges = [];

var countNode = 0;


class Dugum{
    constructor(id, derinlik, oyun_pozisyon, kullanici, dalpha, dbeta){
        this.id = id;
        this.derinlik = derinlik;
        this.oyun_pozisyon = oyun_pozisyon;
        this.kullanici = kullanici;
        this.dalpha = dalpha;
        this.dbeta = dbeta;
        this.budama = false;
    }
}

function KenarlariOlustur(){

    for (var i = 1; i <= Object.keys(derinlikDugum).length; i++) {

        if(i <= derinlikVal ){

            var derinlikDugumleri = derinlikDugum[i];

            if(derinlikDugumleri){
                for (var a = 0; a < Object.keys(derinlikDugumleri).length; a++) {

                    var dugum1 = derinlikDugumleri[a];
                    var derinlik1 = dugum1.derinlik;
                    var id1 = dugum1.id;


                    var sourceId = -1;
                    var targetId = id1;
                    var oncekiDerinlikDugumleri = derinlikDugum[i - 1];
                    for (var k = 0; k < Object.keys(oncekiDerinlikDugumleri).length; k++) {

                        var dugum0 = oncekiDerinlikDugumleri[k];
                        var derinlik0 = dugum0.derinlik;
                        var id0 = dugum0.id;

                        if(id1 > id0 && sourceId < id0){
                            sourceId = id0;
                        }

                    }

                    if(kenarlar['n' + sourceId]){
                        kenarlar['n' + sourceId].push('n' + targetId);
                    }else{
                        kenarlar['n' + sourceId] = new Array();
                        kenarlar['n' + sourceId].push('n' + targetId);
                    }
                }
            }

        }



    }
}

function CytoDataOlustur(){

    $.each(dugumler, function(index, value) {

        if(value.derinlik <= derinlikVal ){

            var dugumKenarlar = kenarlar[index];

            var sourceT = index;
            var b = '';

            var pozisyon = value.kullanici + '\n' + b + 'alfa : ' + value.dalpha + ' beta : ' + value.dbeta + '\n\n';

            var count = 1;
            if(value.oyun_pozisyon){
                for (var i = 0; i < Object.keys(value.oyun_pozisyon).length; i++) {

                    var asd = value.oyun_pozisyon[i];

                    if(asd == ' ')
                        asd = 'b';

                    pozisyon = pozisyon + asd;

                    if(count % 3 == 0)
                        pozisyon = pozisyon + '\n';
                    else
                        pozisyon = pozisyon + ',';


                    count = count + 1;
                }
            }


            demoNodes.push({
                data: {
                    id: sourceT,
                    name: pozisyon
                }
            });

            if(dugumKenarlar){
                for (var i = 0; i < Object.keys(dugumKenarlar).length; i++) {

                    var targetT = dugumKenarlar[i];
                    demoEdges.push({
                        data: {
                          source: sourceT,
                          target: targetT

                      }
                  });
                }

            }
        }

        
    });

}

function NewGame() {

	$('#hamleGoruntu').text('');
    $('#hamleGoruntu2').text('');
    $('#cy').text('');
    $("#cy").removeClass();
    $("#cy").removeAttr("style");
    
    for (i = 0; i < BOARD_SIZE; i++)
    {
        board[i] = UNOCCUPIED;
        document.images[i].src = "images/blank.png";
    }
    DeleteTimes();
    showAverageTime = true;
    var alert = document.getElementById("turnInfo");
    active_turn = "HUMAN";
    alert.innerHTML = "Senin Sıran!";
}

function MakeMove(pos) {
    
    $('#hamleGoruntu').text('');
    $('#hamleGoruntu2').text('');


    if (!GameOver(board) && board[pos] === UNOCCUPIED)
    {
        board[pos] = HUMAN_PLAYER;
        document.images[pos].src = playerImage.src;
        if (!GameOver(board))
        {
            var alert = document.getElementById("turnInfo");
            active_turn = "COMPUTER";
            alert.innerHTML = "Bilgisayarın Sırası!";

            var basBoard = board.slice();
            /*var basNode = new Dugum(0, 0, basBoard, active_turn);*/
            var basNode = new Dugum(0, 0, basBoard, "HUMAN");
            dugumler['n' + 0 ] = basNode;

            derinlikDugum[0] = new Array();
            derinlikDugum[0].push(basNode);

            derinlikVal = $('#derinlikId').val();
            agacGosterVal = $('#agacGosterCheck').is(':checked'); 
            hamleGosterVal = $('#hamleGosterCheck').is(':checked'); 
            
            MakeComputerMove();

            if(hamleGosterVal){
                $('#hamleGoruntu').append(hamleGoruntudivText);
                $('#hamleGoruntu2').append(hamleGoruntudiv2Text);
            }

            if(agacGosterVal){
                KenarlariOlustur();
                CytoDataOlustur();
                cytoGoster();
            }

        }
    }

    countNode = 0;
    dugumler = {};
    kenarlar = {};
    derinlikDugum = {};
    demoNodes = [];
    demoEdges = [];
}


function cytoGoster(){

    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

            boxSelectionEnabled: false,
            autounselectify: true,
            layout: {
                name: 'dagre',
                nodeSep: 300,
                minLen : 4,
                rankSep : 200
            },

            style: [
                {
                  selector: 'node',
                  style: {
                    'background-color': '#11479e',
                    'content': 'data(name)',
                    'text-valign': 'bottom',
                    'text-wrap': 'wrap',
                    'width': 100,
                    'height': 100,
                    'font-size': 60
                  }
                  
                },

                {
                  selector: 'edge',
                  style: {
                    'width': 4,
                    'target-arrow-shape': 'triangle',
                    'line-color': '#9dbaea',
                    'target-arrow-color': '#9dbaea',
                    'curve-style': 'bezier'
                  }
                }
                

            ],

            elements: {
                nodes: demoNodes,
                edges: demoEdges
            }
        });

        //var nodes = demoNodes;
        //cy.$("#" + nodes[0].data.id).successors().targets().style("display", "none");

        //removes and restores nodes' children on click
        cy.on('tap', 'node', function(){          
          if (this.connectedEdges().targets()[1].style("display") == "none"){
                //show the nodes and edges
                this.connectedEdges().targets().style("display", "element");
            } else {
                //hide the children nodes and edges recursively
                this.successors().targets().style("display", "none");
            }
        });

        cy.nodes().forEach(function( element ){

            var currentNode = dugumler[element.id()];

            if(currentNode){
                if(currentNode.budama)
                    element.style('background-color', '#f44336');
            }

        });
}

function MakeComputerMove()
{
    var start, end, time;
    start = new Date().getTime() / 1000;
    alphaBetaMinimax(board, 0, -Infinity, +Infinity);
    end = new Date().getTime() / 1000;
    time = end - start;
    ShowTimes(time);
    var move = choice;
    board[move] = COMPUTER_PLAYER;
    document.images[move].src = computerImage.src;
    choice = [];
    active_turn = "HUMAN";
    if (!GameOver(board))
    {
        var alert = document.getElementById("turnInfo");
        alert.innerHTML = "Senin Sıran!";     
    }
}

//   1 beraberlik
//   2 human
//   3 computer
function GameScore(game, depth) {
    var score = CheckForWinner(game);
    if (score === 1)
        return 0;
    else if (score === 2)
        return depth-10;
    else if (score === 3)
        return 10-depth;
}

function ekranaYazAppend(user, p_game, move, depth, countNode, type){

            var text = "";

            text += '<br/> <strong>' + user  + '</strong> : <br/> <i> hareket => ' + move + '</i>';
            text += '<br/>depth: ' + depth + '<br/> node: ' + countNode + '<br/>';

            for (var a = 0; a <= 6; a += 3) {

                var a0 = p_game[a];
                var a1 = p_game[a + 1];
                var a2 = p_game[a + 2];


                if(a0 == UNOCCUPIED)
                    a0 = 'B'
                if(a1 == UNOCCUPIED)
                    a1 = 'B'
                if(a2 == UNOCCUPIED)
                    a2 = 'B'
                
                text += '<br/>' + a0 + ' - ' + a1 + ' - ' + a2;
            }

            text += '<br/>';
            
            if (type == 1) {
                hamleGoruntudivText += text;
            }else{
                hamleGoruntudiv2Text += text;
            }
}


function alphaBetaMinimax(node, depth, alpha, beta) {

    if (CheckForWinner(node) === 1 || CheckForWinner(node) === 2 
            || CheckForWinner(node) === 3)
        return GameScore(node, depth);
    
    depth+=1;
    var availableMoves = GetAvailableMoves(node);
    var move, result, possible_game;

    var user = active_turn;
    var currentCountId = countNode;
    
    if (active_turn === "COMPUTER") {
        for (var i = 0; i < availableMoves.length; i++) {
            move = availableMoves[i];

            possible_game = GetNewState(move, node);

            countNode++;
            var id = countNode;

            var newNode = new Dugum(countNode, depth, possible_game.slice(), user, alpha, beta);

            dugumler['n' + countNode] = newNode;

            if(derinlikDugum[depth]){
                derinlikDugum[depth].push(newNode);
            }else{
                derinlikDugum[depth] = new Array();
                derinlikDugum[depth].push(newNode);
            }

            if(hamleGosterVal){
                if(depth <= derinlikVal ){
                    ekranaYazAppend(user, possible_game, move, depth, countNode, 1);      
                }
            }
            
            result = alphaBetaMinimax(possible_game, depth, alpha, beta);
            node = UndoMove(node, move);


            if (result > alpha) {
                alpha = result;

                if(dugumler['n' + id])
                    dugumler['n' + id].dalpha = result;

                if (depth == 1)
                    choice = move;
            } else if (alpha >= beta) {

                if(dugumler['n' + id])
                    dugumler['n' + id].budama = true;
                
                return alpha;
            }
        }

        if(dugumler['n' + currentCountId]){
            dugumler['n' + currentCountId].dalpha = alpha;
            //dugumler['n' + currentCountId].dbeta = beta;
        }

        return alpha;
    } else {
        for (var i = 0; i < availableMoves.length; i++) {
            move = availableMoves[i];

            possible_game = GetNewState(move, node);

            countNode++;
            var id = countNode;
            
            if(hamleGosterVal){
                if(depth <= derinlikVal ){
                    ekranaYazAppend(user, possible_game, move, depth, countNode, 2);
                }
            }

            var newNode2 = new Dugum(countNode, depth, possible_game.slice(), user, alpha, beta);
            dugumler['n' + countNode] = newNode2;

            if(derinlikDugum[depth]){
                derinlikDugum[depth].push(newNode2);
            }else{
                derinlikDugum[depth] = new Array();
                derinlikDugum[depth].push(newNode2);
            }

            result = alphaBetaMinimax(possible_game, depth, alpha, beta);
            node = UndoMove(node, move);
            if (result < beta) {
                beta = result;
                
                if(dugumler['n' + id])
                    dugumler['n' + id].dbeta = result;
                
                if (depth == 1)
                    choice = move;
            } else if (beta <= alpha) {

                if(dugumler['n' + id])
                    dugumler['n' + id].budama = true;
                
                return beta;
            }
        }

        if(dugumler['n' + currentCountId]){
            //dugumler['n' + currentCountId].dalpha = alpha;
            dugumler['n' + currentCountId].dbeta = beta;
        }

        return beta;
    }
}

function UndoMove(game, move) {
    game[move] = UNOCCUPIED;
    ChangeTurn();
    return game;
}

function GetNewState(move, game) {
    var piece = ChangeTurn();
    game[move] = piece;
    return game;
}

function ChangeTurn() {
    var piece;
    if (active_turn === "COMPUTER") {
        piece = 'X';
        active_turn = "HUMAN";
    } else {
        piece = 'O';
        active_turn = "COMPUTER";
    }
    return piece;
}

function GetAvailableMoves(game) {
    var possibleMoves = new Array();
    for (var i = 0; i < BOARD_SIZE; i++)
    {
        if (game[i] === UNOCCUPIED)
            possibleMoves.push(i);
    }
    return possibleMoves;
}

// Check for a winner.  Return
//   0 if no winner or tie yet
//   1 if it's a tie
//   2 if HUMAN_PLAYER won
//   3 if COMPUTER_PLAYER won
function CheckForWinner(game) {
    // Check for horizontal wins
    for (i = 0; i <= 6; i += 3)
    {
        if (game[i] === HUMAN_PLAYER && game[i + 1] === HUMAN_PLAYER && game[i + 2] === HUMAN_PLAYER)
            return 2;
        if (game[i] === COMPUTER_PLAYER && game[i + 1] === COMPUTER_PLAYER && game[i + 2] === COMPUTER_PLAYER)
            return 3;
    }

    // Check for vertical wins
    for (i = 0; i <= 2; i++)
    {
        if (game[i] === HUMAN_PLAYER && game[i + 3] === HUMAN_PLAYER && game[i + 6] === HUMAN_PLAYER)
            return 2;
        if (game[i] === COMPUTER_PLAYER && game[i + 3] === COMPUTER_PLAYER && game[i + 6] === COMPUTER_PLAYER)
            return 3;
    }

    // Check for diagonal wins
    if ((game[0] === HUMAN_PLAYER && game[4] === HUMAN_PLAYER && game[8] === HUMAN_PLAYER) ||
            (game[2] === HUMAN_PLAYER && game[4] === HUMAN_PLAYER && game[6] === HUMAN_PLAYER))
        return 2;

    if ((game[0] === COMPUTER_PLAYER && game[4] === COMPUTER_PLAYER && game[8] === COMPUTER_PLAYER) ||
            (game[2] === COMPUTER_PLAYER && game[4] === COMPUTER_PLAYER && game[6] === COMPUTER_PLAYER))
        return 3;

    // Check for tie
    for (i = 0; i < BOARD_SIZE; i++)
    {
        if (game[i] !== HUMAN_PLAYER && game[i] !== COMPUTER_PLAYER)
            return 0;
    }   
    return 1;
}

function GameOver(game)
{
    if (CheckForWinner(game) === 0)
    {
        return false;
    }
    else if (CheckForWinner(game) === 1)
    {
        var alert = document.getElementById("turnInfo");
        alert.innerHTML = "Beraberlik!";
    }
    else if (CheckForWinner(game) === 2)
    {
        var alert = document.getElementById("turnInfo");
        alert.innerHTML = "Sen kazandın. Tebrikler!";
    }
    else
    {
        var alert = document.getElementById("turnInfo");
        alert.innerHTML = "Bilgisayar Kazandı!";
    }
    ShowAverageTime();
    return true;
}

function ShowTimes(time) {
    searchTimes.push(time);
    document.getElementById("searchTime").innerHTML = time + " saniye. ";
    //document.getElementById("searchTime").innerHTML + time + " seconds. <br />";
}

function DeleteTimes() {
    searchTimes = [];
    document.getElementById("searchTime").innerHTML = "";
}

function ShowAverageTime() {
    if (showAverageTime)
    {
        var sum = 0;
        var i = 0;
        for (i; i < searchTimes.length; i++)
            sum += searchTimes[i];
        
        document.getElementById("searchTime").innerHTML =
                document.getElementById("searchTime").innerHTML + "<br />Ortalama <strong>" + sum / i + "</strong> saniye. <br />";
        showAverageTime = false;
    }
}