// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
`group: mattb325
name: new-york-w2w-pack-vol01
version: "1.0"
subfolder: 300-commercial

info:
  summary: Ten W2W buildings from New York City
  description: >
    This Wall-to-Wall pack consists of real buildings from around the Noho and Soho districts that take in a large variety of architectural styles.
    In addition to being taller mid-rise buildings which are great for busy city street scenes, these buildings are mostly all corner buildings.

    Some of the buildings not only grow as Commercial, but also as Residential buildings.
    They grow on lot sizes 1×1, 1×2 and 2×2 for medium and high-density zones with the New York tileset.
  author: "mattb325"
  website: https://community.simtropolis.com/files/file/33079-new-york-w2w-pack-vol01-maxis-nite-version/

variants:
  - variant: { nightmode: standard }
    assets:
      - assetId: mattb325-new-york-w2w-01-maxisnite
  - variant: { nightmode: dark }
    dependencies: [ "simfox:day-and-nite-mod" ]
    assets:
      - assetId: mattb325-new-york-w2w-01-darknite

---
assetId: mattb325-new-york-w2w-01-darknite
version: "1.0"
lastModified: "2019-08-10T21:32:52Z"
url: https://community.simtropolis.com/files/file/33078-new-york-w2w-pack-vol01-darknite-version/?do=download

---
assetId: mattb325-new-york-w2w-01-maxisnite
version: "1.0"
lastModified: "2019-08-10T21:37:39Z"
url: https://community.simtropolis.com/files/file/33079-new-york-w2w-pack-vol01-maxis-nite-version/?do=download
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




function EntryValidation(itemType, fieldName) {
	if (fieldName === 'AssetId') {
		var inputElement = document.getElementById(fieldName);
	} else {
		var inputElement = document.getElementById(itemType + fieldName);
	}

	
	var inputText = inputElement.value;
	if (fieldName === 'Group' || fieldName === 'Name' || fieldName === 'AssetId') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-zA-Z0-9-]'), '');
	} else if (fieldName === 'Website' || fieldName === 'URL') {

	}
	inputElement.value = inputText;

	////Special case for Description: it's multiline text while all others are single line
	//if (itemName === 'Description') {
	//	var rgx = new RegExp('>(.|\n)*(?=\n  author:)');
	//	var newValue = '>\n    ' + inputText.replaceAll('\n', '\n    ');
	//}
	////Special case for items entered as an array: parse the multiline into multiple list items
	//else if (['Dependencies', 'Include', 'Exclude', 'Images'].includes(itemName)) {
	//	switch (itemName) {
	//		case 'Include':
	//			var rgx = new RegExp('(?<=dependencies:)(.|\n)*(?=\assets:)');
	//			break;
	//		case 'Include':
	//			var rgx = new RegExp('(?<=include:)(.|\n)*(?=\nexclude:)');
	//			break;
	//		case 'Exclude':
	//			var rgx = new RegExp('(?<=exclude:)(.|\n)*(?=\n\ninfo:)');
	//			break;
	//		case 'Images':
	//			var rgx = new RegExp('(?<=images:)(.|\n)*(?=\n  website:)');
	//			break;
	//	}

	//	var itemlist = inputText.replaceAll('\n', '').replaceAll('\\', '/').split(';');
	//	var newValue = "";
	//	if (itemlist.at(-1) === '') {
	//		itemlist.pop();
	//	}
		
	//	itemlist.forEach((item) => {
	//		newValue = newValue + '\n  - "' + item.trim() + '"'
	//	});
	//}
	////Default case for other inputs
	//else {
	//	var rgx = new RegExp(itemName.toLowerCase() + ': "(.*)"');
	//	newValue = itemName.toLowerCase() + ': ' + '"' + inputText + '"'
	//}

	//cm.setValue(cm.getValue().replace(rgx, newValue));

	//if (itemName === 'Name') {
	//	document.getElementById('FileName').innerHTML = inputText + '.yaml'
	//}
}


function ArrayToYamlList(itemList, padding) {
	var newValue = '';
	itemList.forEach((item) => {
		if (item !== '') {
			newValue = newValue + '\n' + ' '.repeat(padding) + '- "' + item.trim() + '"';
		}
	});
	return newValue;
}

function AddNewPackage() {
	var group = document.getElementById('PackageGroup').value;
	var name = document.getElementById('PackageName').value;
	var version = document.getElementById('PackageVersion').value;
	var subfolder = document.getElementById('PackageSubfolder').value;
	var dependencies = document.getElementById('PackageDependencies').value;
	var include = document.getElementById('PackageInclude').value;
	var exclude = document.getElementById('PackageExclude').value;
	var summary = document.getElementById('PackageSummary').value;
	var conflicts = document.getElementById('PackageConflicts').value;
	var warning = document.getElementById('PackageWarning').value;
	var description = document.getElementById('PackageDescription').value;
	var author = document.getElementById('PackageAuthor').value;
	var images = document.getElementById('PackageImages').value;
	var website = document.getElementById('PackageWebsite').value;




	var newPackage = "\n---\n"
	var newPackage = newPackage + `group: "${group}"\nname: "${name}"\nversion: "${version}"\nsubfolder: "${subfolder}"`;
	if (dependencies !== '') {
		var depsList = dependencies.replaceAll('\n', '').split(';');
		console.log(depsList);
		newPackage = newPackage + '\ndependencies:' + ArrayToYamlList(depsList, 0);
	}


		//assets (include/exclude)
		//dependencies

		//'\r\ninfo: "' + subfolder + '"' +
		//'\r\n  summary: "' + summary + '"' +
		//'\r\n  description: >"\r\n    ' + description + '"' +
		//'\r\n  author: "' + author + '"' +
		//if (images.length > 0) {
		//	'';
		//}
		//'\r\n  images: "' + images + '"' +
		//'\r\n  website: "' + website + '"';

	newPackage = newPackage + '\ninfo:\n  summary: "' + summary + '"';
	if (warning !== '') {
		newPackage = newPackage + '\n  warning: "' + warning + '"';
	}
	if (conflicts !== '') {
		newPackage = newPackage + '\n  conflicts: "' + conflicts + '"';
	}
	if (description !== '') {
		newPackage = newPackage + '\n  description: >\n    ' + description.replaceAll('\n', '\n    ');
	}
	if (author !== '') {
		newPackage = newPackage + '\n  author: "' + author + '"';
	}
	if (images !== '') {
		var imgList = images.replaceAll('\n', '').split(';');
		console.log(imgList);
		newPackage = newPackage + '\ndependencies:' + ArrayToYamlList(imgList, 2);
	}
	newPackage = newPackage + '\n  website: "' + website + '"';





	if (countOfAssets + countOfPackages == 0) {
		cm.setValue(newPackage);
	} else {
		cm.setValue(cm.getValue() + newPackage);
	}
	

	////Add this asset to the package asset list
	//var currentContents = cm.getValue();
	//var assetHeaderLocn = currentContents.indexOf('assets:');
	//console.log(assetHeaderLocn);
	//cm.setValue(
	//	currentContents.slice(0, assetHeaderLocn + 7) +
	//	'\r\n- assetId: "' + id + '"' +
	//	currentContents.slice(assetHeaderLocn + 7)
	//);

	CountItems();
}
function AddNewAsset() {
	//Add asset listing to end of file
	var url = document.getElementById('AssetURL').value;
	var id = document.getElementById('AssetID').value;
	var version = document.getElementById('AssetVersion').value;
	var modified = document.getElementById('AssetLastModified').value;
	var newAsset = '\r\n---\r\nassetId: "' + id + '"' +
		'\r\nurl: "' + url + '"' +
		'\r\nversion: "' + version + '"' +
		'\r\nlastModified: "' + modified + 'Z"';
	if (countOfAssets + countOfPackages == 0) {
		cm.setValue(newAsset);
	} else {
		cm.setValue(cm.getValue() + newAsset);
	}
	

	//Add this asset to the package asset list
	var currentContents = cm.getValue();
	var assetHeaderLocn = currentContents.indexOf('assets:');
	console.log(assetHeaderLocn);
	cm.setValue(
		currentContents.slice(0, assetHeaderLocn + 7) +
		'\r\n- assetId: "' + id + '"' +
		currentContents.slice(assetHeaderLocn + 7)
	);
	CountItems();
}

function FillAssetForm() {
	var targetIdx = document.getElementById('SelectAssetNumber').value;
	var assetIdx = 0;
	console.log(targetIdx);
	if (targetIdx === '0') {
		document.getElementById('AssetUrl').value = '';
		document.getElementById('AssetId').value = '';
		document.getElementById('AssetVersion').value = '';
		document.getElementById('AssetLastModified').value = 0;
	} else {
		var documents = cm.getValue().split('---');
		documents.forEach(doc => {
			if (IsAsset(doc)) {
				assetIdx++;
				if (assetIdx == targetIdx) {
					var rgxAssetUrl = new RegExp('(?<=url: ).*');
					var rgxAssetId = new RegExp('(?<=assetId: ).*');
					var rgxAssetVer = new RegExp('(?<=version: ).*');
					var rgxAssetMod = new RegExp('(?<=lastModified: ).*');

					document.getElementById('AssetUrl').value = doc.match(rgxAssetUrl)[0].replaceAll('"','');
					document.getElementById('AssetId').value = doc.match(rgxAssetId)[0].replaceAll('"', '');
					document.getElementById('AssetVersion').value = doc.match(rgxAssetVer)[0].replaceAll('"', '');
					document.getElementById('AssetLastModified').value = new Date(doc.match(rgxAssetMod)[0].replaceAll('"', '')).toISOString().slice(0, 19);
				}
			}
		});
	}
}
function UpdateAssetItem(itemName) {
	EntryValidation('Asset', itemName);
	var targetIdx = document.getElementById('SelectAssetNumber').value;
	var assetIdx = 0;
	var newValue = '';
	if (targetIdx !== '0')  {
		var documents = cm.getValue().split('---');
		documents.forEach(doc => {
			if (IsAsset(doc)) {
				assetIdx++;
				if (assetIdx == targetIdx) {
					var rgx = new RegExp('(?<=' + itemName.charAt(0).toLowerCase() + itemName.slice(1) + ': ).*');
					if (itemName === 'AssetId') {
						var inputText = document.getElementById(itemName).value;
					} else {
						var inputText = document.getElementById("Asset" + itemName).value;
					}

					if (itemName === 'LastModified') {
						inputText = inputText + 'Z'
					}

					//console.log('rgx: '+ rgx +', found at:' + doc.search(rgx) + ', new val:' + inputText);
					doc = doc.replace(rgx, '"' + inputText + '"');
				}
			}
			newValue = newValue + doc + '---'
		});
	}

	if (newValue.slice(-3) === '---') {
		newValue = newValue.slice(0, -3);
	}
	cm.setValue(newValue);
}




//This function is critical to update the value of the hidden control that gets submitted for validation
function SetYamlText() {
	document.getElementById('SubmittedYaml').value = cm.getValue();
}


//Toggle the editing view between the Package and Asset fieldsets
function ToggleEditingView(valueToSet) {
	if (valueToSet !== undefined) {
		isEditingPackage = (valueToSet === 'true');
	} else {
		isEditingPackage = document.getElementById('EditingToggle').checked;
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

function IsAsset(text) {
	return text.includes('assetId:') && text.includes("\nurl:") && text.includes("\nversion:") && text.includes("\nlastModified:");
}
function IsPackage(text) {
	return text.includes("group:") && text.includes("\nname:") && text.includes("\nversion:") && text.includes("\nsubfolder:");
}