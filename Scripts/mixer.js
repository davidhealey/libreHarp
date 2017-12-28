namespace mixer
{
	inline function onInitCB()
	{
		const var genericMixer = Synth.getMidiProcessor("genericMixer");
		const var ATTRIBUTES = {GAIN:0, DELAY:1, WIDTH:2, PAN:3, MUTE:4, SOLO:5, PURGE:6}; //The attributes/controls of the mic mixer module script
		const var NUM_ATTRIBUTES = 7;
		
		const var micNames = ["C", "D", "H"]; //Close, decca, hall
		const var pan = [];
		const var vol = [];
		const var delay = [];
		const var width = [];
		const var purge = [];

		for (i = 0; i < micNames.length; i++)
		{
			pan[i] = Content.getComponent("sliPan"+i);
			vol[i] = Content.getComponent("sliVol"+i);
			delay[i] = Content.getComponent("sliDelay"+i);
			width[i] = Content.getComponent("sliWidth"+i);
			purge[i] = Content.getComponent("btnPurge"+i);
	
			Content.setPropertiesFromJSON("sliPan"+i, {x:28+(i*55), stepSize:0.01});
			Content.setPropertiesFromJSON("sliVol"+i, {x:43+(i*55), type:"Decibel", max:3, bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
			Content.setPropertiesFromJSON("sliDelay"+i, {x:28+(i*55), bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
			Content.setPropertiesFromJSON("sliWidth"+i, {x:28+(i*55), bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
			Content.setPropertiesFromJSON("btnPurge"+i, {x:28+(i*55), text:micNames[i]});
	
			ui.sliderPanel("sliPan"+i, paintRoutines.biDirectionalSlider, 0, 0.5); //Set up callbacks for pan slider
			ui.buttonPanel("btnPurge"+i, paintRoutines.textButton); //Set up callbacks for purge button
		}
	}
	
	inline function onControlCB(number, value)
	{
		for (i = 0; i < micNames.length; i++)
		{
			if (number == vol[i])
			{
				genericMixer.setAttribute(ATTRIBUTES.GAIN+1 * (NUM_ATTRIBUTES*i), value);
				break;
			}
			else if (number == pan[i])
			{
				genericMixer.setAttribute(ATTRIBUTES.PAN+1 * (NUM_ATTRIBUTES*i), value);	
				pan[i].repaint();
				break;
			}
			else if (number == delay[i])
			{
				genericMixer.setAttribute(ATTRIBUTES.DELAY+1 * (NUM_ATTRIBUTES*i), value);
				break;
			}
			else if (number == width[i])
			{
				genericMixer.setAttribute(ATTRIBUTES.WIDTH+1 * (NUM_ATTRIBUTES*i), value);
				break;
			}
			else if (number == purge[i])
			{
				genericMixer.setAttribute(ATTRIBUTES.PURGE+1 * (NUM_ATTRIBUTES*i), 1-value);
				purge[i].repaint();
				break;
			}
		}		
	}
}