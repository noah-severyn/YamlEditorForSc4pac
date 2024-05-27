// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
	'#Start by adding a package or an asset from the pane on the left.',
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




function UpdatePkgItem(itemName) {
	var inputElement = document.getElementById("Package" + itemName);
	var inputText = inputElement.value;
	if (itemName === 'Group' || itemName === 'Name' || itemName === 'AssetID') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-zA-Z0-9-]'), '');
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
	var idx = 0;
	console.log(targetIdx === '0');
	if (targetIdx === '0') {
		document.getElementById('AssetURL').value = '';
		document.getElementById('AssetID').value = '';
		document.getElementById('AssetVersion').value = '';
		document.getElementById('AssetLastModified').value = 0;
	} else {
		var documents = cm.getValue().split('---');
		forEach(doc => {
			alert(doc);
			if (IsAsset(doc)) {
				idx++;
			}
			if (idx == targetIdx) {
				var rgx1 = new RegExp('(?<=assetId:)(.|\n)*(?=\nurl:)');
				var rgx2 = new RegExp('(?<=url:)(.|\n)*(?=\nversion:)');
				var rgx3 = new RegExp('(?<=version:)(.|\n)*(?=\nlastModified:)');
				var rgx4 = new RegExp('(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)(Z|-\d\d:\d\d)');

				document.getElementById('AssetURL').value = doc.match(rgx1)[0];
				document.getElementById('AssetID').value = doc.match(rgx2)[0];
				document.getElementById('AssetVersion').value = doc.match(rgx3)[0];
				document.getElementById('AssetLastModified').value = doc.match(rgx4)[0];
			}
		});
	}
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
	pkgList.forEach(i => pkgElement.add(new Option(i, i)));
	//pkgElement.appendChild(new Option('New', countOfPackages + 1));

	var assetElement = document.getElementById('SelectAssetNumber');
	astList.forEach(i => assetElement.add(new Option(i, i)));
	//assetElement.appendChild(new Option('New', countOfAssets + 1));

	document.getElementById('CurrentItemCount').innerHTML = 'This file contains: ' + countOfPackages + ' packages, ' + countOfAssets + ' assets'
}

function IsAsset(text) {
	return text.includes('assetId:') && text.includes("\nurl:") && text.includes("\nversion:") && text.includes("\nlastModified:");
}
function IsPackage(text) {
	return text.includes("group:") && text.includes("\nname:") && text.includes("\nversion:") && text.includes("\nsubfolder:");
}