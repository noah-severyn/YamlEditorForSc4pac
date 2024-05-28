/**
 * Clears all the Package input form fields.
 */
function ClearPackageInputs() {
	document.getElementById('PackageGroup').value = '';
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '050-early-mods';
	document.getElementById('PackageDependencies').value = '';
	//document.getElementById('PackageInclude').value = '';
	//document.getElementById('PackageExclude').value = '';
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	document.getElementById('PackageDescription').value = '';
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	document.getElementById('PackageWebsite').value = '';
}
/**
 * Clears all the Asset input form fields.
 */
function ClearAssetInputs() {
	document.getElementById('AssetUrl').value = '';
	document.getElementById('AssetId').value = '';
	document.getElementById('AssetVersion').value = '';
	document.getElementById('AssetLastModified').value = 0;
}


function EntryValidation(itemType, fieldName) {
	if (fieldName === 'AssetId') {
		var inputElement = document.getElementById(fieldName);
	} else {
		var inputElement = document.getElementById(itemType + fieldName);
	}
	var locn = inputElement.selectionStart;
	
	var inputText = inputElement.value;
	if (fieldName === 'Group' || fieldName === 'Name' || fieldName === 'AssetId') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-z0-9-]'), '');
	} else if (fieldName === 'Dependencies') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-z0-9-:;\n]'), '');
	} else if (fieldName === 'Website' || fieldName === 'URL') {

	}
	inputElement.value = inputText;

	//The replacement of invalid characters resets cursor position to the end which is undesirable; reset it to where the user was editing
	if (itemType + fieldName !== 'PackageSubfolder') {
		inputElement.setSelectionRange(locn, locn);
	}
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




/**
 * Fill the Package input form fields with the values from the currently selected asset number.
 */
function FillPackageForm() {
	var targetIdx = document.getElementById('SelectPackageNumber').value;
	var pkgIdx = 0;
	console.log(targetIdx);
	if (targetIdx === '0') {
		ClearPackageInputs();
	} else {
		var documents = cm.getValue().split('---');
		documents.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetIdx) {
					document.getElementById('PackageGroup').value = ExtractText(doc, '(?<=group: ).*');
					document.getElementById('PackageName').value = ExtractText(doc, '(?<=name: ).*');
					document.getElementById('PackageVersion').value = ExtractText(doc, '(?<=version: ).*');
					document.getElementById('PackageSubfolder').value = ExtractText(doc, '(?<=subfolder: ).*');
					document.getElementById('PackageDependencies').value = YamlListToArray(ExtractText(doc, '(?<=dependencies:\n)(.|\n)*(?=\nassets:)')).join(';\n');
					//TODO - incorporate include, exclude

					document.getElementById('PackageSummary').value = ExtractText(doc, '(?<=summary: ).*');
					document.getElementById('PackageConflicts').value = ExtractText(doc, '(?<=conflicts: ).*');
					document.getElementById('PackageWarning').value = ExtractText(doc, '(?<=warning: ).*');

					document.getElementById('PackageDescription').value = doc.match(new RegExp('(?<=>\n)(.|\n)*(?=\n  author)'))[0].replaceAll('"', '').replaceAll('    ', '');

					document.getElementById('PackageAuthor').value = ExtractText(doc, '(?<=author: ).*');
					document.getElementById('PackageImages').value = YamlListToArray(ExtractText(doc, '(?<=images:\n)(.|\n)*(?=\n  website:)')).join(';\n');
					document.getElementById('PackageWebsite').value = ExtractText(doc, '(?<=website: ).*');
				}
			}
		});
	}
}
/**
 * Live update the YAML codepane with the values in the current Package form field as the user types.
 */
function UpdatePackageItem(itemName) {
	EntryValidation('Package', itemName);

	var targetIdx = document.getElementById('SelectPackageNumber').value;
	var pkgIdx = 0;
	var newCode = '';
	if (targetIdx !== '0') {
		var documents = cm.getValue().split('---');
		documents.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetIdx) {
					var inputText = document.getElementById('Package' + itemName).value;

					//First check if the item is found to determine if we need to add or modify it
					if (doc.indexOf(itemName.toLowerCase() + ':') === -1) {
						switch (itemName) {
							case 'Dependencies':
								var idx = Math.min(doc.indexOf('assets:'), doc.indexOf('\ninfo:'));
								console.log(idx);
								var depList = inputText.replaceAll('\n', '').split(';');
								var newValue = 'dependencies:' + ArrayToYamlList(depList, 0) + '\n';
								break;
						}

						//console.log(doc.slice(0, idx));





						doc = doc.slice(0, idx) + newValue + doc.slice(idx, -1);


					}
					else {
						//Special case for Description: it's multiline text while all others are single line
						if (itemName === 'Description') {
							var rgx = new RegExp('>(.|\n)*(?=\n  author:)');
							var newValue = '>\n    ' + inputText.replaceAll('\n', '\n    ');
						}
						//Special case for items entered as an array: parse the multiline into multiple list items
						else if (['Dependencies', 'Include', 'Exclude', 'Images'].includes(itemName)) {
							switch (itemName) {
								case 'Dependencies':
									var rgx = new RegExp('(?<=dependencies:)(.|\n)*(?=\nassets:|\ninfo:)');
									break;
								case 'Include':
									var rgx = new RegExp('(?<=include:)(.|\n)*(?=\nexclude:)');
									break;
								case 'Exclude':
									var rgx = new RegExp('(?<=exclude:)(.|\n)*(?=\n\ninfo:)');
									break;
								case 'Images':
									var rgx = new RegExp('(?<=images:)(.|\n)*(?=\n  website:)');
									break;
							}
							var itemlist = inputText.replaceAll('\n', '').replaceAll('\\', '/').split(';');
							var newValue = newValue + ArrayToYamlList(itemlist, 2);
						}
						//Default case for other inputs
						else {
							var rgx = new RegExp(itemName.toLowerCase() + ': "(.*)"');
							newValue = itemName.toLowerCase() + ': ' + '"' + inputText + '"'
						}

						doc = doc.replace(rgx, newValue);
					}
				}
			}
			newCode = newCode + doc + '---'
		});
	}

	if (newCode.slice(-3) === '---') {
		newCode = newCode.slice(0, -3);
	}
	cm.setValue(newCode);
}




