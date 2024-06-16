/**
 * Clears all the Package input form fields.
 */
function ClearPackageInputs() {
	document.getElementById('PackageGroup').value = '';
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '050-early-mods';
	document.getElementById('PackageDependencies').value = '';
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	document.getElementById('PackageDescription').value = '';
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	document.getElementById('PackageWebsite').value = '';

	document.getElementById('PackageAssetId').value = '';
	document.getElementById('PackageAssetInclude').value = '';
	document.getElementById('PackageAssetExclude').value = '';
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
/**
 * Apply basic validation rules for the specified entry field.
 */
function EntryValidation(elementId) {
	//Prevent adding package if any required fields are blank
	if (document.getElementById('PackageGroup').value === '' || document.getElementById('PackageName').value === '' || document.getElementById('PackageVersion').value === '' || document.getElementById('PackageSummary').value === '' || document.getElementById('PackageWebsite').value === '') {
		document.getElementById('AddPackageButton').disabled = true;
	} else {
		document.getElementById('AddPackageButton').disabled = false;
	}

	//Prevent adding asset if any required fields are blank
	if (document.getElementById('AssetUrl').value === '' || document.getElementById('AssetId').value === '' || document.getElementById('AssetVersion').value === '' || document.getElementById('AssetLastModified').value === '') {
		document.getElementById('AddAssetButton').disabled = true;
	} else {
		document.getElementById('AddAssetButton').disabled = false;
	}

	

	var inputElement = document.getElementById(elementId);
	var inputText = inputElement.value;
	var locn = inputElement.selectionStart;
	
	var fieldName = elementId.replaceAll('Package', '').replaceAll('Asset', '');
	if (fieldName === 'Subfolder' || fieldName === 'LastModified') {
		return;
	} else if (fieldName === 'Group' || fieldName === 'Name' || fieldName === 'Id') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-z0-9-]'), '');
	} else if (fieldName === 'Dependencies') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-z0-9-:;\n]'), '');
	} else if (fieldName === 'Website' || fieldName === 'Url') {
		inputText = inputText.toLowerCase().replace(new RegExp('[^a-z0-9-:/?=.]'), '');
	}
	inputElement.value = inputText;

	//The replacement of invalid characters resets cursor position to the end which is undesirable; reset it to where the user was editing
	inputElement.setSelectionRange(locn, locn);
}




// --------------------------------------------------------------------------------------------
// ---------------------------------------   Packages   ---------------------------------------
// --------------------------------------------------------------------------------------------

/**
 * Fill the Package input form fields with the values from the currently selected package number.
 */
function FillPackageForm() {
	var targetIdx = document.getElementById('SelectPackageNumber').value;
	document.getElementById('AddPackageButton').disabled = (document.getElementById('SelectPackageNumber').value != '0');
	var pkgIdx = 0;
	var assetCount = 0;
	if (targetIdx === '0') {
		ClearPackageInputs();
	} else {
		yamlData.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetIdx) {
					document.getElementById('PackageGroup').value = doc.group;
					document.getElementById('PackageName').value = doc.name;
					document.getElementById('PackageVersion').value = doc.version;
					document.getElementById('PackageSubfolder').value = doc.subfolder;
					document.getElementById('PackageDependencies').value = ArrayToText(doc.dependencies);

					document.getElementById('PackageSummary').value = doc.info.summary;
					document.getElementById('PackageConflicts').value = doc.info.conflicts ?? '';
					document.getElementById('PackageWarning').value = doc.info.warning ?? '';

					document.getElementById('PackageDescription').value = doc.info.description ?? '';

					document.getElementById('PackageAuthor').value = doc.info.author ?? '';
					document.getElementById('PackageImages').value = ArrayToText(doc.info.images);
					document.getElementById('PackageWebsite').value = doc.info.website;
					assetCount = doc.assets === undefined ? 0 : doc.assets.length;
				}
			}
		});
	}

	//Fill in the direct asset form, if any
	var assetList = Array(assetCount).fill().map((element, index) => index + 1);
	var assetListElement = document.getElementById('SelectPackageAsset');
	assetListElement.replaceChildren();
	assetListElement.appendChild(new Option('New', 0));
	assetList.forEach(i => assetListElement.add(new Option(i, i)));
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset number.
 */
function FillPackageAssetForm() {
	var pkgIdx = 0;
	var targetPkgIdx = document.getElementById('SelectPackageNumber').value;
	var assetIdx = document.getElementById('SelectPackageAsset').value;
	if (assetIdx === '0') {
		document.getElementById('PackageAssetId').value = '';
		document.getElementById('PackageAssetInclude').value = '';
		document.getElementById('PackageAssetExclude').value = '';
	} else {
		assetIdx--; //Arrays are zero-based but the dropdown is 1-based
		yamlData.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetPkgIdx) {
					document.getElementById('PackageAssetId').value = doc.assets[assetIdx].assetId;
					document.getElementById('PackageAssetInclude').value = ArrayToText(doc.assets[assetIdx].include);
					document.getElementById('PackageAssetExclude').value = ArrayToText(doc.assets[assetIdx].exclude);
				}
			}
		});
	}
}


