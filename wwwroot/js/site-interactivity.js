/**
 * Clears all inputs and the code pane.
 */
function ClearAll() {
	ClearPackageInputs();
	ClearAssetInputs();
	yamlData.length = 0;
	cm.setValue('');
	ParseYaml();
}
/**
 * Clears all the Package input form fields.
 */
function ClearPackageInputs() {
	document.getElementById('PackageGroup').value = '';
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '';
	document.getElementById('PackageDependencies').value = '';
	document.getElementById('LocalPackageList').value = '';
	document.getElementById('PacPackageList').value = '';
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	document.getElementById('PackageDescription').value = '';
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	document.getElementById('PackageWebsite').value = '';

	document.getElementById('SelectLocalPackageAssets').value = '';
	document.getElementById('SelectPacPackageAssets').value = '';
	document.getElementById('PackageAssetId').value = '';
	document.getElementById('PackageAssetInclude').value = '';
	document.getElementById('PackageAssetExclude').value = '';
}
/**
 * Clears all the Package Asset input form fields.
 */
function ClearPackageAssetInputs() {
	document.getElementById('SelectLocalPackageAssets').value = '';
	document.getElementById('SelectPacPackageAssets').value = '';
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
	document.getElementById('AssetLastModifiedText').value = '';
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
	} else if (fieldName === 'Website' || fieldName === 'AssetUrl') {
		inputText = inputText.toLowerCase().replace(new RegExp('[^a-z0-9-&_:/?=.]'), '');
	}
	inputElement.value = inputText;

	//The replacement of invalid characters resets cursor position to the end which is undesirable; reset it to where the user was editing
	inputElement.setSelectionRange(locn, locn);
}

function StartNewPackage() {
	ClearPackageInputs();
	currPackageIdx = '0';
}
function StartNewAsset() {
	ClearAssetInputs();
	currAssetIdx = '0';
}

// --------------------------------------------------------------------------------------------
// ---------------------------------------   Packages   ---------------------------------------
// --------------------------------------------------------------------------------------------

/**
 * Fill the Package input form fields with the values from the currently selected package number.
 */
function FillPackageForm() {
	document.getElementById('AddPackageButton').disabled = (currPackageIdx != '0');
	var pkgIdx = 0;
	if (currPackageIdx === '0') {
		ClearPackageInputs();
	} else {
		yamlData.forEach(doc => {
			if (IsPackage(doc)) {
				pkgIdx++;
				if (pkgIdx == currPackageIdx) {
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
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset number.
 */
function FillPackageAssetForm(assetName) {
	var pkgAsset = GetCurrentDocument('p').assets.find((i) => i.assetId === assetName);
	document.getElementById('PackageAssetId').value = pkgAsset.assetId;
	document.getElementById('PackageAssetInclude').value = ArrayToText(pkgAsset.include);
	document.getElementById('PackageAssetExclude').value = ArrayToText(pkgAsset.exclude);
}


function AddDependencyFromLocalList() {
	var selectedPkg = document.getElementById('SelectLocalPackage').value;
	var currentDependencies = document.getElementById('PackageDependencies').value;
	if (currentDependencies === '') {
		document.getElementById('PackageDependencies').value = selectedPkg
	} else {
		document.getElementById('PackageDependencies').value = currentDependencies + ';\n' + selectedPkg;
	}
	document.getElementById('SelectLocalPackage').value = '';
}
function AddDepencencyFromPacList() {
	var selectedPkg = document.getElementById('PacPackageList').value;
	var currentDependencies = document.getElementById('PackageDependencies').value;
	if (currentDependencies === '') {
		document.getElementById('PackageDependencies').value = selectedPkg + ';\n'
	} else {
		document.getElementById('PackageDependencies').value = currentDependencies+ selectedPkg + ';\n';
	}
	document.getElementById('PacPackageList').value = '';
}
/**
 * Live update the YAML codepane with the values in the current Package form field as the user types.
 */
function UpdatePackageData(fieldName) {
	EntryValidation(fieldName);
	if (currPackageIdx !== '0') {
		var doc = GetCurrentDocument('p');
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
		UpdateCodePane();
	}
}
/**
 * Add a new package to the end of this YAML document.
 */
function AppendNewPackage() {
	var newPackage = {
		group: document.getElementById('PackageGroup').value,
		name: document.getElementById('PackageName').value,
		version: document.getElementById('PackageVersion').value,
		subfolder: document.getElementById('PackageSubfolder').value,
		info: {}
	};
	if (document.getElementById('PackageDependencies').value !== '') {
		newPackage.dependencies = TextToArray(document.getElementById('PackageDependencies').value);
	}
	newPackage.info.summary = document.getElementById('PackageSummary').value;
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
	newPackage.info.website = document.getElementById('PackageWebsite').value;
	yamlData.push(newPackage);

	UpdateCodePane();
	CountItems();
}
/**
 * Add a new asset to the currently selected package.
 */
function AddIncludedAsset() {
	EntryValidation('PackageAssetId');
	if (currPackageIdx !== '0') {
		var doc = GetCurrentDocument('p');
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

		ClearPackageAssetInputs();
		document.getElementById('AddPackageAssetButton').disabled = true;
		UpdateCodePane();
		CountItems();
		UpdateAssetTree();
	}
}



function FillPkgAssetId(obj) {
	if (obj.id === 'SelectLocalPackageAssets') {
		document.getElementById('SelectPacPackageAssets').value = '';
	} else {
		document.getElementById('SelectLocalPackageAssets').value = '';
	}

	document.getElementById('PackageAssetId').value = obj.value;
	if (currPackageIdx != '0') {
		document.getElementById('AddPackageAssetButton').disabled = false;
	} else {
		document.getElementById('AddPackageAssetButton').disabled = true;
	}
}
function NewIncludedAsset() {
	ClearPackageAssetInputs();
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
	if (targetIdx !== '0') {
		if (itemName === 'AssetUrl') {

		}



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
/**
 * Converts UTC text pasted into the input box for to a valid datetime to populate the datetime picker.
 */
function FillDateTimePicker() {
	//  \d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(Z|-\d\d:\d\d)
	var inputValue = document.getElementById('AssetLastModifiedText').value.replaceAll('"', '');
	try {
		var newDate = new Date(inputValue).toISOString().slice(0, 19);
		document.getElementById('AssetLastModified').value = newDate;
		if (document.getElementById('AssetUrl').value !== '' && document.getElementById('AssetId').value !== '' && document.getElementById('AssetVersion').value !== '' && document.getElementById('AssetLastModified').value !== '') {
			document.getElementById('AddAssetButton').disabled = false;
		}
	} catch (e) {
		console.log(e)
	}
}


//TODO - move these functions to a new util class

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

/**
 * Return the currently selected package or asset document object.
 * @param {string} type The type of document to return. 'p' for packages and 'a' for assets.
 * @returns The currently selected document object of the specified type
 */
function GetCurrentDocument(type) {
	if (type.toLowerCase().charAt(0) === 'p') {
		if (currPackageIdx !== '0') {
			return yamlData.filter((doc) => IsPackage(doc))[currPackageIdx - 1];
		}
	} else {
		if (currAssetIdx !== '0') {
			return yamlData.filter((doc) => IsAsset(doc))[currAssetIdx - 1];
		}
	}
	return null;
}