$('body').append('<div id="BOT_control" style="display:none; min-width:100px; padding:5px; border:solid gray 1px; background:rgba(22, 22, 93, 0.81); color:gold; position: fixed; top: 40px; right: 5px; z-index:5;"><div class="bt_button" style="cursor:pointer;text-align:center; border-bottom:solid gray 1px;">START</div><div class="bt_refresh" style="cursor:pointer;text-align:center; border-bottom:solid gray 1px;">ODŚWIEŻ</div><div class="bt_cool" style="text-align:center;"></div></div>');

$('body').append('<div id="BOT_mines" style="display:none; min-width:100px; padding:5px; border:solid gray 1px; background:rgba(22, 22, 93, 0.81); color:gold; position: fixed; top: 120px; right: 5px; z-index:5;"></div>');

$('#BOT_control .bt_button').click(() => {
	if(BOT.stop){
        $('#BOT_control .bt_button').html("STOP");
        $('#BOT_control .bt_button_res').hide();

        BOT.stop = false;
        BOT.Start();
    }else{
        $('#BOT_control .bt_button').html("START");
        $('#BOT_control .bt_button_res').show();
        $(".bt_cool").html("");

        BOT.stop = true;
        clearTimeout(BOT.cdt);
    }
});

$('#BOT_control .bt_refresh').click(() => {
    if(BOT.stop){
        BOT.listMines();
        BOT.getMinesPos();
    }else{
        GAME.komunikat("Zatrzymaj najpierw skrypt!");
    }
});

$("body").on( "click", "#BOT_mines .select_mine", function(){
    if(BOT.stop){
        BOT.refresh_mines = true;
        BOT.mined_id = []; 
        $('#BOT_mines .select_mine:checked').each(function() {
            id = parseInt($(this).val());
            BOT.mined_id.push(id);
        });
    }else{
        $(this).click();
        GAME.komunikat("Zatrzymaj najpierw skrypt!");
    }
});

BOT.emitOrder = function(data){
    if(!this.processing){
        this.processing = true;
        GAME.socket.emit('ga',data);
	}
}

GAME.questAction = function(){
    if(this.quest_action){
        BOT.emitOrder({a:22,type:7,id:GAME.quest_action_qid,cnt:GAME.quest_action_max});
    }
}

BOT.Start = function(){
    if(this.last_loc != GAME.char_data.loc){
        Object.defineProperty(GAME,'mapcell',{
            get: function(){ return GAME[BOT.FindMapcell()]; },
            enumerable: true,
            configurable: true
        });

        this.CreateMatrix();

        this.last_loc = GAME.char_data.loc;
    }

    if(this.refresh_mines){
        this.getMinesPos();
        this.refresh_mines = false;
    }

    this.steps_clone = this.steps.slice();

    if(this.steps_clone[0][0] == GAME.char_data.x && this.steps_clone[0][1] == GAME.char_data.y){
        this.steps_clone.shift();
    }

    this.finder.setGrid(this.matrix);

    setTimeout(function(){ BOT.Action(); } ,100);
}

BOT.Action = function(){
    this.stop=false;
    if(!this.processing){
        this.Go();
    }else{
        setTimeout(function(){ BOT.Action(); } ,1000);
    }
}

BOT.GetCooldown = function(){
    if(GAME.map_mines.coords[parseInt(GAME.char_data.x)+"_"+parseInt(GAME.char_data.y)][0][2] > 0){
        cd = GAME.map_mines.coords[parseInt(GAME.char_data.x)+"_"+parseInt(GAME.char_data.y)][0][2] - GAME.getTime();
        cd += 5;
        r = cd*1000;

        $(".bt_cool").html(GAME.showTimer(r/1000));
    }else{
        r = 1000;
    }

    return r;
}

BOT.getMinesPos = function(){
    coords = Object.entries(GAME.map_mines.coords);
    var mines = [];
    for(i=0; i<coords.length; i++){
        if(this.mined_id.includes(coords[i][1][0][1])){
            mines.push(coords[i]);
        }
    }
    this.prepareMines(mines);
}

BOT.prepareMines = function(mines){
    this.steps = [];
    for(i=0; i<mines.length; i++){
        pos = mines[i][0].split("_");
        if(i == 0){
            first_mine = [parseInt(pos[0]),parseInt(pos[1])];
        }
        
        this.steps.push([parseInt(pos[0]),parseInt(pos[1])]);

        this.mines[pos[0]+"_"+pos[1]] = mines[i][1][0][0];

        if(i == 0){
            this.last_mine = pos[0]+"_"+pos[1];
        }
    }

    this.steps.push(first_mine);
}

BOT.listMines = function(){
    html="";
    mdt = Object.entries(GAME.map_mines.mine_data);
    for(i=0; i<mdt.length; i++){
        if(i == 0){
            BOT.mined_id.push(mdt[i][1].id);
            html += "<div style='margin-bottom:5px; border-bottom:solid gray 1px; padding:3px;'><input class='select_mine' type='checkbox' checked='true' value='"+mdt[i][1].id+"' "+((mdt.length==1)?"disabled":'')+"> "+mdt[i][1].name+"</div>";
        }else{
            html += "<div style='margin-bottom:5px; border-bottom:solid gray 1px; padding:3px;'><input class='select_mine' type='checkbox' value='"+mdt[i][1].id+"'> "+mdt[i][1].name+"</div>";
        }
        
    }

    $("#BOT_mines").html(html);
};

BOT.FindMapcell = function(){
    this.mapcell = Object.keys(GAME).find(z=> GAME[z] && GAME[z]['1_1']);
    return this.mapcell;
}