function FillPackageAssetId() {
	document.getElementById('PackageAssetId').value = document.getElementById('SelectPackageAssetId').value;
}



/**
 * Live update the YAML codepane with the values in the current Package form field as the user types.
 */
function UpdatePackageItem(itemName) {
	EntryValidation(itemName);
	var targetIdx = document.getElementById('SelectPackageNumber').value;
	var pkgAssetIdx = document.getElementById('SelectPackageAsset').value;
	var pkgIdx = 0;
	if (targetIdx !== '0') {
		yamlData.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetIdx) {
					doc.group = document.getElementById('PackageGroup').value;
					doc.name = document.getElementById('PackageName').value;
					doc.version = document.getElementById('PackageVersion').value;
					doc.subfolder = document.getElementById('PackageSubfolder').value;
					if (document.getElementById('PackageDependencies').value !== '') {
						doc.dependencies = TextToArray(document.getElementById('PackageDependencies').value);
					}

					doc.info.summary = document.getElementById('PackageSummary').value;
					if (document.getElementById('PackageWarning').value !== '') {
						doc.info.warning = document.getElementById('PackageWarning').value
					}
					if (document.getElementById('PackageConflicts').value !== '') {
						doc.info.conflicts = document.getElementById('PackageConflicts').value
					}
					if (document.getElementById('PackageDescription').value !== '') {
						doc.info.description = document.getElementById('PackageDescription').value.replaceAll('"', "'");
					}
					if (document.getElementById('PackageAuthor').value !== '') {
						doc.info.author = document.getElementById('PackageAuthor').value
					}
					if (document.getElementById('PackageImages').value !== '') {
						doc.info.images = TextToArray(document.getElementById('PackageImages').value);
					}
					doc.info.website = document.getElementById('PackageWebsite').value;

					if (doc.assets !== undefined && pkgAssetIdx !== '0') {
						pkgAssetIdx--; //The dropdown is 1-based but the array is 0-based
						doc.assets[pkgAssetIdx].assetId = document.getElementById('PackageAssetId').value;
						if (document.getElementById('PackageAssetInclude').value !== '') {
							doc.assets[pkgAssetIdx].include = TextToArray(document.getElementById('PackageAssetInclude').value);
						}
						if (document.getElementById('PackageAssetExclude').value !== '') {
							doc.assets[pkgAssetIdx].exclude = TextToArray(document.getElementById('PackageAssetExclude').value);
						}

					}
				}
			}
		});
		UpdateCodePane();
	}
}
/**
 * Add a new package to the end of this YAML document.
 */
function AppendNewPackage() {
	//var newPackage = {
	//	group: document.getElementById('PackageGroup').value,
	//	name: document.getElementById('PackageName').value,
	//	version: document.getElementById('PackageVersion').value,
	//	subfolder: document.getElementById('PackageSubfolder').value,
	//	dependencies: TextToArray(document.getElementById('PackageDependencies').value),
	//	info: {
	//		summary: document.getElementById('PackageSummary').value,
	//		warning: document.getElementById('PackageWarning').value,
	//		conflicts: document.getElementById('PackageConflicts').value,
	//		description: document.getElementById('PackageDescription').value,
	//		author: document.getElementById('PackageAuthor').value,
	//		images: TextToArray(document.getElementById('PackageImages').value),
	//		website: document.getElementById('PackageWebsite').value,
	//	}
	//};
	var newPackage = {
		group: document.getElementById('PackageGroup').value,
		name: document.getElementById('PackageName').value,
		version: document.getElementById('PackageVersion').value,
		subfolder: document.getElementById('PackageSubfolder').value,
		info: {
			summary: document.getElementById('PackageSummary').value,
			website: document.getElementById('PackageWebsite').value,
		}
	};
	if (document.getElementById('PackageWarning').value !== '') {
		newPackage.info.warning = document.getElementById('PackageWarning').value;
	}
	if (document.getElementById('PackageConflicts').value !== '') {
		newPackage.info.conflicts = document.getElementById('PackageConflicts').value;
	}
	if (document.getElementById('PackageDescription').value !== '') {
		newPackage.info.description = document.getElementById('PackageDescription').value;
	}
	if (document.getElementById('PackageAuthor').value !== '') {
		newPackage.info.author = document.getElementById('PackageAuthor').value;
	}
	if (document.getElementById('PackageImages').value !== '') {
		newPackage.info.images = TextToArray(document.getElementById('PackageImages').value);
	}
	if (document.getElementById('PackageDependencies').value !== '') {
		newPackage.info.dependencies = TextToArray(document.getElementById('PackageDependencies').value);
	}
	yamlData.push(newPackage);

	UpdateCodePane();
	CountItems();
}
/**
 * Add a new asset to the currently selected package.
 */
