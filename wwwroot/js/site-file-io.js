/**
 * Save YAML content to disk.
 */
function SaveAs() {
	var bb = new Blob([cm.getValue()], { type: 'application/yaml' });
	var tmp = document.createElement('a');
	var fileName;

	if (yamlData[0] == null) {
		fileName = "document.yaml";
	}
	//This will be filled in as the file was loaded from Github, so fileName is already in compliance with st-channel name (if appropriate)
	else if (document.getElementById('YamlFileName').textContent !== '') {
		fileName = document.getElementById('YamlFileName').textContent;
	}

	else {
		if (localStorage.getItem('use-st-channel-filenames') === 'true') {
			var pkg = GetDocument('p', 0);
			if (Object.hasOwn(pkg.info, 'website')) {
				fileName = pkg.info.website.substring(45, pkg.info.website.indexOf('-'));
			}
			else if (Object.hasOwn(pkg.info, 'websites')) {
				fileName = pkg.info.websites[0].substring(45, pkg.info.websites[0].indexOf('-'));
			}
			fileName = fileName + '-' + pkg.name + pkg.assetId + '.yaml';
		}
		else {
			fileName = (IsPackage(yamlData[0]) ? yamlData[0].name : yamlData[0].assetId) + '.yaml';
		}

	}
	tmp.download = fileName;
	tmp.href = window.URL.createObjectURL(bb);
	tmp.click();
	tmp.remove();
}


/**
 * Load YAML content from a local file.
 */
function LoadFromFile() {
	var tmp = document.createElement("input")
	tmp.type = 'file'
	tmp.style.display = 'none'
	tmp.onchange = function (e) {
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		document.getElementById('YamlFileName').textContent = file.name
		var reader = new FileReader();
		reader.onload = function (e) {
			var contents = e.target.result;
			cm.setValue(contents);
			tmp.remove();
		}
		reader.readAsText(file);
	}
	tmp.click();
}


/**
 * Load YAML content from a Github file tree.
 * @param {any} srcElem Source element this function is being called from.
 *
 * If the element is `a` then this is triggered from the open menu or the breadcrumb menu and we want to navigate to the base folder of the Github files; if the element is `BUTTON` then its being triggered from a button click in the modal dialog and we want to navigate to a subfolder of the Github files. Basically, links go to the root folder level, buttons go to a subfolder level.
 * @param {any} channel Name of the channel to fetch data from, e.g. 'default' or 'zasco' or 'simtropolis'
 */
async function LoadFromGithub(srcElem, channel) {
	var crumbNav = document.getElementById('ChannelBreadcrumb');
	var level = (srcElem.tagName === 'A') ? 1 : 2;

	//Set the base srcUrl and update the breadcrumb menu.
	if (level === 1) {
		switch (channel.toLowerCase()) {
			case 'default':
				srcUrl = 'https://api.github.com/repos/memo33/sc4pac/git/trees/a58cd015bf2cd9909de87aa71a1643e47fc08256';
				break;
			case 'simtropolis':
				srcUrl = 'https://api.github.com/repos/sebamarynissen/simtropolis-channel/git/trees/01c9e940e0bbfa704a8500f1a2aeba472f9664e9';
				break;
			case 'zasco':
				srcUrl = 'https://api.github.com/repos/Zasco/sc4pac-channel/git/trees/ad3f15a09bf296df6ef87be2175542f1ee671407';
				break;
		}
		if (srcElem.textContent !== 'Root') {
			loadFileDialog.querySelector('.modal-title').textContent = srcElem.innerHTML;
		}
		if (crumbNav.children.length > 1) {
			crumbNav.lastElementChild.remove();
			crumbNav.firstElementChild.firstElementChild.remove(); //remove the <a> link
			crumbNav.firstElementChild.textContent = 'Root';
			crumbNav.firstElementChild.className = 'breadcrumb-item active'
		}
	}
	else {
		srcUrl = srcElem.value;

		var prevCrumb = crumbNav.firstElementChild
		prevCrumb.className = 'breadcrumb-item';
		prevCrumb.textContent = '';

		let newLink = document.createElement('a');
		newLink.href = '#';
		newLink.textContent = 'Root';
		newLink.addEventListener('click', function () { LoadFromGithub(this, channel); });
		prevCrumb.appendChild(newLink);

		let newCrumb = document.createElement('li');
		newCrumb.className = 'breadcrumb-item active';
		newCrumb.textContent = srcElem.textContent;
		crumbNav.appendChild(newCrumb);
	}


	fetch(srcUrl)
		.then(response => response.json())
		.then(data => {
			let listDiv = loadFileDialog.querySelector('.list-group');
			listDiv.textContent = '';
			data.tree
				.filter((obj) => obj.path.charAt(0) !== '.')
				.forEach(obj => {
					let btn = document.createElement('button');
					btn.className = 'list-group-item list-group-item-action';
					btn.textContent = obj.path;
					btn.value = obj.url;
					if (level === 1) {
						btn.addEventListener('click', function () { LoadFromGithub(this, channel); });
					} else {
						btn.addEventListener('click', function () { GetContent(this.value, obj.path); });
					}

					listDiv.appendChild(btn);
				});
		})
		.catch(error => console.error('Error fetching the tree data:', error));

	function GetContent(url, fileName) {
		fetch(url)
			.then(response => response.json())
			.then(data => {
				document.getElementById('YamlFileName').textContent = fileName;
				cm.setValue(DecodeBase64Unicode(data.content));
			})
			.catch(error => console.error('Error fetching the tree data:', error));

		//Hide the modal display
		var modal = bootstrap.Modal.getInstance(loadFileDialog)
		modal.hide();
	}

	function DecodeBase64Unicode(base64) {
		const binaryString = atob(base64);
		const unicodeString = decodeURIComponent(
			binaryString
				.split('')
				.map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
				.join('')
		);
		return unicodeString;
	}
}