BOT.CreateMatrix = function(){  
    for(var i=0; i<parseInt(GAME.map.max_y); i++){
        this.matrix[i] = [];
        for(var j=0; j<parseInt(GAME.map.max_x); j++){
            if(GAME.mapcell[parseInt(j+1)+'_'+parseInt(i+1)].m==1){
                this.matrix[i][j]=1;
            }else{
                this.matrix[i][j]=0
            }
        }
    }
}

BOT.Mine = function(){
    this.emitOrder({a:22,type:8,mid:BOT.mines[parseInt(GAME.char_data.x)+"_"+parseInt(GAME.char_data.y)]});
}

BOT.Go = function(){
    if(this.steps_clone.length > 0){
        this.finder.findPath(GAME.char_data.x-1, GAME.char_data.y-1, this.steps_clone[0][0]-1, this.steps_clone[0][1]-1, function(path){
            if(path === null){
                console.log("path not found");
            }else{
                BOT.path = path;
                if(BOT.steps_clone.length > 0){
                    BOT.path.shift();
                    cur = [GAME.char_data.x, GAME.char_data.y];
                    setTimeout(()=> {
                        if(!BOT.stop && BOT.mines[parseInt(GAME.char_data.x)+"_"+parseInt(GAME.char_data.y)] && $("button[data-mid='"+BOT.mines[parseInt(GAME.char_data.x)+"_"+parseInt(GAME.char_data.y)]+"']").length == 1 && BOT.steps.some(r => r.length == cur.length && r.every((value, index) => cur[index] == value))){
                            setTimeout(function(){ BOT.Mine(); }, BOT.speed);
                        }else if(!BOT.stop){
                            setTimeout(function(){ BOT.Move(); }, BOT.speed);
                        }
                    }, 1000);
                }
            }
        });
        
        this.finder.calculate();
    }else if(!this.stop && (GAME.char_data.x+"_"+GAME.char_data.y) == this.last_mine){
        console.log("last one");
        setTimeout(function(){ BOT.Mine(); }, 1000);
        this.cdt = setTimeout(function(){
            GAME.loadMapJson(function(){ BOT.emitOrder({a:3,vo:GAME.map_options.vo},1); });
            setTimeout(function(){ BOT.Start(); }, 2000);
            $(".bt_cool").html("");
        }, this.GetCooldown());
    }
}

BOT.Move = function(){
    if(!this.stop){
        if(this.path[0].x > GAME.char_data.x-1 && this.path[0].y == GAME.char_data.y-1){
            this.emitOrder({a:4,dir:7,vo:GAME.map_options.vo}); // prawo
        }else if(this.path[0].x < GAME.char_data.x-1 && this.path[0].y == GAME.char_data.y-1){
            this.emitOrder({a:4,dir:8,vo:GAME.map_options.vo}); // lewo
        }else if(this.path[0].x == GAME.char_data.x-1 && this.path[0].y > GAME.char_data.y-1){
            this.emitOrder({a:4,dir:1,vo:GAME.map_options.vo}); // dół
        }else if(this.path[0].x == GAME.char_data.x-1 && this.path[0].y < GAME.char_data.y-1){
            this.emitOrder({a:4,dir:2,vo:GAME.map_options.vo}); // góra
        }else if(this.path[0].x > GAME.char_data.x-1 && this.path[0].y > GAME.char_data.y-1){
            this.emitOrder({a:4,dir:3,vo:GAME.map_options.vo}); // dół - prawo
        }else if(this.path[0].x < GAME.char_data.x-1 && this.path[0].y < GAME.char_data.y-1){
            this.emitOrder({a:4,dir:6,vo:GAME.map_options.vo}); // góra - lewo
        }else if(this.path[0].x > GAME.char_data.x-1 && this.path[0].y < GAME.char_data.y-1){
            this.emitOrder({a:4,dir:5,vo:GAME.map_options.vo}); // góra - prawo
        }else if(this.path[0].x < GAME.char_data.x-1 && this.path[0].y > GAME.char_data.y-1){
            this.emitOrder({a:4,dir:4,vo:GAME.map_options.vo}); // dół - lewo
        }else{
            this.Go();
        }
    }
}

BOT.Next = function(){
    if(this.path.length-1 > 0){
        this.path.shift();
        setTimeout(function(){ BOT.Move(); }, this.speed);
    }else{
        if(this.steps_clone.length > 0){
            this.steps_clone.shift();
            this.Go();
        }
    }
}

// ===================================
// RESPONSE HANDLING
BOT.HandleResponse = function(res){
    this.processing = false;
    if(!this.stop && res.a === 4 && res.char_id === GAME.char_id){
        BOT.Next();
	}else if(!this.stop && res.done && res.a === 22){
        $("button[data-option='start_mine']").remove();
        BOT.Go();
    }
}

GAME.socket.on('gr', function(res){
    BOT.HandleResponse(res);
});

BOT.LoadES = function(){
    esjs = document.createElement('script');
    esjs.src = 'https://cdn.jsdelivr.net/npm/easystarjs@0.4.3/bin/easystar-0.4.3.min.js';
    esjs.onload = () => {
        BOT.finder = new EasyStar.js();
        BOT.finder.enableDiagonals();
        BOT.finder.setAcceptableTiles([1]);

        BOT.listMines();
        $("#BOT_control").show();
        $("#BOT_mines").show();
    }
    document.head.append(esjs);
}();

console.clear();
	console.log('%cSkrypt został poprawnie załadowany!','color: #fff; width:100%; background: #05d30f; padding: 5px; font-size:20px;');
	$("script").last().remove();