/**
 * Clears all inputs and resets the code pane.
 */
function ClearAll() {
	ResetAllInputs();
	yamlData.length = 0;
	cm.setValue('#Use the inputs on the left to generate YAML or paste an existing script here and parse it to begin modifications.\n');
	ParseYaml();
}
/**
 * Resets all input form fields.
 */
function ResetAllInputs() {
	ResetPackageInputs();
	ResetIncludedAssetInputs();
	ResetVariantInputs();
	ResetIncludedAssetInputs();
	ResetAssetInputs();
}
/**
 * Resets the Package input form fields.
 */
function ResetPackageInputs() {
	currPackageIdx = '0';
	document.getElementById('PackageGroup').value = '';
	if (groupTomSelect = document.getElementById('PackageGroup').tomselect) groupTomSelect.clear(true);
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '';
	if (subfolderTomSelect = document.getElementById('PackageSubfolder').tomselect) subfolderTomSelect.clear(true);
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
}
/**
 * Resets the Included Asset input form fields.
 */
function ResetIncludedAssetInputs() {
	document.getElementById('SelectLocalPackageAssets').value = '';
	document.getElementById('SelectPacPackageAssets').value = '';
	document.getElementById('PackageAssetId').value = '';
	document.getElementById('PackageAssetInclude').value = '';
	document.getElementById('PackageAssetExclude').value = '';
	UpdateIncludedAssetTree();
}
/**
 * Resets the Varaint input form fields.
 */
function ResetVariantInputs() {
	document.getElementById('IsGlobalVariant').checked = false;
	document.getElementById('VariantKey').value = '';
	document.getElementById('VariantValue').value = '';
	document.getElementById('VariantDescription').value = '';
	document.getElementById('VariantDependencies').value = '';
	document.getElementById('VariantAssetId').value = '';
	document.getElementById('VariantInclude').value = '';
	document.getElementById('VariantExclude').value = '';
	if (variantPackageSelect = document.getElementById('VariantsPacPackageList').tomselect) variantPackageSelect.clear(true);
	if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
	document.getElementById('VariantsLocalPackageList').value = '';
	document.getElementById('VariantsLocalAssetList').value = '';
}
/**
 * Resets the Asset input form fields.
 */
function ResetAssetInputs() {
	document.getElementById('AssetUrl').value = '';
	document.getElementById('AssetId').value = '';
	document.getElementById('AssetVersion').value = '';
	document.getElementById('AssetLastModified').value = 0;
	document.getElementById('AssetLastModifiedText').value = '';
	document.getElementById('AddAssetButton').disabled = true;
}




/**
 * Apply basic validation rules for the specified entry field.
 */
