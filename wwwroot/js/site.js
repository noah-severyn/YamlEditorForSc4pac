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

new TomSelect('#PacPackageList', {
	valueField: 'id',
	labelField: 'id',
	searchField: ['id'],

	// fetch remote data
	load: function (query, callback) {
		var self = this;
		if (self.loading > 1) {
			callback();
			return;
		}

		var url = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		fetch(url)
			.then(response => response.json())
			.then(json => {
				//Filter the response to remove assets and add a new field combining the group and name
				callback(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
					.map(i => ({ id: i.group + ":" + i.name, ...i }))
				);
				console.log(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
					.map(i => ({ id: i.group + ":" + i.name, ...i }))
				);
				self.settings.load = null;
			}).catch(() => {
				callback();
			});
	},
	// custom rendering function for options
	render: {
		option: function (item, escape) {
			return '<div class="py-2 d-flex">' + escape(item.group + ":" + item.name)+ '</div>';
		}
	},
});

new TomSelect('#PackageGroup', {
    valueField: 'group',
    labelField: 'group',
    searchField: ['group'],
	maxItems: 1,
	create: true,
	preload: true,
	persist: false,
	maxOptions: null,

    // fetch remote data
    load: function (query, callback) {
        var self = this;
        if (self.loading > 1) {
            callback();
            return;
        }

        var url = 'https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json'
		fetch(url)
            .then(response => response.json())
            .then(json => {
                //Filter the response to remove assets
				callback(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
				);
				console.log(json.contents
					.filter((item) => item.group !== 'sc4pacAsset')
				);
                self.settings.load = null;
            }).catch(() => {
                callback();
            });
    },
    // custom rendering function for options
    render: {
        option: function (item, escape) {
            return '<div class="py-2 d-flex">' + escape(item.group)+ '</div>';
        }
    },
});



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
	var localPkgList = document.getElementById('LocalPackageList');
	localPkgList.replaceChildren();
	localPkgList.appendChild(new Option('', ''));
	for (var idx = 0; idx < listOfPackages.length; idx++) {
		var pkgName = listOfPackages[idx].group + ":" + listOfPackages[idx].name;
		localPkgList.add(new Option(pkgName, pkgName));
	}

	//Package dependency selection for existing sc4pac packages
	//var pacPkgList = document.getElementById('PacPackageList');
	//pacPkgList.replaceChildren();
	//pacPkgList.appendChild(new Option('', ''));
	//console.log("pacPackages: " + pacPackages.length);
	//pacPackages.forEach(i => {
	//	var pkgName = i.group + ':' + i.name;
	//	pacPkgList.add(new Option(pkgName, pkgName));
	//});


	//Package:asset selection for local assets
	var localAssetList = document.getElementById('SelectLocalPackageAssets');
	localAssetList.replaceChildren();
	localAssetList.appendChild(new Option('', ''));
	listOfAssets.forEach(i => localAssetList.add(new Option(i.assetId, i.assetId)));

	//Package:asset selection for existing sc4pac assets
	var pacAssetList = document.getElementById('SelectPacPackageAssets');
	pacAssetList.replaceChildren();
	pacAssetList.appendChild(new Option('', ''));
	pacAssets.forEach(i => pacAssetList.add(new Option(i.name, i.name)));



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

	//If the selected package is blank then select the first one if available
	if (document.getElementById('SelectPackageNumber').value == 0 && countOfPackages > 0) {
		document.getElementById('SelectPackageNumber').value = "1";
		FillPackageForm();
	}
}

function CopyToClipboard() {
	navigator.clipboard.writeText(cm.getValue())
}

function validate() {

}