function AddAssetToPackage() {
	EntryValidation('PackageAssetId');
	var targetIdx = document.getElementById('SelectPackageNumber').value;
	var pkgIdx = 0;
	if (targetIdx !== '0') {
		yamlData.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == targetIdx) {
					var newAsset = {
						assetId: document.getElementById('PackageAssetId').value
					}

					if (document.getElementById('PackageAssetInclude').value !== '') {
						newAsset.include = TextToArray(document.getElementById('PackageAssetInclude').value);
					}
					if (document.getElementById('PackageAssetExclude').value !== '') {
						newAsset.exclude = TextToArray(document.getElementById('PackageAssetExclude').value);
					}
					if (doc.assets === undefined) {
						doc.assets = new Array();
					}
					doc.assets.push(newAsset);
				}
			}
		});
	}
	UpdateCodePane();
	CountItems();
}




// --------------------------------------------------------------------------------------------
// ----------------------------------------   Assets   ----------------------------------------
// --------------------------------------------------------------------------------------------
/**
 * Fill the Asset input form fields with the values from the currently selected asset number.
 */
function FillAssetForm() {
	var targetIdx = document.getElementById('SelectAssetNumber').value;
	document.getElementById('AddAssetButton').disabled = (document.getElementById('SelectAssetNumber').value != '0');
	var assetIdx = 0;
	if (targetIdx === '0') {
		ClearAssetInputs();
	} else {
		yamlData.forEach(doc => {
			if (IsAsset(doc)) {
				assetIdx++;
				if (assetIdx == targetIdx) {
					document.getElementById('AssetUrl').value = doc.url;
					document.getElementById('AssetId').value = doc.assetId;
					document.getElementById('AssetVersion').value = doc.version;
					document.getElementById('AssetLastModified').value = new Date(doc.lastModified).toISOString().slice(0, 19);
				}
			}
		});
	}
}
/**
 * Live update the YAML codepane with the values in the current Asset form field as the user types.
 */
function UpdateAssetItem(itemName) {
	EntryValidation(itemName);
	var targetIdx = document.getElementById('SelectAssetNumber').value;
	var assetIdx = 0;
	if (targetIdx !== '0')  {
		yamlData.forEach(doc => {
			if (IsAsset(doc)) {
				assetIdx++;
				if (assetIdx == targetIdx) {
					doc.url = document.getElementById('AssetUrl').value;
					doc.assetId = document.getElementById('AssetId').value;
					doc.version = document.getElementById('AssetVersion').value;
					doc.lastModified = document.getElementById('AssetLastModified').value + 'Z';
				}
			}
		});
		UpdateCodePane();
	}
}
/**
 * Add a new asset to the end of this YAML document.
 */
function AppendNewAsset() {
	var newAsset = {
		url: document.getElementById('AssetUrl').value,
		assetId: document.getElementById('AssetId').value,
		version: document.getElementById('AssetVersion').value,
		lastModified: document.getElementById('AssetLastModified').value + 'Z'
	}
	yamlData.push(newAsset);

	UpdateCodePane();
	CountItems();
}

function FillDateTimePicker() {
	//  \d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(Z|-\d\d:\d\d)
	var inputValue = document.getElementById('AssetLastModifiedText').value.replaceAll('"', '');
	try {
		var newDate = new Date(inputValue).toISOString().slice(0, 19);
		document.getElementById('AssetLastModified').value = newDate
	} catch (e) {
		console.log(e)
	}
}




// --------------------------------------------------------------------------------------------
// -----------------------------------   Helper Functions   -----------------------------------
// --------------------------------------------------------------------------------------------
/**
 * Convert an array to the format used in input boxes for user input.
 * @param {Array} itemList List to process
 * @returns A single string, each item on a new line, semicolon delineated.
 */
function ArrayToText(itemList) {
	if (itemList === undefined || itemList === null) {
		return '';
	}

	var output = '';
	itemList.forEach((item) => {
		output = output + item + ';\n';
	});
	return output.slice(0, -1); //Remove the final \n
}
/**
 * Convert text to a properly formatted string array.
 * @param {string} text Semicolon delimited string to process
 * @returns An array of strings
 */
function TextToArray(text) {
	if (text === '' || text === null || text === undefined) {
		return null;
	}
	return text.replaceAll('\n', '').replaceAll('"', '').split(';').filter((item) => item !== '');
}
/**
 * Determine whether the specified object contains the properties of a sc4pac Asset.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents an Asset; FALSE otherwise
 */
function IsAsset(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'assetId') && Object.hasOwn(obj, 'lastModified') && Object.hasOwn(obj, 'url') && Object.hasOwn(obj, 'version');
}
/**
 * Determine whether the specified object contains the properties of a sc4pac Package.
 * @param {Object} obj The object to analyze
 * @returns TRUE if the object represents a Package; FALSE otherwise
 */
function IsPackage(obj) {
	if (obj === null || obj === undefined) {
		return false;
	}
	return Object.hasOwn(obj, 'group') && Object.hasOwn(obj, 'name') && Object.hasOwn(obj, 'version') && Object.hasOwn(obj, 'subfolder');
}