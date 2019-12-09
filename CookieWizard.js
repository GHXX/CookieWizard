function isCMLoaded()
{
	return typeof CM !== 'undefined';
}

if(!isCMLoaded())
{
	Game.LoadMod('https://aktanusa.github.io/CookieMonster/CookieMonster.js');
}

// autoclick golden cookies
var autoGoldenCookie = setInterval(function() { 
	for (var h in Game.shimmers)
	{
	  if(Game.shimmers[h].type == "golden" && Game.shimmers[h].wrath == 0)
	  {
		Game.shimmers[h].pop();
	  }
	} 
  }, 500);
  
  

// autobuy script
var autobuyInterval = 1000;

function Autobuy(depth) {	
	var blacklist = [69];

	function filterAvailUpgr(upgrades) {
		var upgradeIDs = [];
		for (key in upgrades) {
			for (var i = 0; i < Game.UpgradesInStore.length; i++) {
				var u = Game.UpgradesInStore[i];
				var blacklisted = u.pool === "toggle";
				for (var k = 0; k < blacklist.length; k++) {
					if (blacklist[k] == u.id) {
						blacklisted = true;
					}
				}
				if (u.name == key && !blacklisted && upgrades[key].pp !== Infinity && (u.basePrice - Game.cookies) / Game.cookiesPs < 600) {
					upgradeIDs.push({
						"id": u.id,
						"pp": upgrades[key].pp
					});
				}
			}
		}
		return upgradeIDs;
	}

	function getBestBuilding() {
		var bb = [];
		for (key in CM.Cache.Objects) {
			if (bb.length == 0 || bb[1].pp > CM.Cache.Objects[key].pp) {
				var obj = CM.Cache.Objects[key];
				bb = [key, obj];
			}
		}
		return bb;
	}
		
	function QueueBuy() {
		var requeueInterval = 50;
		if(depth < (autobuyInterval*0.9)/requeueInterval)
			setTimeout(function(){ Autobuy(depth+1);}, requeueInterval);
	}
		
	upgradesforbuy = filterAvailUpgr(CM.Cache.Upgrades).sort(function(a, b) {
		if (a.pp > b.pp) {
			return 1;
		}
		if (a.pp < b.pp) {
			return -1;
		}
		return 0;
	});
	var bbppfull = getBestBuilding();
	var bbpp = bbppfull[1].pp;
	if (upgradesforbuy.length == 0 || bbpp < upgradesforbuy[0].pp) {
		for (var i = 0; i < Game.ObjectsById.length; i++) {
			if (bbppfull[0] == Game.ObjectsById[i].name) {
				if (Game.ObjectsById[i].price < Game.cookies) {
					console.log("[Autobuy] Buying 1 " + Game.ObjectsById[i].single);
					Game.ObjectsById[i].buy();
					QueueBuy(); // try buying another thing
					break;
				}
			}
		}
	} else {
		var u = Game.UpgradesById[upgradesforbuy[0].id];
		if (u.basePrice < Game.cookies) {
			console.log("[Autobuy] Buying " + u.name);
			u.buy();
			QueueBuy(); // try buying another thing
		}
	}	
}



var autoBuy = setInterval(function(){ Autobuy(0);}, autobuyInterval);
