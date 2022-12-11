var caseNumber = 0;
var wait = 5;
var wait2 = 1; //chodzenie - default 54
var czekajpvp=308; //ile ma czekać jak spotka gracza na polu 
var waiting1=2000;// czeka przy zmianie lokacji
//-------czy ma schodzic na glebie i glebie rajskiej sali-----
var imperialki=false;
//----------------wybierz nacje---------
var jestembogiem=((GAME.char_data.empire === 2) ? true : false);    // Imperium Bogów
var jestemkrolem=((GAME.char_data.empire === 4) ? true : false);     // Imperium Saiyan
var jestemimperatorem=((GAME.char_data.empire === 1) ? true : false);   //Imperium Armii Czerwonej Wstęgi
var jestemdemonem=((GAME.char_data.empire === 3) ? true : false);      //Imperium Demonów Mrozu
//--------------wypowiadanie wojen------------------
var adimp=false;  //zaznacz true jeśli pełnisz funkcję imperatora lub admirała swojego imperium
var klanowe_lista = GAME.server == 18 ? "lego;Domin;las;sal" : GAME.server == 12 ? "noob;BipBip;seven;PEDO;SOL" : false;
var ile_wojen = klanowe_lista ? klanowe_lista.split(";").length : 0;
//==================================================================================================
var tabelka=[1,2,3,4];
tabelka.splice(GAME.char_data.empire-1,1);
var i=0;
var bot_stop = true;
var gotodemon=false;
var gotorr=false;
var gotogod=false;
var gotosaiyan=false;
var rr=false;
var saiyan=false;
var god=false;
var demon=false;
var shouldbey=0;
var zlaz=false;
var wojny=false;
var wojnabogowie=false;
var wojnademony=false;
var wojnasaiyan=false;
var wojnarr=false;
var licznik2=0;
var shouldbe=0;
var dogory=false;
var tabb;
var w=0;
var arenaindex=0;
var date1=new Date();
var date=new Date();
var bylem1=false;
var bylem2=false;
var bylem3=false;
var bylem4=false;
var done=false;
var przejscie=false;
var glebiadone=false;
var gotoglebia=false;
var czekajka=50;
var loc;
var telep = false;
var x = 0;
var y = 0;
var czekaj=5;
var licznik=0;

GAME.emit = function(order,data,force){
	if(!this.is_loading||force){
		this.load_start();
		this.socket.emit(order,data);
	}
	else if(this.debug) console.log('failed order',order,data);
}
GAME.emitOrder = function(data,force=false){
	this.emit('ga',data,force);
}

GAME.parsePlayerShadow = function(data,pvp_master){
	var entry=data.data;
	var res='';
	if(entry.data){
		var pd=entry.data;
		pd.empire=entry.empire;
		var qb='';
		var erank='';
		var cls='';
		if(data.cd){
			if(parseInt($('#emp_war_cnt').text()) == 3 && parseInt(GAME.char_data.y) == 2 && (data.cd-this.getTime()) > 30){
				//qb+="<b class='red'>skip</b>";
			}else if(parseInt($('#emp_war_cnt').text()) == 2 && parseInt(GAME.char_data.y) == 2 && (data.cd-this.getTime()) > 90){
				//qb+="<b class='red'>skip</b>";
			}else{
				qb+=this.showTimer(data.cd-this.getTime(),'data-special="10" data-pd="'+pd.id+'"',' playercd'+pd.id+'');
			}

			cls='initial_hide_forced playericons'+pd.id;
		}
		if(pd.empire){
			var cls2='';
			if(this.emp_enemies.indexOf(pd.empire)!=-1){
				if(this.emp_enemies_t[pd.empire]==1) cls2='war';
				else if(this.empire_locations.indexOf(this.char_data.loc)!=-1) cls2='war';
			}
			if(!pd.glory_rank) pd.glory_rank=1;
			erank='<img src="/gfx/empire/ranks/'+pd.empire+'/'+pd.glory_rank+'.png" class="glory_rank '+cls2+'" />';
		}
		qb+='<button class="poption map_bicon '+cls+'" data-option="gpvp_attack" data-char_id="'+pd.id+'"><i class="ca"></i></button>';
		if(pvp_master) qb+='<button class="poption map_bicon '+cls+'" data-option="gpvp_attack" data-char_id="'+pd.id+'" data-quick="1"><i class="qa"></i></button>';
		res+='<div class="player"><div class="belka">'+erank+'<strong class="player_rank'+pd.ranga+' poption" data-option="show_player" data-char_id="'+pd.id+'">'+pd.name+' - '+LNG.lab348+'</strong> <span>'+this.rebPref(pd.reborn)+pd.level+'</span> </div><div id="gpvp_opts_'+pd.id+'" class="right_btns">'+qb+'</div></div>';
	}
	else if(entry.more){
		res+='<button class="more_players poption" data-option="load_more_players" data-start_from="'+entry.next_from+'">+'+entry.more+'</div>';
	}
	return res;
}

