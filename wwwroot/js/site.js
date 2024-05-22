// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Initialize required items (these are run as top-level statements)
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
const packages = FetchSc4pacData();
const sc4edata = FetchSc4EvermoreData();
console.log(sc4edata);

const cm = document.querySelector('.CodeMirror').CodeMirror;





async function FetchSc4pacData() {
	const request = new Request('https://memo33.github.io/sc4pac/channel/sc4pac-channel-contents.json');
	const response = await fetch(request);
	return await response.json();
}
async function FetchSc4EvermoreData() {
	const request = new Request('https://www.sc4evermore.com/latest-modified-downloads.php');
	const response = await fetch(request);
	return await response.json();
}




function UpdatePkgItem(itemName) {
	var inputElement = document.getElementById("Package" + itemName);
	var inputText = inputElement.value;
	if (itemName === 'Group' || itemName === 'Name' || itemName === 'AssetID') {
		inputText = inputText.toLowerCase().replaceAll(' ', '-').replace(new RegExp('[^a-zA-Z0-9-]'), '');
	}


	//Special case for Description: it's multiline text while all others are single line
	if (itemName === 'Description') {
		var rgx = new RegExp('>(.|\n)*(?=\n  author:)');
		var newValue = '>\n    ' + inputText.replaceAll('\n', '\n    ');
	}

	//Special case for items entered as an array: parse the multiline into multiple list items
	else if (['Include', 'Exclude', 'Images'].includes(itemName)) {
		switch (itemName) {
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
		var newValue = "";
		if (itemlist.at(-1) === '') {
			itemlist.pop();
		}
		
		itemlist.forEach((item) => {
			newValue = newValue + '\n  - "' + item.trim() + '"'
		});
		//console.log(imagelist.length);
		//console.log(newValue);
	}

	//Default case for other inputs
	else {
		var rgx = new RegExp(itemName.toLowerCase() + ': "(.*)"');
		newValue = itemName.toLowerCase() + ': ' + '"' + inputText + '"'
	}
	//console.log(rgx.test(cm.getValue()))
	//console.log(itemName.toLowerCase() + " _ " +  cm.getValue().search(rgx));
	//console.log(newValue);

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

function SetYamlText() {
	document.getElementById('YamlText').innerHTML = cm.getValue();
	alert("updated!");
}