const PACKAGE_TABS = ['PackagePropertiesTab', 'PackageInfoTab', 'PackageAssetsTab', 'VariantsTab', 'VariantInfoTab'];
const ASSET_TABS = ['AssetPropertiesTab'];


/**
* Sets the state of the package tabs and asset tab to enabled or disabled based on the type of `selectedDoc`.
*/
function SetTabState() {
	if (localStorage.getItem('allow-partial-packages') === 'true') {
		//Enable the only first two package tabs (Properties and Info), for when partial package metadata is being created.
		SetTabsEnabled(['PackagePropertiesTab', 'PackageInfoTab'], true);
		SetTabsEnabled(['PackageAssetsTab', 'VariantsTab', 'VariantInfoTab', 'AssetPropertiesTab'], false);
	}
	else if (IsPackage(selectedDoc)) {
		SetTabsEnabled(PACKAGE_TABS, true);
		SetTabsEnabled(ASSET_TABS, false);
	}
	else if (IsAsset(selectedDoc)) {
		SetTabsEnabled(PACKAGE_TABS, false);
		SetTabsEnabled(ASSET_TABS, true);
	}
	else if (selectedDoc === null) {
		SetTabsEnabled(PACKAGE_TABS, true);
		SetTabsEnabled(ASSET_TABS, true);
	}
	/**
	* Enable or disable a list of tab elements.
	* @param {string[]} tabIds Array of tab element ids
	* @param {boolean} enabled Set to `TRUE` to enable, `FALSE` to disable
	*/
	function SetTabsEnabled(tabIds, enabled) {
		tabIds.forEach(id => {
			const el = document.getElementById(id);
			if (enabled) {
				el.classList.remove('disabled');
				el.setAttribute('data-bs-toggle', 'tab');
			} else {
				el.classList.add('disabled');
				el.removeAttribute('data-bs-toggle');
			}
		});
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
	FillVariantInfoTab();
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
	pkgConflictingSelect.clear(true);
	document.getElementById('PackageSummary').value = '';
	document.getElementById('PackageConflicts').value = '';
	document.getElementById('PackageWarning').value = '';
	pkgSummaryEditor.codemirror.off("change", UpdatePackageData);
	pkgSummaryEditor.codemirror.setValue('');
	pkgSummaryEditor.codemirror.on("change", UpdatePackageData);
	document.getElementById('PackageAuthor').value = '';
	document.getElementById('PackageImages').value = '';
	pkgImageSelect.clear(true);
	pkgImageSelect.clearOptions();
	pkgWebsitesSelect.clear(true);
	pkgWebsitesSelect.clearOptions();

	document.getElementById('CurrentDocumentType').innerHTML = 'package';
	document.getElementById('CurrentDocumentName').innerHTML = '[new package]';
	document.getElementById('VariantInfoContainer').innerHTML = '<p class="text-muted fst-italic">No variants defined. Add variants in the Variants tab first.</p>';
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
	if (selectedDoc.has('conflicting')) {
		let deps = (Array.isArray(selectedDoc.get('conflicting')) ? selectedDoc.get('conflicting') : selectedDoc.get('conflicting').items);
		if (typeof (deps) === 'string') {
			pkgConflictingSelect.addItem(deps, true);
		} else {
			deps.forEach((item) => {
				pkgConflictingSelect.addItem(item.value, true);
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
 * Updates, adds, or removes a property to the selected document at the specified index within the document.
 * @param {Array} keys Property name(s); one or more strings.
 * @param {any} values Property value(s) to set, either a string or an array of strings, or a eemeli/yaml object like a scalar
 */
function UpdateProperty(keys, values, position) {
	/** Index in the document to insert this property to. Passing The index ensures serialization in the correct order resulting in a clean text representation with all the properties in the order we're expecting. This index is scoped to only each item's parent property. */
	const nodePositions = {
		//Package properties
		group: 0
		, name: 1
		, version: 2
		, subfolder: 3
		, dependencies: 4
		, conflicting: 5
		, info: 6
		, assets: 7
		, variants: 8
		, variantInfo: 9

		//Package.Info properties
		, summary: 0
		, warning: 1
		, conflicts: 2
		, description: 3
		, author: 4
		, images: 5
		, website: 6
		, websites: 6

		//Package.Varaints properties
		, variant: 0
		//`dependencies` is already 4
		//`assets` is already 7

		//Package.Variants.Variant properties
		//`assetId` is already 0
		, include: 1
		, exclude: 2

		//Asset properties
		, assetId: 0
		, url: 1
		//`version` is already 2
		, lastModified: 3
		, checksum: 4
		, nonPersistentUrl: 5
		, archiveType: 6
	}

	if (selectedDoc === null) {
		selectedDoc = new YAML.Document(new Object());
	}
	let current = selectedDoc.contents;

	for (var idx = 0; idx < keys.length; idx++) {
		const key = keys[idx];

		if (idx === keys.length - 1) {
			if (!values || values[0] === '' || (IsObject(values) && !values.value)) { //if '', null, undefined, empty array, array with one blank string, object with a blank value property
				current.delete(key, values);
				if (selectedDoc.has(keys[0])) {
					if (selectedDoc.get(keys[0]).items.length === 0) {
						selectedDoc.delete(keys[0]);
					}
				}
				break;
			}
			else {
				if (selectedDoc.hasIn(keys)) {
					current.set(key, values);
				} else {
					current.items.splice(nodePositions[key] ?? 0, 0, new YAML.Pair(key, values)); // `?? 0` returns 0 in case the lookup is undefined (key is not in nodePositions)
				}
			}
			break;
		}

		let next = current.get(key);
		if (TypeOf(next) !== 'YAMLMap') {
			next = new YAML.YAMLMap();
			current.items.splice(nodePositions[key] ?? 0, 0, new YAML.Pair(key, next));
		}

		current = next;
	}
}

/**
 * Updates the selectedDoc with the current state of the Package Properties, Package Info, and Package Asset tabs.
 */
function UpdatePackageData() {
	UpdateProperty(['group'], document.getElementById('PackageGroup').value);
	UpdateProperty(['name'], document.getElementById('PackageName').value);
	UpdateProperty(['version'], document.getElementById('PackageVersion').value);
	UpdateProperty(['subfolder'], document.getElementById('PackageSubfolder').value);
	UpdateProperty(['dependencies'], pkgDependencySelect.getValue().split(','));
	UpdateProperty(['conflicting'], pkgConflictingSelect.getValue().split(','));

	UpdateProperty(['info', 'summary'], document.getElementById('PackageSummary').value);
	UpdateProperty(['info', 'warning'], document.getElementById('PackageWarning').value);
	UpdateProperty(['info', 'conflicts'], document.getElementById('PackageConflicts').value);
	UpdateProperty(['info', 'author'], document.getElementById('PackageAuthor').value);
	UpdateProperty(['info', 'images'], pkgImageSelect.getValue().split(','));

	let desc = new YAML.Scalar(document.getElementById('PackageDescription').value.replaceAll('"', "'"));
	desc.type = 'BLOCK_LITERAL'; // Ensures the "|-" style is used
	UpdateProperty(['info', 'description'], desc);

	const sites = pkgWebsitesSelect.getValue().split(',');
	if (sites.length > 1) {
		UpdateProperty(['info', 'websites'], sites);
		UpdateProperty(['info', 'website'], '');
	} else {
		UpdateProperty(['info', 'website'], sites[0]);
		UpdateProperty(['info', 'websites'], '');
	}


	//#region Included Assets
	let newAssetId = pkgAssetSelect.getValue();
	let newAssetInc = pkgAssetIncSelect.getValue().split(',');
	let newAssetExc = pkgAssetExcSelect.getValue().split(',');

	if (document.getElementById('PackageAssetId').value !== '' && selectedDoc.get('assets') === undefined) {
		const newSeq = selectedDoc.createNode([{ assetId: document.getElementById('PackageAssetId').value }]);
		newSeq.type = 'SEQ';
		selectedDoc.set('assets', newSeq);
		selectedPkgAssetIdx = 0;
	} else if (selectedDoc.has('assets') && selectedPkgAssetIdx != null) {
		let assetItem = selectedDoc.get('assets').items[selectedPkgAssetIdx];
		UpdateYamlSeqField(assetItem, 'include', pkgAssetIncSelect.getValue());
		UpdateYamlSeqField(assetItem, 'exclude', pkgAssetExcSelect.getValue());
	}
	//#endregion


	//To push the package to the list, at a minimum it must have a group and name so the cm.OnChange can pick it up
	if (currDocIdx === null && selectedDoc.has('group') && selectedDoc.has('name')) {
		selectedDoc.directives.docStart = false;
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
	document.getElementById('CurrentAsset').innerHTML = '[new asset]';
	pkgAssetSelect.clear(true);
	pkgAssetIncSelect.clear(true);
	pkgAssetIncSelect.clearOptions();
	pkgAssetExcSelect.clear(true);
	pkgAssetExcSelect.clearOptions();
	ResetConditionForm();
}
/**
 * Fill the Package Asset input form fields with the values from the currently selected package and asset index.
 */
function FillPackageAssetForm(assetName) {
	const pkgAsset = selectedDoc.get('assets').items.find((i) => i.get('assetId') === assetName);
	selectedPkgAssetIdx = selectedDoc.get('assets').items.findIndex((i) => i.get('assetId') === assetName);
	document.getElementById('CurrentAsset').innerHTML = assetName;
	pkgAssetSelect.addItem(assetName, true);

	FillTomSelectFromYamlSeq(pkgAsset, 'include', pkgAssetIncSelect);
	FillTomSelectFromYamlSeq(pkgAsset, 'exclude', pkgAssetExcSelect);
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
	UpdateProperty(['assetId'], document.getElementById('AssetId').value);
	UpdateProperty(['url'], document.getElementById('AssetUrl').value);
	UpdateProperty(['version'], document.getElementById('AssetVersion').value);
	UpdateProperty(['lastModified'], (document.getElementById('AssetLastModified').value === '' ? '' : document.getElementById('AssetLastModified').value + 'Z'));
	UpdateProperty(['nonPersistentUrl'], document.getElementById('AssetNonPersistentUrl').value);
	UpdateProperty(['checksum', 'sha256'], document.getElementById('AssetChecksum').value);
	UpdateProperty(['archiveType', 'format'], document.getElementById('AssetArchiveVersion').value === '0' ? '' : document.getElementById('AssetArchiveFormat').value);
	UpdateProperty(['archiveType', 'version'], document.getElementById('AssetArchiveVersion').value === '0' ? '' : document.getElementById('AssetArchiveVersion').value);

	//To push the package to the list it at minimum must have an assetId
	if (currDocIdx === null && selectedDoc.has('assetId')) {
		selectedDoc.directives.docStart = false;
		yamlData.push(selectedDoc);
		SetSelectedDoc(yamlData.filter((doc) => IsAsset(doc)).length - 1, 'a');
	}
	UpdateData();
	document.getElementById('CurrentDocumentName').innerHTML = selectedDoc.get('assetId');
}