$('body').append(`<div id="BOT_control" style="min-width:100px; padding:5px; border:solid gray 1px; background:rgba(22, 22, 93, 0.81); color:gold; position: fixed; top: 40px; right: 5px; z-index:5;"><div class="bt_button" style="cursor:pointer;text-align:center; border-bottom:solid gray 1px;">START</div><label style="display:flex;flex-direction:row;align-items:center;margin-top:3px;margin-bottom:-2px;" title="Wypowiadanie wojen imperialnych, zaznacz tylko jeżeli jesteś imperatorem lub admirałem"><input class="pvp_adimp" style="width:17px;height:17px;margin:0px 5px 0px 0px; cursor:pointer;" type="checkbox" />Wypowiadanie Wojen</label></div>`);

$("#BOT_control input[type=checkbox].pvp_adimp").change((chb) => { adimp = $(chb.target).is(':checked'); });

$('#BOT_control .bt_button').click(() => {
	if(bot_stop){
        $('#BOT_control .bt_button').html("STOP");
        $('#BOT_control .bt_button_res').hide();

        bot_stop = false;
        start();
    }else{
        $('#BOT_control .bt_button').html("START");
        $('#BOT_control .bt_button_res').show();

        bot_stop = true;
    }
});

function start(){
	if(!bot_stop){
		if(GAME.char_data.klan_rent == 0 && parseInt($('#clan_war_cnt').text()) < ile_wojen){
			GAME.emitOrder({a:39,type:24,shorts:klanowe_lista});
		}
		kom_clear();
	$("button.more_players.poption").click();
	
	if(!GAME.is_loading){
	if(czy_sa_wojny()){
		action();
	}
	else {window.setTimeout(wypowiedz_wojny,wait);}
	}
	else {window.setTimeout(start,wait);}
	}
}
	function action(){
switch (caseNumber) {
case 0:
caseNumber++;
zkimwojny();
break;
case 1:
caseNumber++;
check_location();
break;
case 2:
caseNumber++;
check_players();
break;
case 3:
caseNumber++;
check_players2();
break;
case 4:
caseNumber++;
kill_players();
break;
case 5:
caseNumber++;
check_position_x();
break;
case 6:
caseNumber++;
check_position_y();	
break;
case 7:
caseNumber++;
zejdz();
break;
case 8:
caseNumber++;
check();
break;
case 9:
caseNumber++;
zmien_lokacje();
break;
case 10:
caseNumber++;
teleport();
break;
case 11:
caseNumber++;
go();
break;
case 12:
caseNumber++;
sprawdz_wojny();
break;
case 13:
caseNumber++;
upewnijsie();
break;
case 14:
caseNumber++;
sprawdz_y();
break;
case 15:
caseNumber++;
czyiscnaglebie();
break;
case 16:
caseNumber++;
przejdz();
break;
case 17:
caseNumber=0;
check_arena();
break;
default:
}}

function check_arena(){
	var cdarenki = Math.ceil(30 - parseInt(GAME.char_bonuses[75].value / 2));
	var date2=new Date();
	var diff = new Date(Math.abs(date2.getTime() - date1.getTime()));
	var minuty=diff.getMinutes();
	if(minuty>cdarenki){
		date1=new Date();
		GAME.emitOrder({a:46,type:0});
		arenaindex=0;
		window.setTimeout(kill_arena,500);
	}
	else{window.setTimeout(start,wait);}
	}
	function kill_arena(){
		if(arenaindex<12){
			if(document.getElementById("arena_players").children[arenaindex].children[1].childElementCount<3){
		GAME.emitOrder({a:46,type:1,index:arenaindex,quick:1});
		arenaindex++;
		window.setTimeout(kill_arena,400);
			}
			else{
				arenaindex++;
				window.setTimeout(kill_arena,200);
			}
		
		} else {window.setTimeout(start,wait);}
	}
