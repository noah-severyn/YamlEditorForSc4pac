


/**
* Disables the package tabs and enables the asset tab.
*/
function EnableAssetTab() {
	document.getElementById('PackagePropertiesTab').classList.add('disabled');
	document.getElementById('PackagePropertiesTab').removeAttribute('data-bs-toggle');
	document.getElementById('PackageInfoTab').classList.add('disabled');
	document.getElementById('PackageInfoTab').removeAttribute('data-bs-toggle');
	document.getElementById('IncludedAssetsTab').classList.add('disabled');
	document.getElementById('IncludedAssetsTab').removeAttribute('data-bs-toggle');
	document.getElementById('PackageVaraintsTab').classList.add('disabled');
	document.getElementById('PackageVaraintsTab').removeAttribute('data-bs-toggle');

	document.getElementById('AssetPropertiesTab').classList.remove('disabled');
	document.getElementById('AssetPropertiesTab').setAttribute('data-bs-toggle', 'tab');
}
/**
* Enables the package tabs and disables the asset tab.
*/
function EnablePackageTabs() {
	document.getElementById('PackagePropertiesTab').classList.remove('disabled');
	document.getElementById('PackagePropertiesTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('PackageInfoTab').classList.remove('disabled');
	document.getElementById('PackageInfoTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('IncludedAssetsTab').classList.remove('disabled');
	document.getElementById('IncludedAssetsTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('PackageVaraintsTab').classList.remove('disabled');
	document.getElementById('PackageVaraintsTab').setAttribute('data-bs-toggle', 'tab');

	document.getElementById('AssetPropertiesTab').classList.add('disabled');
	document.getElementById('AssetPropertiesTab').removeAttribute('data-bs-toggle');
}
/**
* Enables the only first two package tabs (Properties and Info), for when partial package metadata is being created.
*/
function EnablePartialPackageTabs() {
	document.getElementById('PackagePropertiesTab').classList.remove('disabled');
	document.getElementById('PackagePropertiesTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('PackageInfoTab').classList.remove('disabled');
	document.getElementById('PackageInfoTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('IncludedAssetsTab').classList.add('disabled');
	document.getElementById('IncludedAssetsTab').removeAttribute('data-bs-toggle', 'tab');
	document.getElementById('PackageVaraintsTab').classList.add('disabled');
	document.getElementById('PackageVaraintsTab').removeAttribute('data-bs-toggle', 'tab');

	document.getElementById('AssetPropertiesTab').classList.add('disabled');
	document.getElementById('AssetPropertiesTab').removeAttribute('data-bs-toggle');
}

/**
* Sets the state of the package tabs and asset tab to enabled or disabled based on the type of `selectedDoc`.
*/
function SetTabState() {
	if (localStorage.getItem('allow-partial-packages') === 'true') {
		EnablePartialPackageTabs();
	} 
	else if (IsAsset(selectedDoc)) {
		EnableAssetTab();
	}
	else {
		EnablePackageTabs();
	}
}
/**
 * Maintain side effects of switching between the tabs and optionally activate the specified tab.
 * @param {string} elementId The Id of the tab element to select
 * @param {boolean} triggerEvent Whether to trigger the click event to show the tab. Default is TRUE
 */
function SelectTab(elementId, triggerEvent = true) {
	if (elementId === 'AssetPropertiesTab') {
		document.getElementById('PackageControls').classList.add("d-none");
	} else {
		document.getElementById('PackageControls').classList.remove("d-none");
	}

	if (triggerEvent) {
		(new bootstrap.Tab(document.getElementById(elementId))).show();
	}
}




/**
 * Clears all inputs and resets the code pane.
 */
function ClearAll() {
	ResetAllInputs();
	cm.setValue('');
	yamlData.length = 0;
	document.getElementById('YamlFileName').textContent = '';
	UpdateData();
}
/**
 * Resets all input form fields.
 */
function ResetAllInputs() {
	ResetIncludedAssetInputs();
	ResetVariantInputs();
	ResetIncludedAssetInputs();
	ResetAssetInputs();
	ResetPackageInputs(); //Reset package inputs last to the heading and the selected tab are aligned
}
/**
 * Resets the Package input form fields.
 */
function ResetPackageInputs() {
	selectedDoc = null;
	document.getElementById('PackageGroup').value = '';
	if (groupTomSelect = document.getElementById('PackageGroup').tomselect) groupTomSelect.clear(true);
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '';
	if (subfolderTomSelect = document.getElementById('PackageSubfolder').tomselect) subfolderTomSelect.clear(true);
	document.getElementById('PackageDependencies').value = '';
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	document.getElementById('PackageDescription').value = '';
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	document.getElementById('PackageWebsite').value = '';
	document.getElementById('PackageWebsite').rows = '1';
	document.getElementById('IsMultipleWebsites').checked = false;

	document.getElementById('CurrentDocumentType').innerHTML = 'package';
	document.getElementById('CurrentDocumentName').innerHTML = '[new package]';
}
/**
 * Resets the Included Asset input form fields.
 */
function ResetIncludedAssetInputs() {
	if (pkgAssetSelect = document.getElementById('PackageAssetId').tomselect) pkgAssetSelect.clear(true);
	document.getElementById('PackageAssetInclude').value = '';
	document.getElementById('PackageAssetExclude').value = '';
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
	if (variantAssetSelect = document.getElementById('VariantAssetId').tomselect) variantAssetSelect.clear(true);
	if (variantPackageSelect = document.getElementById('VariantDependencies').tomselect) variantPackageSelect.clear(true);
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
	document.getElementById('AssetArchiveVersion').selectedIndex = 0;
	document.getElementById('AssetChecksum').value = '';
	document.getElementById('AssetNonPersistentUrl').value = '';

	document.getElementById('CurrentDocumentType').innerHTML = 'asset';
	document.getElementById('CurrentDocumentName').innerHTML = '[new asset]';
}




/**
 * Apply basic validation rules for the specified entry field.
 * @param {string} elementId The Id of the input element being changed
 */
function ValidateInput(elementId) {
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
	} else if (fieldName === 'Website' || fieldName === 'Websites' || fieldName === 'Url') {
		inputText = inputText.toLowerCase().replace(new RegExp('[^a-z0-9-&_:;/?=.\n]'), '');
	} else if (fieldName === 'Include' || fieldName === 'Exclude') {
		//Want to replace ONLY for file/folder names, not regex strings
		//inputText = inputText.replaceAll('\\', '/');
	}
	inputElement.value = inputText;

	//The replacement of invalid characters resets cursor position to the end which is undesirable; reset it to where the user was editing. This is only valid for non-dropdown inputs
	if (["PackageGroup", "PackageSubfolder", "AssetArchiveVersion"].indexOf(elementId) === -1) {
		inputElement.setSelectionRange(locn, locn);
	}
}


function ToggleMultipleWebsites() {
	var currVal = document.getElementById('IsMultipleWebsites').checked;
	if (currVal) {
		document.getElementById('PackageWebsiteLabel').textContent = 'Websites';
		document.getElementById('PackageWebsite').rows = '3';
	} else {
		document.getElementById('PackageWebsiteLabel').textContent = 'Website';
		document.getElementById('PackageWebsite').value = document.getElementById('PackageWebsite').value.split(';')[0];
		document.getElementById('PackageWebsite').rows = '1';
	}
	UpdatePackageData();
}



function RemoveSelectedDoc() {
	if (IsPackage(selectedDoc)) {
		yamlData = yamlData.filter((doc) => doc.group + doc.name !== selectedDoc.group + selectedDoc.name);
	} else {
		yamlData = yamlData.filter((doc) => doc.assetId !== selectedDoc.assetId);
	}

	UpdateData();
	ResetAssetInputs();
}



// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------   Packages   ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Fill the Package input form fields with the values from the currently selected package number.
 */
function FillPackageForm() {
	document.getElementById('PackageGroup').value = selectedDoc.get('group');
	document.getElementById('PackageName').value = selectedDoc.get('name');
	document.getElementById('PackageVersion').value = selectedDoc.get('version');
	document.getElementById('PackageSubfolder').value = selectedDoc.get('subfolder');
	document.getElementById('PackageDependencies').value = ArrayToText(selectedDoc.get('dependencies'));

	document.getElementById('PackageSummary').value = selectedDoc.getIn(['info', 'summary']);
	document.getElementById('PackageConflicts').value = selectedDoc.getIn(['info', 'conflicts']) ?? '';
	document.getElementById('PackageWarning').value = selectedDoc.getIn(['info', 'warning']) ?? '';
	pkgSummaryEditor.value(selectedDoc.getIn(['info', 'description']) ?? '');
	document.getElementById('PackageAuthor').value = selectedDoc.getIn(['info', 'author']) ?? '';
	selectedDoc.getIn(['info', 'images']).toJSON().forEach((item) => {
		pkgImageSelect.addOption({ value: item, text: item });
		pkgImageSelect.addItem(item);
	});

	if (selectedDoc.hasIn(['info', 'websites'])) {
		document.getElementById('PackageWebsite').value = ArrayToText(selectedDoc.getIn(['info', 'websites']).toJSON()) ?? '';
		document.getElementById('PackageWebsite').rows = '3';
		document.getElementById('IsMultipleWebsites').checked = true;
	} else {
		document.getElementById('PackageWebsite').value = selectedDoc.getIn(['info', 'website']) ?? '';
		document.getElementById('PackageWebsite').rows = '1';
		document.getElementById('IsMultipleWebsites').checked = false;
	}

	//For some reason these must be last otherwise the regular text inputs will not populate correctly
	(pkgGroupSelect.createItem(selectedDoc.get('group')) || pkgGroupSelect.addItem(selectedDoc.get('group')));
	pkgSubfolderSelect.addItem(selectedDoc.get('subfolder'));

	document.getElementById('CurrentDocumentType').innerHTML = "package";
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('group') + ':' + selectedDoc.get('name');
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset number.
 */
function FillIncludedAssetForm(assetName) {
	var pkgAsset = selectedDoc.get('assets').toJSON().find((i) => i.assetId === assetName);
	selectedPkgAssetIdx = selectedDoc.get('assets').toJSON().findIndex((i) => i.assetId === assetName);
	document.getElementById('PackageAssetId').value = pkgAsset.assetId;
	document.getElementById('PackageAssetInclude').value = ArrayToText(pkgAsset.include);
	document.getElementById('PackageAssetExclude').value = ArrayToText(pkgAsset.exclude);
}
/**
 * Updates the selectedDoc with the current state of the Package Properties and Package Info tabs.
 */
function UpdatePackageData() {
	if (selectedDoc === null) {
		selectedDoc = new YAML.Document(new Object());
	}

	// Package Properties
	if (document.getElementById('PackageGroup').value !== '') {
		selectedDoc.setIn(['group'], document.getElementById('PackageGroup').value);
	}
	if (document.getElementById('PackageName').value !== '') {
		selectedDoc.setIn(['name'], document.getElementById('PackageName').value);
	}
	if (document.getElementById('PackageVersion').value !== '') {
		selectedDoc.setIn(['version'], document.getElementById('PackageVersion').value);
	}
	if (document.getElementById('PackageSubfolder').value !== '') {
		selectedDoc.setIn(['subfolder'], document.getElementById('PackageSubfolder').value);
	}
	if (document.getElementById('PackageDependencies').value !== '') {
		selectedDoc.setIn(['dependencies'], TextToArray(document.getElementById('PackageDependencies').value));
	}

	// Package Info
	if (document.getElementById('PackageSummary').value !== '') {
		selectedDoc.setIn(['info', 'summary'], document.getElementById('PackageSummary').value);
	}
	if (document.getElementById('PackageWarning').value !== '') {
		selectedDoc.setIn(['info', 'warning'], document.getElementById('PackageWarning').value);
	}
	if (document.getElementById('PackageConflicts').value !== '') {
		selectedDoc.setIn(['info', 'conflicts'], document.getElementById('PackageConflicts').value);
	}
	if (document.getElementById('PackageDescription').value !== '') {
		var scl = new YAML.Scalar(document.getElementById('PackageDescription').value.replaceAll('"', "'"));
		scl.type = 'BLOCK_LITERAL'; // Ensures the "|-" style is used
		selectedDoc.setIn(['info', 'description'], scl);
	}
	if (document.getElementById('PackageAuthor').value !== '') {
		selectedDoc.setIn(['info', 'author'], document.getElementById('PackageAuthor').value);
	}
	if (document.getElementById('PackageImages').value !== '') {
		selectedDoc.setIn(['info', 'images'], pkgImageSelect.getValue().split(','));
	}
	if (document.getElementById('PackageWebsite').value !== '') {
		if (document.getElementById('IsMultipleWebsites').checked) {
			selectedDoc.setIn(['info', 'websites'], TextToArray(document.getElementById('PackageWebsite').value));
			selectedDoc.deleteIn(['info', 'website']);
		} else {
			selectedDoc.setIn(['info', 'website'], document.getElementById('PackageWebsite').value);
			selectedDoc.deleteIn(['info', 'websites']);
		}
	}

	// Included Assets
	if (document.getElementById('PackageAssetId').value !== '') {
		selectedDoc.get('assets').items[selectedPkgAssetIdx].set('assetId', document.getElementById('PackageAssetId').value)
		
	}

	//To push the package to the list it at minimum must have a group and name so the cm.OnChange can pick it up
	if (currDocIdx === null && selectedDoc.has('group') && selectedDoc.has('name')) {
		yamlData.push(selectedDoc);
		SetSelectedDoc(yamlData.filter((doc) => IsPackage(doc)).length - 1, 'p');
	}
	UpdateData();
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('group') + ':' + selectedDoc.get('name');


	
}



// --------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------   Included Assets   ------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Add a new asset to the currently selected package.
 */
function AddIncludedAsset() {
	ValidateInput('PackageAssetId');
	if (selectedDoc !== null) {
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
		UpdateData();
	}
}


// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------   Variants   ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
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
	//Prevent adding a variant if any required fields are blank
	if (document.getElementById('VariantKey').value === '' || document.getElementById('VariantValue').value === '') {
		document.getElementById('AddVariantButton').disabled = true
		document.getElementById('RemoveVariantButton').disabled = true;
	} else {
		document.getElementById('AddVariantButton').disabled = false;
		document.getElementById('RemoveVariantButton').disabled = false;
	}

	if (elem.id === 'VariantsPacAssetList' || elem.id === 'VariantsLocalAssetList') {
		document.getElementById('VariantAssetId').value = elem.value;
		if (variantPackageSelect = document.getElementById('VariantsPacAssetList').tomselect) variantPackageSelect.clear(true);
		elem.value = '';
	} else if (elem.id === 'VariantsPacPackageList' || elem.id === 'VariantsLocalPackageList') {
		document.getElementById('VariantDependencies').value = document.getElementById('VariantDependencies').value + elem.value + ';\n';
		if (variantPackageSelect = document.getElementById('VariantsPacPackageList').tomselect) variantPackageSelect.clear(true);
		elem.value = '';
	} else {
		ValidateInput(elem.id);
		//TODO - update variant data
		//Not going to bother implementing all of the onchange stuff here because I want to redesign how this works (see pr #43)
		//Also it's a convoluted process where once the variant key name is changed the current setup will not be able to find the named variant any more

	}
	UpdateData();
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
	UpdateData();
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
	UpdateData();
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

	UpdateData();
	ResetVariantInputs();
}



// --------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------   Assets   ----------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
/**
 * Fill the Asset input form fields with the values from the currently selected asset number.
 */
function FillAssetForm() {
	if (selectedDoc === undefined || selectedDoc === null) { return; }
	document.getElementById('AssetUrl').value = selectedDoc.get('url');
	document.getElementById('AssetId').value = selectedDoc.get('assetId');
	document.getElementById('AssetVersion').value = selectedDoc.get('version');
	document.getElementById('AssetLastModified').value = new Date(selectedDoc.get('lastModified')).toISOString().slice(0, 19);
	if (selectedDoc.has('archiveType')) {
		document.getElementById('AssetArchiveVersion').value = selectedDoc.getIn(['archiveType', 'version']);
	}
	if (selectedDoc.has('checksum')) {
		document.getElementById('AssetChecksum').value = selectedDoc.getIn(['checksum', 'sha256']);
	}
	if (selectedDoc.has('nonPersistentUrl')) {
		document.getElementById('AssetNonPersistentUrl').value = selectedDoc.get('nonPersistentUrl');
	}

	document.getElementById('CurrentDocumentType').innerHTML = "asset";
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('assetId');
}
/**
 * Updates the selectedDoc with the current state of the Asset Properties tab inputs.
 */
function UpdateAssetData() {
	if (selectedDoc === null) {
		selectedDoc = new YAML.Document(new Object());
	}

	if (document.getElementById('AssetUrl').value !== '') {
		selectedDoc.setIn(['url'], document.getElementById('AssetUrl').value);
	}
	if (document.getElementById('AssetId').value !== '') {
		selectedDoc.setIn(['assetId'], document.getElementById('AssetId').value);
	}
	if (document.getElementById('AssetVersion').value !== '') {
		selectedDoc.setIn(['version'], document.getElementById('AssetVersion').value);
	}
	if (document.getElementById('AssetLastModified').value !== '') {
		selectedDoc.setIn(['lastModified'], document.getElementById('AssetLastModified').value + 'Z');
	}
	if (document.getElementById('AssetArchiveVersion').value !== '0') {
		if (selectedDoc.has('archiveType')) {
			selectedDoc.setIn(['archiveType', 'format'], "Clickteam");
		}
		selectedDoc.setIn(['archiveType', 'version'], document.getElementById('AssetArchiveVersion').value);
	} else {
		selectedDoc.deleteIn(['archiveType']);
	}
	if (document.getElementById('AssetChecksum').value !== '') {
		if (!selectedDoc.has('checksum')) {
			selectedDoc.checksum = new Object();
		}
		selectedDoc.setIn(['checksum', 'sha256'], document.getElementById('AssetChecksum').value);
	} else {
		selectedDoc.deleteIn(['checksum']);
	}
	if (document.getElementById('AssetNonPersistentUrl').value !== '') {
		selectedDoc.setIn(['nonPersistentUrl'], document.getElementById('AssetNonPersistentUrl').value);
	} else {
		selectedDoc.deleteIn(['nonPersistentUrl']);
	}

	//To push the package to the list it at minimum must have an assetId
	if (currDocIdx === null && selectedDoc.has('assetId')) {
		yamlData.push(selectedDoc);
		SetSelectedDoc(yamlData.filter((doc) => IsAsset(doc)).length - 1, 'a');
	}
	UpdateData();
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('assetId');
}