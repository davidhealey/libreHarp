namespace instrumentData
{	
	const var articulations = ["normal", "staccato", "fingernail", "table", "harmonics"];
	const var articulationDisplayNames = ["Normal", "Staccato", "Fingernail", "Prés de la table", "Harmonics"];
	const var range = [26, 96]; //The range of the currently loaded instruemtn

	//Instrument database
	const var database = {
		harp:
		{
			articulations:["normal", "staccato", "fingernail", "table", "harmonics"],
			range:[26, 96],
			articulationData:
			{
				normal:{range:[26, 96]},
				staccato:{range:[26, 96]},
				fingernal:{range:[26, 96]},
				table:{range:[26, 96]},
				harmonics:{range:[40, 88]}		
			}
		}
	};

	//***Instrument loading functions***
	
	inline function loadInstrument(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		loadSampleMaps(name, entry);
	}
	
	inline function loadSampleMaps(name, entry)
	{
		for (id in samplerIds) //Each sampler ID
		{
			local s = Synth.getSampler(id); //Get the sampler
		
			for (a in entry.articulations) //Each of the entry's articulations
			{
				if (id.indexOf(a) != -1) //Sample ID contains articulation name
				{
					s.setBypassed(false);
					s.loadSampleMap(name + "_" + id); //Load sample map for this instrument
					break; //Exit inner loop
				}
				else 
				{
					s.setBypassed(true); //Bypass unused sampler
					s.loadSampleMap("empty"); //Load empty sample map
				}
			}
		}
	}
	
	inline function hideUnusedControls(entry)
	{
		for (i = 0; i < articulations.length; i++) //Each articulation
		{
			//entry does not use the articulation
			if (entry.articulations.indexOf(articulations[i]) == -1)
			{
				//Hide unneeded controls by moving them beyond view (don't use visible property as this is used elsewhere)
				cmbKs[i].set("x", 1000);
				sliVol[i].set("x", 1000);
				sliAtk[i].set("x", 1000);
				sliRel[i].set("x", 1000);
			}
		}
	}
	
	inline function getData(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		return entry;
	}
	
	inline function getArticulationName(name, idx)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found		
		
		return entry.articulations[idx];
	}
	
	inline function getRange(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		return entry.range;
	}
	
	inline function getArticulationRange(name, articulation)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		if (entry.articulations.contains(articulation))
		{
			return entry.articulationData[articulation].range;
		}		
	}
	
	inline function getNumArticulations(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local i = 0;
		
		for (k in entry.articulationData)
		{
			i++;
		}
		
		return i;
	}
	
	inline function getArticulationNames(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local n = [];
		
		for (k in entry.articulationData)
		{
			n.push(k);
		}
		
		return n;
	}
}