/**
 * Fill the Asset input form fields with the values from the currently selected asset number.
 */
function FillAssetForm() {
	var targetIdx = document.getElementById('SelectAssetNumber').value;
	var assetIdx = 0;
	if (targetIdx === '0') {
		ClearAssetInputs();
	} else {
		var documents = cm.getValue().split('---');
		documents.forEach(doc => {
			if (IsAsset(doc)) {
				assetIdx++;
				if (assetIdx == targetIdx) {
					document.getElementById('AssetUrl').value = ExtractText(doc, '(?<=url: ).*');
					document.getElementById('AssetId').value = ExtractText(doc, '(?<=assetId: ).*');
					document.getElementById('AssetVersion').value = ExtractText(doc, '(?<=version: ).*');
					document.getElementById('AssetLastModified').value = new Date(ExtractText(doc, '(?<=lastModified: ).*')).toISOString().slice(0, 19);
				}
			}
		});
	}
}
/**
 * Live update the YAML codepane with the values in the current Asset form field as the user types.
 */
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
/**
 * Add a new asset to the end of this YAML document
 */
function AppendNewAsset() {
	//Add asset listing to end of file
	var url = document.getElementById('AssetURL').value;
	var id = document.getElementById('AssetID').value;
	var version = document.getElementById('AssetVersion').value;
	var modified = document.getElementById('AssetLastModified').value;
	var newAsset =
		'\r\n---\r\nassetId: "' + id + '"' +
		'\r\nurl: "' + url + '"' +
		'\r\nversion: "' + version + '"' +
		'\r\nlastModified: "' + modified + 'Z"';
	if (countOfAssets + countOfPackages == 0) {
		cm.setValue(newAsset);
	} else {
		cm.setValue(cm.getValue() + newAsset);
	}

	//Add this asset to the package asset list
	//TODO - ability to add assets to a package

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




////This function is critical to update the value of the hidden control that gets submitted for validation
//function SetYamlText() {
//	document.getElementById('SubmittedYaml').value = cm.getValue();
//}






/**
 * Convert an array to a YAML list with the specified amount of indentation.
 * @param {Array} listText Array to process
 * @param {number} padding Number of spaces to indent by
 * @returns A string representing a YAML list
 */
function ArrayToYamlList(itemList, padding) {
	var newValue = '';
	itemList.forEach((item) => {
		if (item !== '') {
			console.log(item);
			newValue = newValue + '\n' + ' '.repeat(padding) + '- "' + item.trim() + '"';
		}
	});
	return newValue;
}
/**
 * Convert a YAML list in string format to an array.
 * @param {string} listText Text to process
 * @returns An array of strings
 */
function YamlListToArray(listText) {
	var itemList = listText.split('\n');
	for (var idx = 0; idx < itemList.length; idx++) {
		itemList[idx] = itemList[idx].replace('- ', '').trim();
	}
	return itemList
}
/**
 * Extract the result of matching text against a regex pattern while removing all quotes.
 * @param {*} searchText Text to search
 * @param {*} pattern Regex pattern
 * @returns The first matching string, or '' if no match is found
 */
function ExtractText(searchText, pattern) {
	var rgx = new RegExp(pattern);
	if (searchText.search(rgx) > 0) {
		var output = searchText.match(rgx)[0].replaceAll('"', '');
	} else {
		var output = '';
	}
	return output;
}

/**
 * Determine whether the specified substring includes represents a sc4pac Asset item.
 * @param {string} text The substring to analyze
 * @returns TRUE if the substring represents an Asset; FALSE otherwise
 */
function IsAsset(text) {
	return text.includes('assetId:') && text.includes("\nurl:") && text.includes("\nversion:") && text.includes("\nlastModified:");
}
/**
 * Determine whether the specified substring includes represents a sc4pac Package item.
 * @param {string} text The substring to analyze
 * @returns TRUE if the substring represents a Package; FALSE otherwise
 */
function IsPackage(text) {
	return text.includes("group:") && text.includes("\nname:") && text.includes("\nversion:") && text.includes("\nsubfolder:");
}