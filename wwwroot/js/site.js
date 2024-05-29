// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
`# Package
group: "nos17"
name: "andisart-sc2013-homes-redone"
version: "1.1.0"
subfolder: "200-residential"
assets:
- assetId: "nos17-andisart-sc2013-homes-redone"
info:
  summary: "A remake of AndisArt's SC2013 Inspired Homes"
  description: >
    This relotting pack contains 12 lots, including 1x2, 1x3, 1x4, 2x4, 2x3, 2x2, 3x2, and 3x3 lots.
    Stats were generated with PIMX and all lots range from Stage 1-4 R$$.
  author: "nos.17"
  images:
  - "https://www.simtropolis.com/objects/screens/monthly_2020_01/A1.jpg.2e418ed1c46a0538a1adb03931abb8e9.jpg"
  - "https://www.simtropolis.com/objects/screens/monthly_2023_10/a3_orig.jpg.203376de7f327292bc2e2f6f74b4b9fd.jpg"
  - "https://www.simtropolis.com/objects/screens/monthly_2023_10/a4_orig.jpg.6cc2a9e97848e3714db48a76a0789b9a.jpg"
  - "https://www.simtropolis.com/objects/screens/monthly_2023_10/a5_orig.jpg.d5c93a3b65ddb00fc8e0ba58e5b640d6.jpg"
  - "https://www.simtropolis.com/objects/screens/monthly_2023_10/a2_orig.jpg.2919f17b395145108e36e55211dcf342.jpg"
  website: "https://community.simtropolis.com/files/file/33379-andisart-sc13-homes-redone/"

---
# Asset
assetId: "nos17-andisart-sc2013-homes-redone"
version: "1.1.0"
lastModified: "2023-10-28T13:17:08Z"
url: "https://community.simtropolis.com/files/file/33379-andisart-sc13-homes-redone/?do=download"
`,
	mode: 'yaml'
});
//const packages = FetchSc4pacData();
//const sc4edata = FetchSc4EvermoreData();


const cm = document.querySelector('.CodeMirror').CodeMirror;
var isEditingPackage = true;
var countOfPackages = 0;
var countOfAssets = 0;
CountItems();
ClearAssetInputs();
ClearPackageInputs();
ToggleEditingView();


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
 * Toggle the editing view between the Package and Asset fieldsets to hide/unhide the appropriate divs.
 */
function ToggleEditingView(valueToSet) {
	if (valueToSet !== undefined) {
		isEditingPackage = (valueToSet === 'true');
	} else {
		isEditingPackage = valueToSet;
	}

	if (isEditingPackage) {
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
 * Count the number of Packages and Assets in the code pane and updates the UI with this new result.
 */
function CountItems() {
	countOfAssets = 0;
	countOfPackages = 0;
	var items = cm.getValue().split('---');
	items.forEach((item) => {
		if (IsAsset(item)) {
			countOfAssets++;
		} else if (IsPackage(item)) {
			countOfPackages++;
		}
	});
	var pkgList = Array(countOfPackages).fill().map((element, index) => index + 1);
	var astList = Array(countOfAssets).fill().map((element, index) => index + 1);

	var pkgElement = document.getElementById('SelectPackageNumber');
	pkgElement.replaceChildren();
	pkgElement.appendChild(new Option('New', 0));
	pkgList.forEach(i => pkgElement.add(new Option(i, i)));

	var assetElement = document.getElementById('SelectAssetNumber');
	assetElement.replaceChildren();
	assetElement.appendChild(new Option('New', 0));
	astList.forEach(i => assetElement.add(new Option(i, i)));

	document.getElementById('CurrentItemCount').innerHTML = 'This file contains: ' + countOfPackages + ' packages, ' + countOfAssets + ' assets'
}


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