var game = new Phaser.Game(600, 600, Phaser.CANVAS, 'node-keeper', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('guy', 'assets/guy.png');
    game.load.spritesheet('button', 'assets/button.png', 32, 32);
}

var maxButtons = 8;
var nodes = [ 'acl', 'core', 'embed', 'feeds', 'recommends', 'search', 'stash', 'auth' ];
var nodeFailDelayMin = 500;
var nodeFailDelayMax = 2500;
var nodeFailDelta = 100;
var nodeFailDelay;

var buttonsFontStyle = { font: "20px monospace", fill: "#333", align: "center" };
var gameOverFontStyle = { font: "26px monospace", fill: "#ddd", align: "center" };

var guySpeed = 200;

var isGameOver = false;

var guy;
var buttons;
var score; 
var scoreText;

function createButton( x, y, nodeName ){
    var btn = game.add.sprite(x, y, 'button');        
    btn.frame = 2;
    btn.name = 'button';
    game.physics.enable( btn, Phaser.Physics.ARCADE );
    btn.body.immovable = true;
    btn.isBtnEnabled = true;
    btn.text = game.add.text( x, y - 25, nodeName, buttonsFontStyle);
    btn.text.anchor.set(0.5);
    
    btn.turnOff = function(){
        if( !btn.triggered ){
            btn.frame = 1;
            game.time.events.add(
                Phaser.Timer.SECOND * 0.2, 
                function(){ 
                    btn.frame = 0;
                    btn.isBtnEnabled = false; 
                    btn.triggered = false;
                },
            this);            
            btn.triggered = true;
        }
    }
    btn.turnOn = function(){
        if( !btn.triggered ){
            btn.frame = 1;
            game.time.events.add(
                Phaser.Timer.SECOND * 0.2, 
                function(){ 
                    btn.frame = 2;
                    btn.isBtnEnabled = true; 
                    btn.triggered = false;
                    score++;
                    scoreText.text = 'Score: ' + score;
                },
                
            this);            
            btn.triggered = true;
        }
    }
    btn.anchor.setTo(0.5, 0.5);
    return btn;
}

function createGuy( x, y ){
    var guy = game.add.sprite(x, y, 'guy');
    game.physics.enable( guy, Phaser.Physics.ARCADE);    
    guy.speed = guySpeed;
    guy.anchor.setTo(0.5, 0.5);
    return guy;
}

function doNodeFail(){  
    console.log(nodeFailDelay);
    var turnedOn = buttons.filter( function( b ){ return b.isBtnEnabled; } );
    
    if( turnedOn.length <= buttons.length / 2 ){
        gameOver();
        return;
    }
    if( turnedOn.length > 0 )
        turnedOn[ game.rnd.integerInRange( 0, turnedOn.length - 1 ) ].turnOff();
    
    
    if( nodeFailDelay > nodeFailDelayMin ) nodeFailDelay -= nodeFailDelta;
    
    game.time.events.add( nodeFailDelay, doNodeFail, this );
}

function destoryButton( btn ){
    btn.text.destroy();
    btn.destroy();
}
function gameOver(){
    game.stage.backgroundColor = '#000';
    game.time.events.add(
        Phaser.Timer.SECOND * 3, 
        function(){ 
            isGameOver = false;
            game.state.start(game.state.current);
        },    
    this);
    isGameOver = true;
    
    guy.destroy();
    buttons.forEach( destoryButton );
    scoreText.destroy();
    
    var text = game.add.text( game.width / 2, game.height / 2, 'GAME OVER\n Your score: ' + score, gameOverFontStyle);
    text.anchor.set(0.5);
}

function createButtons(){
    var rad = game.width / 2 - 100;
    
    nodes.forEach( function( n, i ){
        var arc = 2 * Math.PI / maxButtons * i;
        buttons.push( 
            createButton( 
                Math.cos( arc ) * rad + game.width / 2 , 
                Math.sin( arc ) * rad + game.height / 2, 
                n
            ) 
        );        
    })   
}
function create() {
    score = 0;    
    buttons = [];
    nodeFailDelay = nodeFailDelayMax;
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#ccc';
    
    guy = createGuy( game.width / 2, game.height / 2);
    createButtons();
    
    game.time.events.add( nodeFailDelayMax, doNodeFail, this );    
    
    scoreText = game.add.text( game.width / 2, 12, 'Score:' + score, buttonsFontStyle);
    scoreText.anchor.set(0.5);
    
}

function update() {
    if( !isGameOver ){
        buttons.forEach( function( b ){
            game.physics.arcade.collide(guy, b, collisionHandler, null, this);        
        })

        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            guy.body.velocity.x = -guy.speed;
            guy.scale.setTo( -1, 1 );
        }else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            guy.body.velocity.x = guy.speed;
            guy.scale.setTo( 1, 1 );
        }else{
            guy.body.velocity.x = 0;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            guy.body.velocity.y = -guy.speed;
        }else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            guy.body.velocity.y = guy.speed;
        }else{
            guy.body.velocity.y = 0;
        }        
    }
}

function collisionHandler (obj1, obj2) {
    var btn;
    if( obj1.name === 'button' ) btn = obj1;
    if( obj2.name === 'button' ) btn = obj2;

    if( !btn.isBtnEnabled ) { 
        btn.turnOn();
    }
    
    return false;
}