function EntryValidation(elementId) {
	//Prevent adding package if any required fields are blank
	if (document.getElementById('PackageGroup').value === '' || document.getElementById('PackageName').value === '' || document.getElementById('PackageVersion').value === '' || document.getElementById('PackageSummary').value === '') {
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

	//
	if (document.getElementById('VariantKey').value === '' || document.getElementById('VariantValue').value === '') {
		document.getElementById('AddVariantButton').disabled = true;
	} else {
		document.getElementById('AddVariantButton').disabled = false;
	}

	

	var inputElement = document.getElementById(elementId);
	var inputText = inputElement.value;
	var locn = inputElement.selectionStart;
	
	var fieldName = elementId.replaceAll('Package', '').replaceAll('Asset', '');
	if (fieldName === 'Subfolder' || fieldName === 'LastModified') {
		return;
	} else if (fieldName === 'Group' || fieldName === 'Name' || fieldName === 'Id' || fieldName === 'VariantKey' || fieldName === 'VariantValue') {
		inputText = inputText.replaceAll(' ', '-').normalize('NFKD').replace(/[^\w-]/g, '').toLowerCase();
	} else if (fieldName === 'Dependencies') {
		inputText = inputText.replaceAll(' ', '-').normalize('NFKD').replace(/[^\w-:;\n]/g, '').toLowerCase();
	} else if (fieldName === 'Website' || fieldName === 'AssetUrl') {
		inputText = inputText.toLowerCase().replace(new RegExp('[^a-z0-9-&_:/?=.]'), '');
	}
	inputElement.value = inputText;

	//The replacement of invalid characters resets cursor position to the end which is undesirable; reset it to where the user was editing. This is only valid for non-dropdown inputs
	if (!["PackageGroup", "Subfolder"].includes(elementId)) {
		inputElement.setSelectionRange(locn, locn);
	}
}


// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------   Packages   ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Fill the Package input form fields with the values from the currently selected package number.
 */
function FillPackageForm() {
	document.getElementById('PackageGroup').value = selectedDoc.group;
	document.getElementById('PackageName').value = selectedDoc.name;
	document.getElementById('PackageVersion').value = selectedDoc.version;
	document.getElementById('PackageSubfolder').value = selectedDoc.subfolder;
	document.getElementById('PackageDependencies').value = ArrayToText(selectedDoc.dependencies);

	document.getElementById('PackageSummary').value = selectedDoc.info.summary;
	document.getElementById('PackageConflicts').value = selectedDoc.info.conflicts ?? '';
	document.getElementById('PackageWarning').value = selectedDoc.info.warning ?? '';
	document.getElementById('PackageDescription').value = selectedDoc.info.description ?? '';
	document.getElementById('PackageAuthor').value = selectedDoc.info.author ?? '';
	document.getElementById('PackageImages').value = ArrayToText(selectedDoc.info.images);
	document.getElementById('PackageWebsite').value = selectedDoc.info.website;

	//For some reason these must be last otherwise the regular text inputs will not populate correctly
	(pkgGroupSelect.createItem(selectedDoc.group) || pkgGroupSelect.addItem(selectedDoc.group));
	pkgSubfolderSelect.addItem(selectedDoc.subfolder);
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset number.
 */
function FillIncludedAssetForm(assetName) {
	var pkgAsset = selectedDoc.assets.find((i) => i.assetId === assetName);
	document.getElementById('PackageAssetId').value = pkgAsset.assetId;
	document.getElementById('PackageAssetInclude').value = ArrayToText(pkgAsset.include);
	document.getElementById('PackageAssetExclude').value = ArrayToText(pkgAsset.exclude);
}
/**
 * Adds the selected dependency to the list.
 */
function PackageAddDependency(input) {
	var currentDependencies = document.getElementById('PackageDependencies').value;
	if (currentDependencies === '') {
		document.getElementById('PackageDependencies').value = input.value + ';\n'
	} else {
		document.getElementById('PackageDependencies').value = currentDependencies + input.value + ';\n';
	}
	document.getElementById('PacPackageList').tomselect.clear(true);
	document.getElementById('LocalPackageList').value = '';
}
/**
 * Adds the selected sc4pac dependency to the list.
 */
function AddDepencencyFromPacList() {
	var selectedPkg = document.getElementById('PacPackageList').value;
	var currentDependencies = document.getElementById('PackageDependencies').value;
	if (currentDependencies === '') {
		document.getElementById('PackageDependencies').value = selectedPkg + ';\n'
	} else {
		document.getElementById('PackageDependencies').value = currentDependencies + selectedPkg + ';\n';
	}
	document.getElementById('PacPackageList').value = '';

	document.getElementById('PacPackageList').tomselect.clear(true);
	input.value = '';
}
/**
 * Update the YAML codepane with the values in the current Package form field.
 */
function UpdatePackageData(fieldName) {
	EntryValidation(fieldName);
	if (currPackageIdx !== '0') {
		selectedDoc.group = document.getElementById('PackageGroup').value;
		selectedDoc.name = document.getElementById('PackageName').value;
		selectedDoc.version = document.getElementById('PackageVersion').value;
		selectedDoc.subfolder = document.getElementById('PackageSubfolder').value;
		if (document.getElementById('PackageDependencies').value !== '') {
			selectedDoc.dependencies = TextToArray(document.getElementById('PackageDependencies').value);
		}

		selectedDoc.info.summary = document.getElementById('PackageSummary').value;
		if (document.getElementById('PackageWarning').value !== '') {
			selectedDoc.info.warning = document.getElementById('PackageWarning').value
		}
		if (document.getElementById('PackageConflicts').value !== '') {
			selectedDoc.info.conflicts = document.getElementById('PackageConflicts').value
		}
		if (document.getElementById('PackageDescription').value !== '') {
			selectedDoc.info.description = document.getElementById('PackageDescription').value.replaceAll('"', "'");
		}
		if (document.getElementById('PackageAuthor').value !== '') {
			selectedDoc.info.author = document.getElementById('PackageAuthor').value
		}
		if (document.getElementById('PackageImages').value !== '') {
			selectedDoc.info.images = TextToArray(document.getElementById('PackageImages').value);
		}
		selectedDoc.info.website = document.getElementById('PackageWebsite').value;
		UpdateCodePane();
	}
}
/**
 * Append a new package to the end of the YAML document.
 */
function AddPackage() {
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
	ParseYaml();
	CountItems();
}



// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Included Assets   ------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Add a new asset to the currently selected package.
 */
function AddIncludedAsset() {
	EntryValidation('PackageAssetId');
	if (currPackageIdx !== '0') {
		var newAsset = {
			assetId: document.getElementById('PackageAssetId').value
		}

		if (document.getElementById('PackageAssetInclude').value !== '') {
			newAsset.include = TextToArray(document.getElementById('PackageAssetInclude').value);
		}
		if (document.getElementById('PackageAssetExclude').value !== '') {
			newAsset.exclude = TextToArray(document.getElementById('PackageAssetExclude').value);
		}
		if (selectedDoc.assets === undefined) {
			selectedDoc.assets = new Array();
		}
		selectedDoc.assets.push(newAsset);

		ResetIncludedAssetInputs();
		document.getElementById('AddPackageAssetButton').disabled = true;
		UpdateCodePane();
		CountItems();
		UpdateIncludedAssetTree();
	}
}
/**
 * Sets the included asset id to the currently currently selected value.
 */
function SetIncludedAssetId(obj) {
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
function ResetIncludedAssetForm() {
	ResetIncludedAssetInputs();
}


// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------   Variants   ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Fill the Varaint input form fields with the specified variant.
 */
function NewVariant() {
	ResetVariantInputs();
}
function FillVariantFormHeader(vData) {
	var key = Object.keys(vData.variant)[0];
	var idx = key.lastIndexOf(':');
	document.getElementById('IsGlobalVariant').checked = (key.substring(0, idx) !== selectedDoc.group + ':' + selectedDoc.name);
	document.getElementById('VariantKey').value = key.substring(idx + 1);
	document.getElementById('VariantValue').value = Object.values(vData.variant)[0];
	document.getElementById('VariantDescription').value = '';
	document.getElementById('VariantDependencies').value = ArrayToText(vData.dependencies);
	document.getElementById('VariantDescription').value = selectedDoc.variantDescriptions[key][Object.values(vData.variant)[0]];
}
function FillVariantFormAsset(vAsset) {
	document.getElementById('VariantAssetId').value = vAsset.assetId;
	document.getElementById('VariantInclude').value = ArrayToText(vAsset.include);
	document.getElementById('VariantExclude').value = ArrayToText(vAsset.exclude);
}
function VariantAddDependency(input) {
	var currentDependencies = document.getElementById('VariantDependencies').value;
	if (currentDependencies === '') {
		document.getElementById('VariantDependencies').value = input.value + ';\n'
	} else {
		document.getElementById('VariantDependencies').value = currentDependencies + input.value + ';\n';
	}
	variantPackageSelect.clear(true);
}
function UpdateVariantData(elem) {
	if (elem.id === 'VariantsPacAssetList' || elem.id === 'VariantsLocalAssetList') {
		document.getElementById('VariantAssetId').value = elem.value;
		if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
		elem.value = '';
	} else if (elem.id === 'VariantsPacPackageList' || elem.id === 'VariantsLocalPackageList') {
		document.getElementById('VariantDependencies').value = document.getElementById('VariantDependencies').value + elem.value + ';\n';
		if (variantPackageSelect = document.getElementById('VariantsPacPackageList').tomselect) variantPackageSelect.clear(true);
		elem.value = '';
	} else {
		EntryValidation(elem.id);
		//Not going to bother implementing all of the onchange stuff here because I want to redesign how this works (see pr #43)
		//Also it's a convoluted process where once the variant key name is changed the current setup will not be able to find the named variant any more

	}
	UpdateCodePane();
}
function AddAssetToVariant() {
	var variant = GetVariant(selectedDoc.group + ':' + selectedDoc.name + ':' + document.getElementById('VariantKey').value, document.getElementById('VariantValue').value);

	var newAsset = {
		assetId: document.getElementById('VariantAssetId').value,
		include: TextToArray(document.getElementById('VariantInclude').value),
		exclude: TextToArray(document.getElementById('VariantExclude').value),
	};
	variant.assets.push(newAsset);


	document.getElementById('VariantAssetId').value = '';
	document.getElementById('VariantInclude').value = '';
	document.getElementById('VariantExclude').value = '';
	if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
	document.getElementById('VariantsLocalAssetList').value = '';
	UpdateVariantTree();
	UpdateCodePane();
}
function RemoveAssetFromVariant() {
	var variant = GetVariant(selectedDoc.group + ':' + selectedDoc.name + ':' + document.getElementById('VariantKey').value, document.getElementById('VariantValue').value);
	variant.assets = variant.assets.filter((i) => i.assetId !== document.getElementById('VariantAssetId').value);
}
function RemoveVariant() {
	selectedDoc.variants = selectedDoc.variants.filter((i) =>
		(Object.keys(i.variant)[0] !== document.getElementById('VariantKey').value) &&
		(Object.values(i.variant)[0] !== document.getElementById('VariantValue').value)
	);
	UpdateVariantTree();
	UpdateCodePane();
	ResetVariantInputs();
}

function AddNewVariant() {
	//The `variants` property of a document is an array of variant objects. The variant object has three properties:
	//	- variant: an object with one key value pair, with the key as the name of the variant, and the value its value
	//	- assets: an array of asset objects. Each aset object has three properties:
	//		- assetId: unique Id of the asset
	//		- include: array of items in the asset to include
	//		- exclude: array of items in the asset to exclude
	//	- dependencies: an array of strings
	var newKey;
	if (document.getElementById('IsGlobalVariant').checked) {
		newKey = document.getElementById('VariantKey').value;
	} else {
		newKey = `${selectedDoc.group}:${selectedDoc.name}:${document.getElementById('VariantKey').value}`;
	}
	var newValue = document.getElementById('VariantValue').value;
	var newVariant = {
		variant: { [newKey]: newValue },
		assets: new Array()
	}

	//To avoid writing null properties, only add the property if the input is not blank
	var newAsset = new Object();
	if (document.getElementById('VariantAssetId').value !== '') {
		newAsset.assetId = document.getElementById('VariantAssetId').value;
	}
	if (document.getElementById('VariantInclude').value !== '') {
		newAsset.include = TextToArray(document.getElementById('VariantInclude').value);
	}
	if (document.getElementById('VariantExclude').value !== '') {
		newAsset.exclude = TextToArray(document.getElementById('VariantExclude').value);
	}
	if (document.getElementById('VariantDependencies').value !== '') {
		newVariant.dependencies = TextToArray(document.getElementById('VariantDependencies').value);
	}

	newVariant.assets.push(newAsset);
	if (selectedDoc.variants === undefined) {
		selectedDoc.variants = new Array(newVariant);
	} else {
		selectedDoc.variants.push(newVariant);
	}
	
	//Add variant descriptions (if any)
	if (document.getElementById('VariantDescription').value !== '') {
		selectedDoc.variantDescriptions = newPackage = {
			[newKey]: {
				[newValue]: document.getElementById('VariantDescription').value
			}
		};
	}

	UpdateCodePane();
	CountItems();
	ResetVariantInputs();
	UpdateVariantTree();
}



// --------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------   Assets   ----------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Fill the Asset input form fields with the values from the currently selected asset number.
 */
function FillAssetForm() {
	document.getElementById('AddAssetButton').disabled = (currAssetIdx != '0');
	if (currAssetIdx !== '0') {
		document.getElementById('AssetUrl').value = selectedDoc.url;
		document.getElementById('AssetId').value = selectedDoc.assetId;
		document.getElementById('AssetVersion').value = selectedDoc.version;
		document.getElementById('AssetLastModified').value = new Date(selectedDoc.lastModified).toISOString().slice(0, 19);
	}
}
/**
 * Live update the YAML codepane with the values in the current Asset form field as the user types.
 */
function UpdateAssetItem(itemName) {
	EntryValidation(itemName);
	if (currAssetIdx !== '0') {
		selectedDoc.url = document.getElementById('AssetUrl').value;
		selectedDoc.assetId = document.getElementById('AssetId').value;
		selectedDoc.version = document.getElementById('AssetVersion').value;
		selectedDoc.lastModified = document.getElementById('AssetLastModified').value + 'Z';
		UpdateCodePane();
	}
}
/**
 * Add a new asset to the end of this YAML document.
 */
function AddAsset() {
	var newAsset = {
		url: document.getElementById('AssetUrl').value,
		assetId: document.getElementById('AssetId').value,
		version: document.getElementById('AssetVersion').value,
		lastModified: document.getElementById('AssetLastModified').value + 'Z'
	}
	yamlData.push(newAsset);

	UpdateCodePane();
	CountItems();
	UpdateMainTree();
	ResetAssetInputs();
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