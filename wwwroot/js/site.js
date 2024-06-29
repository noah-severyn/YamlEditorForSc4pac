// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
		`#Use the inputs on the left to generate YAML or paste an existing script here and parse it to begin modifications.
`,
	mode: 'yaml'
});

var pacAssets = new Array();
var pacPackages = new Array();
var sc4pacdata = FetchSc4pacData().then(result => {
	sc4pacdata = result.contents;
	pacAssets = result.contents.filter((item) => item.group === 'sc4pacAsset');
	pacPackages = result.contents.filter((item) => item.group !== 'sc4pacAsset');
});





const cm = document.querySelector('.CodeMirror').CodeMirror;
var yamlData = null;
var countOfPackages = 0;
var countOfAssets = 0;
var listOfAssets = new Array();
var listOfPackages = new Array();
ParseYaml();
ClearAssetInputs();
ClearPackageInputs();
document.getElementById("PkgPropTab").click();


//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema
//TODO - implement variants for packages


async function FetchSc4pacData() {
	const request = new Request('https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json');
	const response = await fetch(request);
	return await response.json();
}
async function FetchSc4EvermoreData() {
	const request = new Request('https://www.sc4evermore.com/latest-modified-downloads.php');
	const response = await fetch(request);
	return await response.json();
}



/**
 * Parse the current YAML input and update the UI accordingly based on the count of packages and assets.
 */
function ParseYaml() {
	yamlData = jsyaml.loadAll(cm.getValue());
	CountItems();
}

/**
 * Count the number of Packages and Assets in the code pane and update the UI with this new result.
 */
function CountItems() {
	countOfAssets = 0;
	countOfPackages = 0;
	listOfAssets.length = 0;
	listOfPackages.length = 0;

	if (yamlData !== null) {
		yamlData.forEach((item) => {
			if (IsAsset(item)) {
				countOfAssets++;
				listOfAssets.push(item);
			} else if (IsPackage(item)) {
				countOfPackages++;
				listOfPackages.push(item);
			}
		});
	}
	
	//if (countOfAssets + countOfPackages == 0) {
	//	return;
	//}


	//Package selection dropdown
	var pkgElement = document.getElementById('SelectPackageNumber');
	var currentValue = pkgElement.value;
	pkgElement.replaceChildren();
	pkgElement.appendChild(new Option('Create New Package', 0));
	for (var idx = 0; idx < listOfPackages.length; idx++) {
		pkgElement.add(new Option(idx + 1 + ' - ' + listOfPackages[idx].group + ":" + listOfPackages[idx].name, idx + 1));
	}
	pkgElement.value = currentValue;


	//Asset selection dropdown
	var assetElement = document.getElementById('SelectAssetNumber');
	currentValue = assetElement.value;
	assetElement.replaceChildren();
	assetElement.appendChild(new Option('Create New Asset', 0));
	for (var idx = 0; idx < listOfAssets.length; idx++) {
		assetElement.add(new Option(idx + 1 + ' - ' + listOfAssets[idx].assetId, idx + 1));
	}
	assetElement.value = currentValue;


	//Pachage dependency selection for local packages
	var localpackageChoice = document.getElementById('SelectLocalPackages');
	localpackageChoice.replaceChildren();
	localpackageChoice.appendChild(new Option('', ''));
	for (var idx = 0; idx < listOfPackages.length; idx++) {
		var pkgName = listOfPackages[idx].group + ":" + listOfPackages[idx].name;
		localpackageChoice.add(new Option(pkgName, pkgName));
	}


	//Package dependency selection for existing sc4pac packages
	var sc4pacPackageChoice = document.getElementById('SelectPacPackages');
	sc4pacPackageChoice.replaceChildren();
	sc4pacPackageChoice.appendChild(new Option('', ''));
	pacPackages.forEach(i => {
		var pkgName = i.group + ':' + i.name
		sc4pacPackageChoice.add(new Option(pkgName, pkgName))
	});


	//Package:asset selection for local assets
	var localAssetChoice = document.getElementById('SelectLocalPackageAssets');
	localAssetChoice.replaceChildren();
	localAssetChoice.appendChild(new Option('', ''));
	listOfAssets.forEach(i => localAssetChoice.add(new Option(i.assetId, i.assetId)));


	//Package:asset selection for existing sc4pac assets
	var sc4pacAssetChoice = document.getElementById('SelectPacPackageAssets');
	sc4pacAssetChoice.replaceChildren();
	sc4pacAssetChoice.appendChild(new Option('', ''));
	pacAssets.forEach(i => sc4pacAssetChoice.add(new Option(i.name, i.name)));

	document.getElementById('CurrentItemCount').innerHTML = 'This file contains: ' + countOfPackages + ' packages, ' + countOfAssets + ' assets'
}


function UpdateCodePane() {
	var newYaml = '';
	var doc = '';
	//TODO - figure out how to retain comments

	for (var idx = 0; idx < yamlData.length; idx++) {
		if (yamlData[idx] === null) {
			continue;
		}
		doc = jsyaml.dump(yamlData[idx], {
			'lineWidth': -1,
			'quotingType': '"',
			'noArrayIndent': true,
			'forceQuotes': true
		});
		//The parser blows away the multiline context so we need to rebuild it :(
		if (doc.indexOf('description: ') > 0) {
			
			var rgx = new RegExp('description: \"(.*?)\"');
			var oldText = doc.match(rgx)[0];
			var newText = oldText.replace('description: "', "description: >\n    ").replaceAll('\\n', '\n    ').replace('"','');
			doc = doc.replace(oldText, newText);
		}

		newYaml = newYaml + doc;
		if (idx !== yamlData.length - 1) {
			newYaml = newYaml + '\n---\n';
		}
	}
	cm.setValue(newYaml);
}

/**
 * Navigate to the specified tab.
 */
function OpenTab(event, tabName) {
	var i, tablinks;

	// Get all elements with class="tabcontent" and hide them
	var tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tab-link");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}

	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(tabName).style.display = "block";
	event.currentTarget.className += " active";

	//Set the editing view to the desired state to show/hide the Package and Asset entry forms.
	if (tabName === 'AssetProperties') {
		document.getElementById('EditingPackageDiv').classList.add('invisible2');
		document.getElementById('EditingPackageDiv').classList.remove('visible2');
		document.getElementById('EditingAssetDiv').classList.remove('invisible2');
		document.getElementById('EditingAssetDiv').classList.add('visible2');
	} else {
		document.getElementById('EditingPackageDiv').classList.add('visible2');
		document.getElementById('EditingPackageDiv').classList.remove('invisible2');
		document.getElementById('EditingAssetDiv').classList.add('invisible2');
		document.getElementById('EditingAssetDiv').classList.remove('visible2');
	}
	if (tabName === 'PackageAssets' || tabName === 'PackageProperties') {
		//have to recount the items so we get the pacAssets/pacPackages arrays to fill
		CountItems();
	}
}

function CopyToClipboard() {
	navigator.clipboard.writeText(cm.getValue())
}

function validate() {

}