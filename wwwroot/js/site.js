// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize CodeMirror component
CodeMirror(document.querySelector('#editor'), {
	lineNumbers: true,
	tabSize: 2,
	lineWrapping: true,
	value:
`group: ""
name: ""
version: ""
subfolder: ""
dependencies: ""
assets:
include: ""
exclude: ""

info:
  summary: ""
  warning: ""
  conflicts: ""
  description: >
  author: ""
  images:
  website: ""`,
	mode: 'yaml'
});


const cm = document.querySelector('.CodeMirror').CodeMirror;


function UpdatePkgItem(itemName) {
	var inputText = document.getElementById("Package" + itemName).value;

	//Special case for Description because it's multiline text while all others are single line
	if (itemName === 'Description') {
		var rgx = new RegExp('>(.|\n)*(?=\n  author:)');
		var newValue = '>\n    ' + inputText.replaceAll('\n', '\n    ');
	} else {
		var rgx = new RegExp(itemName.toLowerCase() + ': "(.*)"');
		var newValue = itemName.toLowerCase() + ': ' + '"' + inputText + '"'
	}
	console.log(rgx.test(cm.getValue()))
	console.log(itemName.toLowerCase() + " _ " +  cm.getValue().search(rgx));
	console.log(newValue);

	cm.setValue(cm.getValue().replace(rgx, newValue));

	if (itemName === 'Name') {
		document.getElementById('FileName').innerHTML = inputText + '.yaml'
	}
}


function AddAnAsset() {
	//Add asset listing to end of file
	var url = document.getElementById('AssetURL').value;
	var id = document.getElementById('AssetID').value;
	var version = document.getElementById('AssetVersion').value;
	var modified = document.getElementById('AssetLastModified').value;
	var newAsset = '\r\n---\r\nassetId: "' + id + '"' +
		'\r\nurl: "' + url + '"' +
		'\r\nversion: "' + version + '"' +
		'\r\nlastModified: "' + modified + 'Z"';
	cm.setValue(cm.getValue() + newAsset);

	//Add this asset to the package asset list
	var currentContents = cm.getValue();
	var assetHeaderLocn = currentContents.indexOf('assets:');
	console.log(assetHeaderLocn);
	cm.setValue(
		currentContents.slice(0, assetHeaderLocn + 7) +
		'\r\n- assetId: "' + id + '"' +
		currentContents.slice(assetHeaderLocn + 7)
	);
}