function go(){
	//var tabs=[90,110,130];
	//wait2=tabs[Math.floor(Math.random()*tabs.length)];
	const now = new Date();
	var dzientygodnia=now.getDay();
	if(dzientygodnia==6 || dzientygodnia==0){
		//imperialki=true;
	}
	if(x==14 && y==14 && loc===1){
		rr=true;
		if(jestemkrolem){saiyan=true;}else{saiyan=false;}
		if(jestemdemonem){demon=true;}else{demon=false;}
		if(jestembogiem){god=true;}else{god=false;}
		telep=true;
		zlaz=true;
		done=false;
		window.setTimeout(start,wait);
	}
	else if(x==14 && y==14 && loc===2){
		god=true;
		if(jestemkrolem){saiyan=true;}else{saiyan=false;}
		if(jestemdemonem){demon=true;}else{demon=false;}
		if(jestemimperatorem){rr=true;}else{rr=false;}
		telep=true;
		zlaz=true;
		done=false;
		window.setTimeout(start,wait);
	}
	else if(x==14 && y==14 && loc===3){
		demon=true;
		if(jestembogiem){god=true;}else{god=false;}
		if(jestemimperatorem){rr=true;}else{rr=false;}
		if(jestemkrolem){saiyan=true;}else{saiyan=false;}
		telep=true;
		zlaz=true;
		done=false;
		window.setTimeout(start,wait);
	}
	else if(x==14 && y==14 && loc===4){
		saiyan=true;
		if(jestemdemonem){demon=true;}else{demon=false;}
		if(jestemimperatorem){rr=true;}else{rr=false;}
		if(jestembogiem){god=true;}else{god=false;}
		telep=true;
		zlaz=true;
		done=false;
		window.setTimeout(start,wait);
	}
	else if(x==15 && y==15 && loc==6){
		telep=true;
		done=true;
			bylem2=false;
			bylem3=false;
			bylem4=false;
		window.setTimeout(start,wait);
	}
		
	else if (x==8 && y==4 && loc==4 || x==8 && y==6 && loc==4 || x==12 && y==7 && loc==1 || x==12 && y==9 && loc==1 || x==4 && y==8 && loc==1 || x==4 && y==10 && loc==1 || x==7 && y==13 && loc==3 || x==8 && y==5 && loc==2 || x==8 && y==7 && loc==2 || x==3 && y==9 && loc==5 ){
		go_down();
	}
	else if (x==8 && y==5 && loc==4 || x==8 && y==7 && loc==4){
		go_left();
	}
	else if(x==5 && y==11 && loc==1 ||x==5 && y==10 && loc==1 || x==5 && y==9 && loc==1 || x==5 && y==8 && loc==1){
		go_up();
	}
	else if(x==8 && y==6 && loc==2 || x==8 && y==8 && loc==2){
		go_right();
	}
	else if(x==2 && y==11 && loc==3){
		cofanie();
	}
	else if(x==6 && y==7 && loc==6){
	dogory=true;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	 go_right();}
	else if(x==13 && y==7 && loc==6){
		dogory=false;
		go_right();
	}
	else if (x==2 && y==11 && loc==5){
		przejscie=true;
		window.setTimeout(start,1000);
	}
	else if(x==7 && y ==7 && loc==6 && dogory || x==9 && y==7 && loc==6 && dogory){
		prawodol();
		
	}
	else if(x==8 && y==8 && loc==6 && dogory || x==10 && y==8 && loc==6 && dogory){
		prawogora();
	}

 else if (x<14 && y%2==0 && loc<5 ||x<15 && y%2!==0 && loc==6 || x<11 && y%2==0 && loc==5){
	go_right();
}
else if (y%2!==0 && x>2 && loc<6 || x>1 && y%2==0 && loc==6 || x==2&& loc==6){
	go_left();
}
else if (x==14 || x==2 && loc<5 || x==15 && loc==6 || x==1 || x==11 && loc==5 || x==2 && loc==5){
	go_down();
	
}
}



