if(typeof CookieWizard === 'undefined')
{
	CookieWizard = "Cookie Wizard is loaded!";
  
	if(typeof CM === 'undefined')
	{
	  Game.LoadMod('https://aktanusa.github.io/CookieMonster/CookieMonster.js');
	}

	// autoclick golden cookies
	var autoShimmers = setInterval(function() { 
		for (var h in Game.shimmers)
		{
		  if(Game.shimmers[h].type == "golden" && Game.shimmers[h].wrath == 0 || Game.shimmers[h].type == "reindeer")
		  {
			Game.shimmers[h].pop();
		  }
		} 
	  }, 500);
	  
	  

	// autobuy script
	var autobuyInterval = 1000;	
	console.log("Autobuy enabled.");

	function Autobuy(depth) {
		var blacklist = [69, 562, 327];
		var whitelist = [52, 53, 86, // the three upgrades that improve golden cookies are prioritized
		152, //  festive hat 
		157,158,159,160,161,163,164, // santa upgrades		
		223, // faberge egg
		324 // crumbly egg (cookie dragon)
		];

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
					var whitelisted = whitelist.includes(u.id);					
					if (u.name == key && !blacklisted && (upgrades[key].pp !== Infinity || whitelisted) && (u.basePrice - Game.cookies) / Game.cookiesPs < 600) 
					{
						var upgradeObj = {
								"id": u.id,
								"pp": upgrades[key].pp
							};
							
						if (whitelisted)
						{
							return [upgradeObj];
						}
						else
						{
							upgradeIDs.push(upgradeObj);
						}
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
			
		if (Game.BuildingsOwned == 0) // when the player owns no buildings, buy a cursor
		{
			var cursorBuilding = Game.ObjectsById[0];
			if (cursorBuilding.getPrice() <= Game.cookies)
			{
				cursorBuilding.buy(1);
			}
		}
		else
		{
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
			if (upgradesforbuy.length == 0 || (bbppfull.length > 0 && bbppfull[1].pp < upgradesforbuy[0].pp) && upgradesforbuy[0].pp != Infinity) {
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
				if (u.getPrice() < Game.cookies) {
					console.log("[Autobuy] Buying " + u.name);
					u.buy();
					QueueBuy(); // try buying another thing
				}
			}	
		}
	}



	var autoBuy = setInterval(function(){ Autobuy(0);}, autobuyInterval);
}
