// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
		`#Start by creating a new YAML document from the inputs on the left, or paste existing YAML here and press the 'Parse YAML' button.
`,
	mode: 'yaml'
});
//const packages = FetchSc4pacData();
//const sc4edata = FetchSc4EvermoreData();


const cm = document.querySelector('.CodeMirror').CodeMirror;
var yamlData = null;
var countOfPackages = 0;
var countOfAssets = 0;
ParseYaml();
ClearAssetInputs();
ClearPackageInputs();
SetEditingView('package');
document.getElementById("PkgPropTab").click();
//console.log(yamlData);


//TODO - validate YAML in code pane for valid yaml syntax
//TODO - validate YAML in code pane for valid sc4pac schema
//TODO - implement options + variants for packages


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
	yamlData.forEach((item) => {
		if (IsAsset(item)) {
			countOfAssets++;
		} else if (IsPackage(item)) {
			countOfPackages++;
		}
	});
	if (countOfAssets + countOfPackages == 0) {
		return;
	}

	var pkgList = Array(countOfPackages).fill().map((element, index) => index + 1);
	var pkgElement = document.getElementById('SelectPackageNumber');
	var pkgValue = pkgElement.value;
	pkgElement.replaceChildren();
	pkgElement.appendChild(new Option('New', 0));
	pkgList.forEach(i => pkgElement.add(new Option(i, i)));
	pkgElement.value = pkgValue;

	var astList = Array(countOfAssets).fill().map((element, index) => index + 1);
	var assetElement = document.getElementById('SelectAssetNumber');
	var assetValue = assetElement.value;
	assetElement.replaceChildren();
	assetElement.appendChild(new Option('New', 0));
	astList.forEach(i => assetElement.add(new Option(i, i)));
	pkgElement.value = assetValue;

	document.getElementById('CurrentItemCount').innerHTML = 'This file contains: ' + countOfPackages + ' packages, ' + countOfAssets + ' assets'
}


function UpdateCodePane() {
	var newValue = '';
	//TODO - figure out how to retain comments

	for (var idx = 0; idx < yamlData.length; idx++) {
		newValue = newValue + jsyaml.dump(yamlData[idx], {
			'lineWidth': -1,
			'quotingType': '"',
			'forceQuotes': true
		});
		if (idx !== yamlData.length - 1) {
			newValue = newValue + '\n---\n';
		}
	}
	cm.setValue(newValue);
}


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
 * Set the editing view to the desired state to show/hide the Package and Asset entry forms.
 * @param {string} viewName View to set. Valid values are 'package' or 'asset' 
 */
function SetEditingView(viewName) {
	if (viewName.toLowerCase() === 'package') {
		document.getElementById('EditingPackageDiv').classList.add('visible2');
		document.getElementById('EditingPackageDiv').classList.remove('invisible2');
		document.getElementById('EditingAssetDiv').classList.add('invisible2');
		document.getElementById('EditingAssetDiv').classList.remove('visible2');
	} else {
		document.getElementById('EditingPackageDiv').classList.add('invisible2');
		document.getElementById('EditingPackageDiv').classList.remove('visible2');
		document.getElementById('EditingAssetDiv').classList.remove('invisible2');
		document.getElementById('EditingAssetDiv').classList.add('visible2');
	}
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
}

function CopyToClipboard() {
	navigator.clipboard.writeText(cm.getValue())
}