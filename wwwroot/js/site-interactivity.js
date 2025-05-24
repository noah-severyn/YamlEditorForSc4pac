


/**
* Disables the package tabs and enables the asset tab.
*/
function EnableAssetTab() {
	document.getElementById('PackagePropertiesTab').classList.add('disabled');
	document.getElementById('PackagePropertiesTab').removeAttribute('data-bs-toggle');
	document.getElementById('PackageInfoTab').classList.add('disabled');
	document.getElementById('PackageInfoTab').removeAttribute('data-bs-toggle');
	document.getElementById('PackageAssetsTab').classList.add('disabled');
	document.getElementById('PackageAssetsTab').removeAttribute('data-bs-toggle');
	document.getElementById('VariantsTab').classList.add('disabled');
	document.getElementById('VariantsTab').removeAttribute('data-bs-toggle');
	document.getElementById('VariantAssetsTab').classList.add('disabled');
	document.getElementById('VariantAssetsTab').removeAttribute('data-bs-toggle');

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
	document.getElementById('PackageAssetsTab').classList.remove('disabled');
	document.getElementById('PackageAssetsTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('VariantsTab').classList.remove('disabled');
	document.getElementById('VariantsTab').setAttribute('data-bs-toggle', 'tab');
	document.getElementById('VariantAssetsTab').classList.remove('disabled');
	document.getElementById('VariantAssetsTab').setAttribute('data-bs-toggle', 'tab');

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
	document.getElementById('PackageAssetsTab').classList.add('disabled');
	document.getElementById('PackageAssetsTab').removeAttribute('data-bs-toggle', 'tab');
	document.getElementById('VariantsTab').classList.add('disabled');
	document.getElementById('VariantsTab').removeAttribute('data-bs-toggle', 'tab');

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
 * @param {string} elementId The id of the tab element to select
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
 * Clears all input form fields and resets the code pane.
 */
function ClearAll() {
	ResetPackageAssetForm();
	ResetVariantForm();
	ResetVariantAssetForm();
	ResetPackageAssetForm();
	ResetAssetInputs();
	ResetPackageInputs(); //Reset package inputs last to the heading and the selected tab are aligned

	cm.setValue('');
	yamlData.length = 0;
	document.getElementById('YamlFileName').textContent = '';
	currDocIdx = null;
	UpdateData();
}




/**
 * Apply basic validation rules for the specified entry field.
 * @param {string} elementId The id of the input element being changed
 */
function ValidateInput(elementId) {
	let inputElement = document.getElementById(elementId);
	let inputText = inputElement.value;

	let fieldName = elementId.replaceAll('Package', '').replaceAll('Asset', '');
	if (fieldName === 'VariantName') {
		inputText = inputText.replaceAll(' ', '-').normalize('NFKD').replace(/[^\w-:]/g, '').toLowerCase();
	} else if (fieldName === 'Subfolder' || fieldName === 'LastModified') {
		return;
	} else if (fieldName === 'VariantValue' || fieldName === 'Group' || fieldName === 'Name' || fieldName === 'Id' || fieldName === 'Value') {
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
 * Resets the Package input form fields.
 */
function ResetPackageInputs() {
	selectedDoc = null;
	document.getElementById('PackageGroup').value = '';
	pkgGroupSelect.clear(true);
	document.getElementById('PackageName').value = '';
	document.getElementById('PackageVersion').value = '';
	document.getElementById('PackageSubfolder').value = '';
	pkgSubfolderSelect.clear(true);
	pkgDependencySelect.clear(true);
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	pkgSummaryEditor.codemirror.off("change", UpdatePackageData);
	pkgSummaryEditor.codemirror.setValue('');
	pkgSummaryEditor.codemirror.on("change", UpdatePackageData);
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	pkgWebsitesSelect.clear(true);
	pkgWebsitesSelect.clearOptions();

	document.getElementById('CurrentDocumentType').innerHTML = 'package';
	document.getElementById('CurrentDocumentName').innerHTML = '[new package]';
}
/**
 * Fill the Package input form fields with the values from the currently selected package number.
 */
function FillPackageForm() {
	(pkgGroupSelect.createItem(selectedDoc.get('group')) || pkgGroupSelect.addItem(selectedDoc.get('group'), true));
	document.getElementById('PackageName').value = selectedDoc.get('name');
	document.getElementById('PackageVersion').value = selectedDoc.get('version');
	pkgSubfolderSelect.addItem(selectedDoc.get('subfolder'), true);
	if (selectedDoc.has('dependencies')) {
		let deps = (Array.isArray(selectedDoc.get('dependencies')) ? selectedDoc.get('dependencies') : selectedDoc.get('dependencies').items);
		if (typeof(deps) === 'string') {
			pkgDependencySelect.addItem(deps, true);
		} else {
			deps.forEach((item) => {
				pkgDependencySelect.addItem(item.value, true);
			});
		}
	}

	document.getElementById('PackageSummary').value = selectedDoc.getIn(['info', 'summary']);
	document.getElementById('PackageConflicts').value = selectedDoc.getIn(['info', 'conflicts']) ?? '';
	document.getElementById('PackageWarning').value = selectedDoc.getIn(['info', 'warning']) ?? '';
	pkgSummaryEditor.codemirror.off("change", UpdatePackageData);
	pkgSummaryEditor.value(selectedDoc.getIn(['info', 'description']) ?? '');
	pkgSummaryEditor.codemirror.on("change", UpdatePackageData);
	document.getElementById('PackageAuthor').value = selectedDoc.getIn(['info', 'author']) ?? '';
	if (selectedDoc.hasIn(['info', 'images'])) {
		let images = selectedDoc.getIn(['info', 'images']).items;
		images.forEach(img => {
			pkgImageSelect.addOption({ value: img.value, text: img.value });
			pkgImageSelect.addItem(img.value, true);
		});
	}
	if (selectedDoc.hasIn(['info', 'websites'])) {
		let sites = selectedDoc.getIn(['info', 'websites']).items;
		sites.forEach(site => {
			pkgWebsitesSelect.addOption({ value: site.value, text: site.value });
			pkgWebsitesSelect.addItem(site.value, true);
		});
	} else {
		let site = selectedDoc.getIn(['info', 'website']) ?? '';
		pkgWebsitesSelect.addOption({ value: site, text: site });
		pkgWebsitesSelect.addItem(site, true);
	}

	document.getElementById('CurrentDocumentType').innerHTML = "package";
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('group') + ':' + selectedDoc.get('name');
}
/**
 * Updates the selectedDoc with the current state of the Package Properties and Package Info tabs.
 */
function UpdatePackageData() {
	//TODO rename this function to metadata, also the asset function too
	if (selectedDoc === null) {
		selectedDoc = new YAML.Document(new Object());
	}


	//#region Package Properties
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
		if (selectedDoc.get('dependencies') === undefined) {
			const newSeq = selectedDoc.createNode([document.getElementById('PackageDependencies').value]);
			newSeq.type = 'SEQ';
			selectedDoc.set('dependencies', newSeq);
		} else {
			selectedDoc.get('dependencies').items = [];
			pkgDependencySelect.getValue().split(',').forEach(dep => {
				selectedDoc.get('dependencies').add(dep);
			});
		}
	} else if (document.getElementById('PackageDependencies').value === '' && selectedDoc.has('dependencies')) {
		selectedDoc.delete('dependencies');
	}
	//#endregion


	//#region Package Info
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
		let scl = new YAML.Scalar(document.getElementById('PackageDescription').value.replaceAll('"', "'"));
		scl.type = 'BLOCK_LITERAL'; // Ensures the "|-" style is used
		selectedDoc.setIn(['info', 'description'], scl);
	} else if (document.getElementById('PackageDescription').value === '' && selectedDoc.hasIn(['info', 'description'])) {
		selectedDoc.deleteIn(['info', 'description']);
	}
	if (document.getElementById('PackageAuthor').value !== '') {
		selectedDoc.setIn(['info', 'author'], document.getElementById('PackageAuthor').value);
	}
	if (document.getElementById('PackageImages').value !== '') {
		selectedDoc.setIn(['info', 'images'], pkgImageSelect.getValue().split(','));
	}
	if (document.getElementById('PackageWebsite').value !== '') {
		let sites = pkgWebsitesSelect.getValue().split(',');
		if (sites.length > 1) {
			if (selectedDoc.hasIn(['info', 'websites'])) {
				selectedDoc.getIn(['info', 'websites']).items = [];
			} else {
				selectedDoc.addIn(['info', 'websites'], []);
			}
			sites.forEach(site => {
				selectedDoc.getIn(['info', 'websites']).add(site);
			});
			selectedDoc.deleteIn(['info', 'website']);
		} else {
			selectedDoc.setIn(['info', 'website'], sites[0]);
			selectedDoc.deleteIn(['info', 'websites']);
		}
	} else if (selectedDoc.hasIn(['info', 'website'])) {
		selectedDoc.deleteIn(['info', 'website']);
	} else if (selectedDoc.hasIn(['info', 'websites'])) {
		selectedDoc.deleteIn(['info', 'websites']);
	}
	//#endregion


	//#region Included Assets
	let newAssetId = pkgAssetSelect.getValue();
	let newAssetInc = pkgAssetIncSelect.getValue().split(',');
	let newAssetExc = pkgAssetExcSelect.getValue().split(',');

	if (document.getElementById('PackageAssetId').value !== '' && selectedDoc.get('assets') === undefined) {
		const newSeq = selectedDoc.createNode([{ assetId: document.getElementById('PackageAssetId').value }]);
		newSeq.type = 'SEQ';
		selectedDoc.set('assets', newSeq);
		selectedPkgAssetIdx = 0;
	} else if (selectedDoc.get('assets') !== undefined) {
		let assetItem = selectedDoc.get('assets').items[selectedPkgAssetIdx];
		if (document.getElementById('PackageAssetInclude').value !== '') {
			if (assetItem.get('include') === undefined) {
				const newSeq = selectedDoc.createNode([document.getElementById('PackageAssetInclude').value]);
				newSeq.type = 'SEQ';
				assetItem.set('include', newSeq);
			} else {
				assetItem.get('include').items = [];
				pkgAssetIncSelect.getValue().split(',').forEach(asset => {
					assetItem.get('include').add(asset);
				});
			}
		} else if (document.getElementById('PackageAssetInclude').value === '' && assetItem.has('include')) {
			assetItem.delete('include');
		}

		if (document.getElementById('PackageAssetExclude').value !== '') {
			if (assetItem.get('exclude') === undefined) {
				const newSeq = selectedDoc.createNode([document.getElementById('PackageAssetExclude').value]);
				newSeq.type = 'SEQ';
				assetItem.set('exclude', newSeq);
			} else {
				assetItem.get('exclude').items = [];
				pkgAssetExcSelect.getValue().split(',').forEach(asset => {
					assetItem.get('exclude').add(asset);
				});
			}
		} else if (document.getElementById('PackageAssetExclude').value === '' && assetItem.has('exclude')) {
			assetItem.delete('exclude');
		}
	}
	//#endregion


	//To push the package to the list, at a minimum it must have a group and name so the cm.OnChange can pick it up
	if (currDocIdx === null && selectedDoc.has('group') && selectedDoc.has('name')) {
		yamlData.push(selectedDoc);
		SetSelectedDoc(yamlData.filter((doc) => IsPackage(doc)).length - 1, 'p');
		document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('group') + ':' + selectedDoc.get('name');
	}
	UpdateData();
}
/**
 * Resets the Included Asset input form fields.
 */
function ResetPackageAssetForm() {
	selectedPkgAssetIdx = null;
	pkgAssetSelect.clear(true);
	pkgAssetIncSelect.clear(true);
	pkgAssetIncSelect.clearOptions();
	pkgAssetExcSelect.clear(true);
	pkgAssetExcSelect.clearOptions();
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset index.
 */
function FillPackageAssetForm(assetName) {
	const pkgAsset = selectedDoc.get('assets').items.find((i) => i.get('assetId') === assetName);
	selectedPkgAssetIdx = selectedDoc.get('assets').items.findIndex((i) => i.get('assetId') === assetName);
	pkgAssetSelect.addItem(assetName, true);

	if (pkgAsset.has('include')) {
		pkgAsset.get('include').items.forEach(item => {
			pkgAssetIncSelect.addOption({ value: item.value, text: item.value });
			pkgAssetIncSelect.addItem(item.value, true);
		});
	}

	if (pkgAsset.has('exclude')) {
		pkgAsset.get('exclude').items.forEach(item => {
			pkgAssetExcSelect.addOption({ value: item.value, text: item.value });
			pkgAssetExcSelect.addItem(item.value, true);
		});
	}
}




// --------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------   Assets   ----------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
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
		selectedDoc.setIn(['archiveType', 'format'], document.getElementById('AssetArchiveFormat').value);
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