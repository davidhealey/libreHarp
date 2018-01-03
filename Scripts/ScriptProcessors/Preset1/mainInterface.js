/*
    Copyright 2018 David Healey

    This file is part of Libre Harp.

    Libre Harp is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Libre Harp is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Libre Harp. If not, see <http://www.gnu.org/licenses/>.
*/

include("HISE-Scripting-Framework/libraries/asyncUpdater.js");
include("HISE-Scripting-Framework/libraries/instrumentDataHandler.js");
include("HISE-Scripting-Framework/libraries/uiFactory.js");

include("theme.js");
include("paintRoutines.js");
include("settingsWindowJson.js");
include("articulationEditor.js");
include("mixer.js");
include("controllerEditor.js");

Content.makeFrontInterface(650, 372);

Engine.loadFontAs("{PROJECT_FOLDER}Fonts/OpenSans-Regular.ttf", "Open Sans");

const var cmbInstrument = Content.getComponent("cmbInstrument"); //Instrument name selector (admin control)
reg instrumentName = cmbInstrument.getItemText(); //Instrument name, accesible to every other part of script

const var noteNames = [];
const var ccNums = [];

const var samplerIds = Synth.getIdList("Sampler");
const var containerIds = Synth.getIdList("Container");
const var scriptIds = Synth.getIdList("Script Processor");
const var samplers = [];
const var rrHandlers = []; //Round robin script processors

//Build array of samplers
for (id in samplerIds)
{
	samplers.push(Synth.getSampler(id));
}

//Build array of round robin handler scrips
for (id in scriptIds)
{
    if (id.indexOf("RoundRobin") == -1) continue;
    rrHandlers.push(Synth.getMidiProcessor(id));
}

//Populate note names and CC numbers arrays
for (i = 0; i < 127; i++)
{
	noteNames[i] = Engine.getMidiNoteName(i);
	ccNums[i] = i+1;
}

const var pnlLogo = Content.getComponent("pnlLogo");
pnlLogo.setPaintRoutine(paintRoutines.logo);
pnlLogo.setPopupData(SettingsJson.settings, [200, 15, 300, 300]);

const var pnlBg = Content.getComponent("pnlBg");
pnlBg.setPaintRoutine(paintRoutines.mainBg);

const var fltKeyboard = Content.getComponent("fltKeyboard");
fltKeyboard.setContentData({"Type":"Keyboard", "LowKey":24});

const var pnlTitleBg = Content.getComponent("pnlTitleBg");
pnlTitleBg.setPaintRoutine(paintRoutines.titleBG);

const var btnPreset = Content.getComponent("btnPreset"); //Preset browser button, invisible, over instrument title

//Page tabs
const var tabs = [];
tabs[0] = Content.getComponent("pnlMain");
tabs[1] = Content.getComponent("pnlSettings");

//Main tab
const var zones = [];
zones[0] = Content.getComponent("pnlLeftZone");
zones[1] = Content.getComponent("pnlMidZone");
zones[2] = Content.getComponent("pnlRightZone");

for (i = 0; i < zones.length; i++)
{
	zones[i].setPaintRoutine(paintRoutines.zone);
}

//Zone titles
const var lblArtTitle = Content.getComponent("lblArtTitle");
const var lblMixer = Content.getComponent("lblMixer");
const var lblControllers = Content.getComponent("lblControllers");
Content.setPropertiesFromJSON("lblArtTitle", {textColour:Theme.H1.colour, fontName:Theme.H1.fontName, fontSize:Theme.H1.fontSize});
Content.setPropertiesFromJSON("lblMixer", {textColour:Theme.H1.colour, fontName:Theme.H1.fontName, fontSize:Theme.H1.fontSize});
Content.setPropertiesFromJSON("lblControllers", {textColour:Theme.H1.colour, fontName:Theme.H1.fontName, fontSize:Theme.H1.fontSize});

//Includes initialisation
articulationEditor.onInitCB();
mixer.onInitCB();
controllerEditor.onInitCB();

//Settings tab
const var fltSettings = Content.getComponent("fltSettings");
fltSettings.setContentData(SettingsJson.settings);
SettingsJson.settings["Content"].push({"Type":"PresetBrowser", "Title":"Presets", "ColourData":{itemColour1:Theme.PRESET_BROWSER.itemColour1, bgColour:Theme.PRESET_BROWSER.bg}});

const var cmbSettings = [];

for (i = 0; i < 3; i++)
{
	Content.setPropertiesFromJSON("lblSet"+i, {textColour:Theme.H2.colour, fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
	cmbSettings[i] = Content.getComponent("cmbSet"+i);
}
const var bufferSizes = [256, 512, 1024, 2048, 4096, 8192, 16384];
ui.comboBoxPanel("cmbSet0", paintRoutines.comboBox, bufferSizes); //Preload size
ui.comboBoxPanel("cmbSet1", paintRoutines.comboBox, bufferSizes); //Buffer Size
ui.comboBoxPanel("cmbSet2", paintRoutines.comboBox, ["Off", "Cycle RR", "Random RR"]); //RR Mode

//Functions
inline function changeBufferSettings(attribute, value)
{
	for (s in samplers)
	{
		s.setAttribute(attribute, bufferSizes[value]);
	}
}function onNoteOn()
{
	articulationEditor.onNoteCB();
	controllerEditor.onNoteCB();
}
function onNoteOff()
{
	
}
function onController()
{
	articulationEditor.onControllerCB();	
	controllerEditor.onControllerCB();
}
function onTimer()
{
	
}
function onControl(number, value)
{
	switch (number)
	{
	    case cmbInstrument: //Hidden admin control to select instrument for preset
	        instrumentName = cmbInstrument.getItemText();
	        idh.loadInstrument(instrumentName, true);
	    break;
	    
		case btnPreset:
			ui.showControlFromArray(tabs, value);
		break;
			
		case cmbSettings[0]: //Preload size
			changeBufferSettings(4, value-1);
		break;
		
		case cmbSettings[1]: //Buffer size
			changeBufferSettings(5, value-1);
		break;

		case cmbSettings[2]: //RR Mode
		    for (r in rrHandlers) //Each round robin handler script
            {
	            if (value == 1)
                {
                    r.setAttribute(0, 1); //Bypass button
                }
                else 
                {
                    r.setAttribute(0, 0); //Bypass button
                    value == 3 ? r.setAttribute(1, 1) : r.setAttribute(1, 0); //Random/Cycle mode
                }
            }
		break;
		
		default:
			articulationEditor.onControlCB(number, value);
			mixer.onControlCB(number, value);
			controllerEditor.onControlCB(number, value);
		break;
	}
	
	
}