function cofanie(){
	x = $('#map_x').text();
	if(x>=7){
		go_down();
	}
	else{
	GAME.map_move(7);
window.setTimeout(cofanie,250);
}
}
function prawodol(){
	GAME.map_move(3); 
	window.setTimeout(start,wait2);
}

function prawogora(){
	GAME.map_move(5); 
	
	window.setTimeout(start,wait2);
}

function go_up(){
	GAME.map_move(2);
window.setTimeout(start,wait2);
}


function go_down(){
	GAME.map_move(1);
	shouldbey=parseInt(y)+1;
	window.setTimeout(start,wait2);
}

function go_left(){
	GAME.map_move(8);
	window.setTimeout(start,wait2);
}

function go_right(){
GAME.map_move(7);
window.setTimeout(start,wait2);
}
function check_position_x(){
x = $('#map_x').text();
window.setTimeout(start,wait);
}
function check_position_y(){
y = $('#map_y').text();
window.setTimeout(start,wait);
}
function check_players(){
	$("button[data-option='load_more_players']").click();
	if(0<document.getElementById("player_list_con").childElementCount){
		y = $('#map_y').text();
	if(document.getElementById("player_list_con").children[0].children[1].childElementCount==3 && y==2 && loc<6){
		tabb=document.getElementById("player_list_con").children[0].children[1].children[0].textContent.split(":");
		if(document.getElementById("player_list_con").children[0].children[1].children[0].textContent=="--:--:--" || parseInt(tabb[1])>3 && parseInt(tabb[2])>30 ){
			GAME.emitOrder({a:3,vo:GAME.map_options.vo},1);
			window.setTimeout(start,5000);}
			else{
			window.setTimeout(check_players,wait);}
		}else{
			window.setTimeout(start,wait);}
	}else {window.setTimeout(start,wait);}

}
function check_players2(){
	if(0<document.getElementById("player_list_con").childElementCount){
	if(document.getElementById("player_list_con").children[0].children[1].childElementCount==3){
	tabb=document.getElementById("player_list_con").children[0].children[1].children[0].textContent.split(":");
			if(parseInt(tabb[1])==0 && parseInt(tabb[2])<16){
				
				window.setTimeout(start,parseInt(tabb[2])*1000+300);
			}else {window.setTimeout(start,wait);}
	}else {window.setTimeout(start,wait);}
	}
	else {window.setTimeout(start,wait);}
}
function kill_players(){
	$("button[data-option='load_more_players']").click();
	var tabs=[300,320,280,305,290];
	czekajpvp=tabs[Math.floor(Math.random()*tabs.length)]
		if(licznik<document.getElementById("player_list_con").childElementCount){
			if(document.getElementById("player_list_con").children[licznik].children[1].children[0].attributes[1].value==="gpvp_attack" || document.getElementById("player_list_con").children[licznik].children[1].children[1].attributes[1].value==="gpvp_attack")
			{GAME.emitOrder({a:24,type:1,char_id:document.getElementById("player_list_con").children[licznik].children[0].children[1].attributes[2].value,quick:1});
		licznik++;
		czekajka;
		window.setTimeout(kill_players,czekajpvp);
		
		}
		else {GAME.emitOrder({a:24,char_id:document.getElementById("player_list_con").children[licznik].children[0].children[1].attributes[2].value,quick:1});
		licznik++;
		czekajka;
		window.setTimeout(kill_players,czekajpvp);
		
		}
			
	
		
		
		}
	else {window.setTimeout(start,czekaj);
	licznik=0;}
}

function check_location(){
	if($('#map_name').text()==="Siedziba Imperium Saiyan")
	{ 	loc=4;
		//czekajpvp=300;
		bylem4=true;
		window.setTimeout(start,wait);}
         else if($('#map_name').text()==="Siedziba Imperium Demonów"){
			loc=3;
			//czekajpvp=300;
			 bylem3=true;
			window.setTimeout(start,wait);}
		else if ($('#map_name').text()==="Niebo"){
		loc=2;
		//czekajpvp=300;
		bylem2=true;
		window.setTimeout(start,wait);}
		else if($('#map_name').text()==="Siedziba Armii RR"){
		loc=1;
		//czekajpvp=300;
		bylem1=true;
		window.setTimeout(start,wait);}
		else if($('#map_name').text()==="Głębia"){
			loc=5;
			//czekajpvp=300;
			window.setTimeout(start,wait);}
			else if($('#map_name').text()==="Głębia Rajskiej Sali"){
				loc=6;
				//czekajpvp=100;
				window.setTimeout(start,wait);}
				else {
					loc=7;
					//czekajpvp=100;
				window.setTimeout(start,wait);}
}

