(function(){ let a; function f(){ if(!a) a=Object.keys(GAME).find(z=> GAME[z] && GAME[z]['1_1']); return a; }
    Object.defineProperty(GAME,'mapcell',{get: function(){ return GAME[f()]; }});
})();

GAME.emitOrder = (data) => GAME.socket.emit('ga',data);

$('body').append('<div id="BOT_control" style="display:none;min-width:100px; padding:5px; border:solid gray 1px; background:rgba(22, 22, 93, 0.81); color:gold; position: fixed; top: 40px; right: 5px; z-index:5; text-align:center;"><div class="bt_button" style="cursor:pointer;text-align:center; border-bottom:solid gray 1px;">START</div><div id="select_born" class="pointer red" born="2">G</div><div id="select_born" class="pointer" born="3">U</div><div id="select_born" class="pointer" born="4">S</div><div id="select_born" class="pointer" born="5">H</div></div>');

$('#BOT_control .bt_button').click(() => {
	if(BOT.Stop){
        $('#BOT_control .bt_button').html("STOP");
		BOT.Stop = false;
		BOT.Start();
	}else{
		$('#BOT_control .bt_button').html("START");
		BOT.Stop = true;
	}
});

$( "body" ).on( "click", "#select_born", function(){
    if(BOT.Stop){
        $("[id=select_born]").removeClass("red");
        $(this).addClass("red");
        BOT.Born = parseInt($(this).attr("born"));
    }else{
        GAME.komunikat("<h1>Musisz najpierw zatrzymać skrypt!<h1>");
    }
});

BOT.Start = function(){
    BOT.LoadPVM();
};

BOT.CreateMatrix = function(){
    BOT.Matrix = [];
    BOT.Map = GAME.mapcell;
    
    for(var i=0; i<parseInt(GAME.map.max_y); i++){
        BOT.Matrix[i] = [];
        for(var j=0; j<parseInt(GAME.map.max_x); j++){
            if(BOT.Map[parseInt(j+1)+'_'+parseInt(i+1)].m==1){
                BOT.Matrix[i][j] = 1;
            }else{
                BOT.Matrix[i][j]=0
            }
        }
    }
}

BOT.LoadPVM = function(){
    GAME.emitOrder({a:32,type:0});
}

BOT.KillWanted = function(){
    console.log("out emit kill");
    console.log(document.getElementById("special_list_con").childElementCount);
    if(document.getElementById("special_list_con").childElementCount){
        console.log("emit kill");
        BOT.Killed = true;
        GAME.emitOrder({a:32,type:1,wanted_id:BOT.Born,quick:1});
    }
}

BOT.Collect = function(){
    GAME.emitOrder({a:32,type:2,wanted:BOT.Born});
}

BOT.Teleport = function(){
    loc=parseInt(document.getElementsByClassName("green option")[BOT.Born+1].getAttributeNode("data-loc").value);
    
    if(GAME.char_data != loc){
        GAME.emitOrder({a:12,type:18,loc:loc});
		setTimeout(3000);
    }else{
        BOT.Go();
    }
}

BOT.Go = function(){
	BOT.CreateMatrix();
	BOT.Finder.setGrid(BOT.Matrix);
    
    PathID = BOT.Finder.findPath(GAME.char_data.x-1, GAME.char_data.y-1, parseInt(GAME.map_wanteds.x)-1, parseInt(GAME.map_wanteds.y)-1, function(path){
        
        if(path === null){
            console.log("Path was not found");
        }else{
            if(path[0].x == GAME.char_data.x-1 && path[0].y == GAME.char_data.y-1){
                path.shift();
            }
            
            BOT.Path = path;
            BOT.Move();
        }
    });
    
    BOT.Finder.calculate();
}

BOT.Move = function(){
    if(!BOT.stop){
        if(BOT.Path[0].x > GAME.char_data.x-1 && BOT.Path[0].y == GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:7,vo:GAME.map_options.vo}); // prawo
        }else if(BOT.Path[0].x < GAME.char_data.x-1 && BOT.Path[0].y == GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:8,vo:GAME.map_options.vo}); // lewo
        }else if(BOT.Path[0].x == GAME.char_data.x-1 && BOT.Path[0].y > GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:1,vo:GAME.map_options.vo}); // dół
        }else if(BOT.Path[0].x == GAME.char_data.x-1 && BOT.Path[0].y < GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:2,vo:GAME.map_options.vo}); // góra
        }else if(BOT.Path[0].x > GAME.char_data.x-1 && BOT.Path[0].y > GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:3,vo:GAME.map_options.vo}); // dół - prawo
        }else if(BOT.Path[0].x < GAME.char_data.x-1 && BOT.Path[0].y < GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:6,vo:GAME.map_options.vo}); // góra - lewo
        }else if(BOT.Path[0].x > GAME.char_data.x-1 && BOT.Path[0].y < GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:5,vo:GAME.map_options.vo}); // góra - prawo
        }else if(BOT.Path[0].x < GAME.char_data.x-1 && BOT.Path[0].y > GAME.char_data.y-1){
            GAME.emitOrder({a:4,dir:4,vo:GAME.map_options.vo}); // dół - lewo
        }else{
            BOT.Go();
        }
    }
}

BOT.Next = function(){
    if(BOT.Path.length-1 > 0){
        BOT.Path.shift();
        BOT.Move();
    }else{
        setTimeout(function(){ BOT.KillWanted(); }, 500);
    }
}

BOT.HandleSockets = function(res){
    if(!BOT.Stop && res.a === 4 && res.char_id === GAME.char_id){
        // Move response
        BOT.Next();
    }else if(!BOT.Stop && res.a === 32 && res.e == 0){
        // load pvm response
        if($('button[data-wanted="'+BOT.Born+'"]').html()){
            GAME.emitOrder({a:32,type:2,wanted:BOT.Born});
        }else{
            BOT.Teleport();
        }
    }else if(!BOT.Stop && BOT.Killed && res.a === 602 && !res.res.wanted){
        BOT.Killed = false;
        // kill wanted response
        BOT.Collect();
    }else if(!BOT.Stop && res.a === 32 && res.e == 2){
        // collect prize response
        BOT.Teleport();
    }else if(!BOT.Stop && res.a === 12){
        // teleport response
        
        if(GAME.char_data.x == GAME.map_wanteds.x && GAME.char_data.y == GAME.map_wanteds.y){
            setTimeout(function(){ BOT.KillWanted(); }, 500);
        }else{
            setTimeout(function(){ BOT.Go(); },1000);
        }
    }

	// on empty response (e.g. when player can't move)
	else if (!BOT.stop && res.a === undefined){ setTimeout(() => { BOT.Go(); }, 500); }
}

GAME.socket.on('gr', function(msg){
    BOT.HandleSockets(msg);
});

BOT.LoadES = function(){
    esjs = document.createElement('script');
    esjs.src = 'https://cdn.jsdelivr.net/npm/easystarjs@0.4.3/bin/easystar-0.4.3.min.js';
    esjs.onload = () => {
        BOT.Finder = new EasyStar.js();
        BOT.Finder.enableDiagonals();
        BOT.Finder.setAcceptableTiles([1]);

        $("#BOT_control").show();
    }
    document.head.append(esjs);
}();

console.clear();
	console.log('%cSkrypt został poprawnie załadowany!','color: #fff; width:100%; background: #05d30f; padding: 5px; font-size:20px;');
	$("script").last().remove();