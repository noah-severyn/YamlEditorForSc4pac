// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------   General event handlers   --------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('NewPackageButton').addEventListener('click', () => {
	ResetPackageInputs();
	SelectTab('PackagePropertiesTab');
	EnablePackageTabs();
});
document.getElementById('NewAssetButton').addEventListener('click', () => {
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
document.getElementById('AddPackageButton').addEventListener('click', () => {
	AddPackage();
});
document.getElementById('RemovePackageButton').addEventListener('click', () => {
	RemoveSelectedDoc();
});

document.getElementById('AssetArchiveVersion').addEventListener('change', event => {
	UpdateAssetItem(event.target.id);
});
document.getElementById('ResetAssetFormButton').addEventListener('click', () => {
	ResetAssetInputs();
});
document.getElementById('AddAssetButton').addEventListener('click', () => {
	AddAsset();
});
document.getElementById('RemoveAssetButton').addEventListener('click', () => {
	RemoveSelectedDoc();
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
// -----------------------------------------   Package Properties tab events   ----------------------------------------
// --------------------------------------------------------------------------------------------------------------------
for (const input of document.querySelectorAll('#PackagePropertiesForm .form-control')) {
	input.addEventListener('input', event => {
		UpdatePackageData(event.target.id);
	});
}
document.getElementById('PacPackageList').addEventListener('change', event => {
	PackageAddDependency(event.target);
});
document.getElementById('LocalPackageList').addEventListener('change', event => {
	PackageAddDependency(event.target);
});



// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------   Package Info tab events   -------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('IsMultipleWebsites').addEventListener('change', () => {
	ToggleMultipleWebsites();
});
for (const input of document.querySelectorAll('#PackageInfoForm .form-control')) {
	input.addEventListener('input', event => {
		UpdatePackageData(event.target.id);
	});
}



// --------------------------------------------------------------------------------------------------------------------
// -------------------------------------------   Included Asset tab events   ------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('SelectLocalPackageAssets').addEventListener('change', event => {
	SetIncludedAssetId(event.target);
});
document.getElementById('SelectPacPackageAssets').addEventListener('change', event => {
	SetIncludedAssetId(event.target);
});
document.getElementById('PackageAssetInclude').addEventListener('change', event => {
	UpdatePackageData(event.target.id);
});
document.getElementById('PackageAssetExclude').addEventListener('change', event => {
	UpdatePackageData(event.target.id);
});
document.getElementById('ResetIncludedAssetButton').addEventListener('change', () => {
	ResetIncludedAssetInputs();
});
document.getElementById('AddPackageAssetButton').addEventListener('change', () => {
	AddIncludedAsset();
});



// --------------------------------------------------------------------------------------------------------------------
// ------------------------------------------   Package Variant tab events   ------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
for (const input of document.querySelectorAll('#VariantKey, #VariantValue, #VariantDescription, #VariantsPacPackageList, #VariantsLocalPackageList')) {
	input.addEventListener('input', event => {
		UpdateVariantData(event.target);
	});
}
for (const input of document.querySelectorAll('#VariantsPacAssetList, #VariantsLocalAssetList, #VariantInclude, #VariantExclude')) {
	input.addEventListener('change', event => {
		UpdateVariantData(event.target);
	});
}
document.getElementById('ResetVariantFormButton').addEventListener('click', () => {
	ResetVariantInputs();
});
document.getElementById('AddAssetToVariantButton').addEventListener('click', () => {
	AddAssetToVariant();
});
document.getElementById('RemoveAssetFromVariantButton').addEventListener('click', () => {
	RemoveAssetFromVariant();
});
document.getElementById('AddVariantButton').addEventListener('click', () => {
	AddNewVariant();
});
document.getElementById('RemoveVariantButton').addEventListener('click', () => {
	RemoveVariant();
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

		UpdateAssetItem(event.target.id);
	});
}



// --------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------   Output column events   ---------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
document.getElementById('LoadFromFile').addEventListener('click', () => {
	LoadFromFile();
});
document.getElementById('LoadFromGitDefault').addEventListener('click', event => {
	LoadFromGithub(event.target, 'default');
});
document.getElementById('LoadFromGitSimtrop').addEventListener('click', event => {
	LoadFromGithub(event.target, 'simtropolis');
});
document.getElementById('LoadFromGitZasco').addEventListener('click', event => {
	LoadFromGithub(event.target, 'zasco');
});
document.getElementById('CopyToClipButton').addEventListener('click', () => {
	CopyToClipboard();
});
document.getElementById('SaveAsButton').addEventListener('click', () => {
	SaveAs();
});
document.getElementById('ClearAllButton').addEventListener('click', () => {
	ClearAll();
});



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