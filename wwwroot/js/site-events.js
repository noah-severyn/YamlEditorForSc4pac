// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------   General event handlers   --------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('NewPackageButton').addEventListener('click', () => {
	ClearSelectedDoc();
	ResetPackageInputs();
	SelectTab('PackagePropertiesTab');
	EnablePackageTabs();
});
document.getElementById('NewAssetButton').addEventListener('click', () => {
	ClearSelectedDoc();
	ResetAssetInputs();
	SelectTab('AssetPropertiesTab');
	EnableAssetTab();
});
for (const tab of document.querySelectorAll('.nav-link')) {
	tab.addEventListener('click', () => { SelectTab(tab.id, false) });
}
document.getElementById('ResetPackageFormButton').addEventListener('click', () => {
	ResetPackageInputs();
});
document.getElementById('RemovePackageButton').addEventListener('click', () => {
	RemoveSelectedDoc();
});

document.getElementById('AssetArchiveVersion').addEventListener('change', event => {
	UpdateAssetData(event.target.id);
});
document.getElementById('ResetAssetFormButton').addEventListener('click', () => {
	ResetAssetInputs();
});
document.getElementById('RemoveAssetButton').addEventListener('click', () => {
	RemoveSelectedDoc();
});



// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------   Output column events   ---------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('LoadFromFile').addEventListener('click', () => {
	ClearAll();
	LoadFromFile();
});
document.getElementById('LoadFromGitDefault').addEventListener('click', event => {
	ClearAll();
	LoadFromGithub(event.target, 'default');
});
document.getElementById('LoadFromGitSimtrop').addEventListener('click', event => {
	ClearAll();
	LoadFromGithub(event.target, 'simtropolis');
});
document.getElementById('LoadFromGitZasco').addEventListener('click', event => {
	ClearAll();
	LoadFromGithub(event.target, 'zasco');
});
document.getElementById('CopyToClipButton').addEventListener('click', () => {
	navigator.clipboard.writeText(cm.getValue());
});
document.getElementById('SaveAsButton').addEventListener('click', () => {
	SaveAs();
});
document.getElementById('ClearAllButton').addEventListener('click', () => {
	ClearAll();
});



// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------   Keyboard shortcut events   ------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.addEventListener("keydown", function (e) {
	if ((e.metaKey || e.ctrlKey) && e.code === "KeyO") {
		LoadFromFile();
		e.preventDefault();
	}
}, false);
document.addEventListener("keydown", function (e) {
	if ((e.metaKey || e.ctrlKey) && e.code === "KeyS") {
		SaveAs();
		e.preventDefault();
	}
}, false);



// --------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------   Package tabs events   ---------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
for (const input of document.querySelectorAll('#PackagePropertiesForm .form-control, #PackageInfoForm .form-control, #IncludedAssetsForm .form-control')) {
	input.addEventListener('input', event => {
		ValidateInput(event.target.id);
		UpdatePackageData();
	});
};
document.getElementById('IsLocalVariant').addEventListener('click', () => {
	ToggleLocalVariant();
});
document.getElementById('ResetIncludedAssetButton').addEventListener('click', () => {
	ResetIncludedAssetForm();
});
document.getElementById('NewPackageAssetButton').addEventListener('click', () => {
	ResetIncludedAssetForm();
});



// --------------------------------------------------------------------------------------------------------------------
// ------------------------------------------   Package Variant tab events   ------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
for (const input of document.querySelectorAll('#VariantDependencies, #VariantAssetId, #VariantAssetInclude, #VariantAssetExclude')) {
	input.addEventListener('input', event => {
		//ValidateInput(event.target.id);
		UpdateVariantData(event.target);
	});
};
document.getElementById('ResetUpperVariantFormButton').addEventListener('click', () => {
	ResetVariantHeaderForm();
});
document.getElementById('ResetLowerVariantFormButton').addEventListener('click', () => {
	ResetVariantAssetForm();
});
document.getElementById('RemoveVariantButton').addEventListener('click', () => {
	RemoveVariant();
});
document.getElementById('RemoveAssetFromVariantButton').addEventListener('click', () => {
	RemoveAssetFromVariant();
});
document.getElementById('VariantAddKeyValueBtn').addEventListener('click', () => {
	let vIdx = document.getElementById('VariantKeyValuesContainer').childElementCount - 1;
	let vKey = document.getElementById('VariantName').value;
	let vValue = document.getElementById('VariantValue').value;
	CreateVariantKeyValueElements(vIdx, vKey, vValue);
	AddVariantKeyValueSet(vKey, vValue);
});



// --------------------------------------------------------------------------------------------------------------------
// ------------------------------------------   Asset Properties tab events   -----------------------------------------
// --------------------------------------------------------------------------------------------------------------------
for (const input of document.querySelectorAll('#AssetPropertiesForm input')) {
	input.addEventListener('input', event => {
		if (event.target.id === 'AssetLastModifiedText') {
			// Convert UTC text pasted into the input box for to a valid datetime to populate the datetime picker.
			var inputValue = document.getElementById('AssetLastModifiedText').value.replaceAll('"', '');
			try {
				var newDate = new Date(inputValue).toISOString().slice(0, 19);
				document.getElementById('AssetLastModified').value = newDate;
			} catch (e) {
				console.log(e);
			}
		}

		ValidateInput(event.target.id);
		UpdateAssetData();
	});
}



// --------------------------------------------------------------------------------------------------------------------
// -------------------------------------------   Preferences dialog events   ------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('OpenPreferencesButton').addEventListener('click', () => {
	document.getElementById('AllowPartialPackages').checked = localStorage.getItem('allow-partial-packages');

	preferencesDialog.show();
});
document.getElementById('AllowPartialPackages').addEventListener('click', () => {
	localStorage.setItem('allow-partial-packages', document.getElementById('AllowPartialPackages').checked);
});
document.getElementById('PreferStChannelFilenames').addEventListener('click', () => {
	localStorage.setItem('use-st-channel-filenames', document.getElementById('PreferStChannelFilenames').checked);
});