function zmien_lokacje(){
if(jestembogiem){
	if(telep && saiyan){
		 if(wojnademony){
			gotodemon=true;
			window.setTimeout(start,wait);
		}
		else if(wojnarr){
			gotorr=true;
			window.setTimeout(start,wait);
		}
		
		else if (imperialki){
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		else {gotosaiyan=true;
		window.setTimeout(start,wait);}
	}
	else if (telep && demon){
		if(wojnarr){
			gotorr=true;
			window.setTimeout(start,wait);
		}
		else if (imperialki) {
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		else if(wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else {gotorr=true;
		window.setTimeout(start,wait);
		}
	}
	else if (telep && rr){
		if(imperialki){
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		else if (wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else if (wojnademony){
			gotodemon=true;
		window.setTimeout(start,wait);}
		else {gotorr=true;
		window.setTimeout(start,wait);
		}
	}
	else if(telep && done){
		if(wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else if(wojnademony){
			gotodemon=true;
			window.setTimeout(start,wait);
		}
		else {gotorr=true;
		window.setTimeout(start,wait);
		}
	}

		else  {
	  window.setTimeout(start,wait);}
	
}


 else if(jestemimperatorem){
	if(telep && saiyan){
		if(wojnademony){
					gotodemon=true;
					window.setTimeout(start,wait);
		}
		else if(wojnabogowie){
			gotogod=true;
			window.setTimeout(start,wait);
		}
		else if (imperialki){
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		 else {gotosaiyan=true;
		window.setTimeout(start,wait);
		}
	}
	else if (telep && demon){
		if(wojnabogowie){
			gotogod=true;
			window.setTimeout(start,wait);
		}
		else if(imperialki){
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		else if(wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else {gotodemon=true;
		window.setTimeout(start,wait);
		}
	}
	else if(telep && god){
		if (imperialki){
			gotoglebia=true;
			window.setTimeout(start,wait);
		}
		else if(wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else if (wojnademony){
			gotodemon=true;
			window.setTimeout(start,wait);
		}
		else {gotogod=true;
		window.setTimeout(start,wait);
		}
	}
	else if(imperialki && done){
		if(wojnasaiyan){
			gotosaiyan=true;
			window.setTimeout(start,wait);
		}
		else if (wojnademony){
			gotodemon=true;
			window.setTimeout(start,wait);
		}
		else {gotogod=true;
		window.setTimeout(start,wait);
		}
	}
		
		
	
	
	
	
	else {window.setTimeout(start,wait);}
}
	
		else if(jestemdemonem){
				if(telep && saiyan){
					if(wojnabogowie){
						gotogod=true;
						window.setTimeout(start,wait);
					}
					else if (wojnarr){
						gotorr=true;
						window.setTimeout(start,wait);
					}
					else if(imperialki){
						gotoglebia=true;
						window.setTimeout(start,wait);
					}
					else {gotosaiyan=true;
					window.setTimeout(start,wait);
					}
				}
				else if(telep && god){
					if (wojnarr){
						gotorr=true;
						window.setTimeout(start,wait);
					}
					else if (imperialki){
						gotoglebia=true;
						window.setTimeout(start,wait);
					}
					else if (wojnasaiyan){
						gotosaiyan=true;
						window.setTimeout(start,wait);
					}
					else {gotogod=true;
					window.setTimeout(start,wait);
					}
				}
				else if (telep && rr){
					if (imperialki){
						gotoglebia=true;
						window.setTimeout(start,wait);
					}
					else if(wojnasaiyan){
						gotosaiyan=true;
						window.setTimeout(start,wait);
					}
					else if (wojnabogowie){
						gotogod=true;
						window.setTimeout(start,wait);
					}
					else {gotorr=true;
					window.setTimeout(start,wait);
					}
				}
				else if (telep && done){
					if (wojnasaiyan){
						gotosaiyan=true;
						window.setTimeout(start,wait);
					}
					else if (wojnabogowie){
						gotoglebia=true;
						window.setTimeout(start,wait);
					}
					else {gotorr=true;
					window.setTimeout(start,wait);
					}
				}
		
else {window.setTimeout(start,wait);}
}
 else if (jestemkrolem){
				if (telep && demon){
					if(wojnabogowie){
						gotogod=true;
					window.setTimeout(start,wait);}
						else if(wojnarr){
							gotorr=true;
							window.setTimeout(start,wait);
						} else if(imperialki){
							gotoglebia=true;
							window.setTimeout(start,wait);
						}
						else {gotodemon=true;
						window.setTimeout(start,wait);}
				} else if(telep && god){
					if(wojnarr){
						gotorr=true;
						window.setTimeout(start,wait);
					}
					else if(imperialki){
						gotoglebia=true;
						window.setTimeout(start,wait);
					}
					else if(wojnademony){
						gotodemon=true;
					window.setTimeout(start,wait);}
					else {gotogod=true;
					window.setTimeout(start,wait);}
				} else if(telep && rr){
					 if(imperialki){
						 gotoglebia=true;
						 window.setTimeout(start,wait);
					 }
					 else if(wojnademony){
						 gotodemon=true;
						 window.setTimeout(start,wait);
					 }
					 else if(wojnabogowie){
						 gotogod=true;
						 window.setTimeout(start,wait);
					 }
					 else {gotorr=true;
					 window.setTimeout(start,wait);
					 }
				} else if(telep && done){
					if(wojnademony){
						gotodemon=true;
						window.setTimeout(start,wait);
					}
				else if(wojnabogowie){
					gotogod=true;
					window.setTimeout(start,wait);
				}
				else {gotorr=true;
				window.setTimeout(start,wait);}
				}
						

 else {window.setTimeout(start,wait);}
			
} 
}



function teleport(){
if(telep && gotosaiyan){
	gotosaiyan=false;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	done=false;
	x=2;
	y=2;
	loc=4;
	shouldbe=4;
	telep=false;
	GAME.emitOrder({a:50,type:5,e:4});
	window.setTimeout(kill_players,waiting1);
}
else if(telep && gotodemon){
    telep=false;
	gotosaiyan=false;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	done=false;
	x=2;
	y=2;
	loc=3;
	shouldbe=3;
	gotodemon=false;
	GAME.emitOrder({a:50,type:5,e:3});
		window.setTimeout(kill_players,waiting1);
}
else if(telep && gotogod)
{
    telep=false;
	gotosaiyan=false;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	done=false;
	x=2;
	y=2;
	loc=2;
	shouldbe=2;
	gotogod=false;
	GAME.emitOrder({a:50,type:5,e:2});
	window.setTimeout(kill_players,waiting1);
}
else if(telep && gotorr){
     telep=false;
	 gotosaiyan=false;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	done=false;
	 x=2;
	 y=2;
	 loc=1;
	 shouldbe=1;
	gotorr=false;
	GAME.emitOrder({a:50,type:5,e:1});
	window.setTimeout(kill_players,waiting1);
}
else if (telep && gotoglebia){
	glebiadone=true;
	telep=false;
	gotoglebia=false;
	gotosaiyan=false;
	saiyan=false;
	rr=false;
	god=false;
	demon=false;
	done=false;
	x=2;
	 y=2;
	 loc=5;
	 shouldbe=5;
	 GAME.emitOrder({a:12,type:18,loc:84});
	 window.setTimeout(kill_players,waiting1);}

else{window.setTimeout(start,wait);}
}

function zejdz(){
	if(zlaz){
		zlaz=false;
		if(GAME.emp_enemies.length==1 && !imperialki){
			telep=false;
			if(loc==3){
				window.setTimeout(powrotmrozy);
			}
			else if(loc==4){
				window.setTimeout(powrotsaiyan);
			}
			else if(loc==2){
				window.setTimeout(powrotbogowie);
			}
			else if(loc==1){
				window.setTimeout(powrotrr);
			}
			
		}else {
	GAME.emitOrder({a:16});
	window.setTimeout(start,waiting1);
	}}
	else{window.setTimeout(start,wait);}
}
function powrotmrozy(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(x==2 && y==2){
		window.setTimeout(start,800);
	} else{
		GAME.map_move(6);
		window.setTimeout(powrotmrozy,100);
	}
	
}

function powrotsaiyan(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(x==2 && y==2){
		window.setTimeout(start,800);
	} else{
		GAME.map_move(6);
		window.setTimeout(powrotmrozy,100);
	}
	
}
function powrotbogowie(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(y==2){
		window.setTimeout(powrotbogowie2,wait);
	} else{
		GAME.map_move(2); 
		window.setTimeout(powrotbogowie,100);
	}
	
}
function powrotbogowie2(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(x==2){
		window.setTimeout(start,800);
	}
	else{
		GAME.map_move(8);
		window.setTimeout(powrotbogowie2,wait);
	}
}

function powrotrr(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(y==2){
		window.setTimeout(powrotrr2,wait);
	} else{
		GAME.map_move(2); 
		window.setTimeout(powrotrr,100);
	}
	
}
function powrotrr2(){
	x = parseInt($('#map_x').text());
	y = parseInt($('#map_y').text());
	if(x==2){
		window.setTimeout(start,800);
	}
	else{
		GAME.map_move(8);
		window.setTimeout(powrotrr2,wait);
	}
}
function czy_sa_wojny(){
	if($('#emp_war_cnt').text()>0){
	wojny=true;

	return true;
}
else if(parseInt($('#emp_war_cnt').text())==1 && document.getElementById("ewar_list").children[0].lastChild.textContent==="--:--:--"){
	return false;
}
else {wojny=false;
return false;
}
}


function zkimwojny(){
	
		if(licznik2<document.getElementById("ewar_list").childElementCount && wojny && jestembogiem){
			if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/3.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/3.png"){
				wojnademony=true;
				//console.log("wojna z demonami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/1.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/1.png"){
				 wojnarr=true;
				//console.log("wojna z rr");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/4.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/4.png"){
			
			wojnasaiyan=true;
				//console.log("wojna z saiyanami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}//else{window.setTimeout(start,wait);}
		}
		else if(licznik2<document.getElementById("ewar_list").childElementCount && wojny && jestemimperatorem){
			if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/3.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/3.png"){
				wojnademony=true;
				//console.log("wojna z demonami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/2.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/2.png"){
				 wojnabogowie=true;
				//console.log("wojna z rr");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/4.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/4.png"){
			
			wojnasaiyan=true;
				//console.log("wojna z saiyanami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}//else{window.setTimeout(start,wait);}
		}
		else	if(licznik2<document.getElementById("ewar_list").childElementCount && wojny && jestemdemonem){
			if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/1.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/1.png"){
				wojnarr=true;
				//console.log("wojna z rr");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/2.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/2.png"){
				 wojnabogowie=true;
				//console.log("wojna z bogami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/4.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/4.png"){
			
			wojnasaiyan=true;
				//console.log("wojna z saiyanami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}//else{window.setTimeout(start,wait);}
		}
			else if(licznik2<document.getElementById("ewar_list").childElementCount && wojny && jestemkrolem){
			if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/3.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/3.png"){
				wojnademony=true;
				//console.log("wojna z demonami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/2.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/2.png"){
				 wojnabogowie=true;
				//console.log("wojna z bogami");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}
			else if(document.getElementById("ewar_list").children[licznik2].children[1].attributes[0].value=="/gfx/empire/1.png" || document.getElementById("ewar_list").children[licznik2].children[4].attributes[0].value  =="/gfx/empire/1.png"){
			
			wojnarr=true;
				//console.log("wojna z rr");
				licznik2++;
				window.setTimeout(zkimwojny,wait);
			}//else{window.setTimeout(start,wait);}
		}
		else{window.setTimeout(start,wait);}		
		
		
		
		
	}	
	
	function upewnijsie(){
		licznik2=0;
	wojnabogowie=false;
	wojnademony=false;
	wojnasaiyan=false;
	wojnarr=false;
		
		
		if(loc==7){
			if (shouldbe<5){
			GAME.emitOrder({a:50,type:5,e:shouldbe});
			window.setTimeout(start,waiting1);
			} else {
				GAME.emitOrder({a:12,type:18,loc:84});
			window.setTimeout(start,waiting1);}
			
		} else{window.setTimeout(start,wait);}
			
	}
	function sprawdz_y(){
		y = $('#map_y').text();
		x = $('#map_x').text();
		//if(loc==6){wait2=30;}else{wait2=45;}
		if(y==shouldbey || y==2 || y==11 && loc==1 || y==10 && loc==1 || y==9 && loc==1 || y==8 && loc==1 || y==7 && loc==1 ||x==7 && y ==7 && loc==6 || x==9 && x==7 && loc==6 || x==8 && y==8 && loc==6 || x==10 && y==8 && loc==6 || loc==6 || x!==2 || x!==14){
			window.setTimeout(start,wait);
		}
		else {
			GAME.map_move(2);
window.setTimeout(start,wait2);
}
	}
	function przejdz(){
		if(przejscie){
			przejscie=false;
			x=1;
			y=1;
			loc=6;
			czekajka;
			shouldbey=1;
			GAME.emitOrder({a:6,tpid:0});
			
			window.setTimeout(start,waiting1);
		}
		else {window.setTimeout(start,wait);
		}
	}
	function czyiscnaglebie(){
		if (imperialki && jestemimperatorem  && bylem2 || !wojnabogowie && bylem3 || !wojnademony && bylem4 || !wojnasaiyan){
			window.setTimeout(start,wait);
		}  else if(imperialki && jestembogiem && bylem1 || !wojnarr && bylem3 || !wojnademony && bylem4 || !wojnasaiyan){
			window.setTimeout(start,wait);
		}
		else if(imperialki && jestemdemonem && bylem1 || !wojnarr && bylem2 || !wojnabogowie && bylem4 || !wojnasaiyan){
			window.setTimeout(start,wait);
			
		} else if (imperialki && jestemkrolem && bylem1 ||!wojnarr && bylem2 || !wojnabogowie && bylem3 || !wojnademony){
			window.setTimeout(start,wait);
		}
		else {window.setTimeout(start,wait);
		}
	}
	
function wypowiedz_wojny(){
if(adimp){
	var c=60500;
	if(i==2){
		c=2000;
	}
      if(i<3){
       		  GAME.emitOrder({a:50,type:7,target:tabelka[i]});
	          i++;
			  window.setTimeout(wypowiedz_wojny,c);
	  } else {i=0;
	  GAME.emitOrder({a:50,type:5,e:tabelka[0]});
	 window.setTimeout(start,2000);}
}else 
{
	 window.setTimeout(start,wait);
	  }
	
}
	function sprawdz_wojny(){
		if(adimp && wojny && parseInt($('#emp_war_cnt').text())<3){
			if(!wojnabogowie && !jestembogiem){
				GAME.emitOrder({a:50,type:7,target:2});
			}
			else if(!wojnarr && !jestemimperatorem){
				GAME.emitOrder({a:50,type:7,target:1});
			}
			else if (!wojnademony && !jestemdemonem){
				GAME.emitOrder({a:50,type:7,target:3});
			}
			else if(!wojnasaiyan && !jestemkrolem){
				GAME.emitOrder({a:50,type:7,target:4});
			}
			 window.setTimeout(start,wait);
		} else {
	window.setTimeout(start,wait);
		}
	}
	
	function check(){
		var z =parseInt($('#emp_war_cnt').text());
		
		var table=GAME.emp_enemies;
		if(w<z){
			if(document.getElementById("ewar_list").children[w].lastChild.textContent==="--:--:--"){
				if (table[w]==1){
					wojnarr=false;
					if(loc==1){
						rr=true;
						telep=true;
						GAME.emitOrder({a:16});
					}
					window.setTimeout(start,wait);
				} 
				else if (table[w]==2){
					wojnabogowie=false;
					if(loc==2){
						god=true;
						telep=true;
						GAME.emitOrder({a:16});
					}
					window.setTimeout(start,wait);
				} 
				else if(table[w]==3){
					wojnademony=false;
					if(loc==3){
						demon=true;
						telep=true;
						GAME.emitOrder({a:16});
					}
					
					window.setTimeout(start,wait);
				} 
				else if (table[w]==4){
					wojnasaiyan=false;
					if(loc==4){
						saiyan=true;
						telep=true;
						GAME.emitOrder({a:16});
					}
					
					window.setTimeout(start,wait);
				}
			} 
			else {
					w++;
				window.setTimeout(check,wait);
			}
		}
	else {    w=0;
		window.setTimeout(start,wait);}
	
	
	}

	console.clear();
	console.log('%cSkrypt został poprawnie załadowany!','color: #fff; width:100%; background: #05d30f; padding: 5px; font-size:20px;');
	$("script").last().remove();
