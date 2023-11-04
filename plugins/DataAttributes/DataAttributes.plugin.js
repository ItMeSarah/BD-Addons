/**
 * @name DataAttributes
 * @description Adds helpful data attributes to different elements. Useful for themes.
 * @version 1.0.4
 * @author Zerebos
 */
 
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.MoveFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)));
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

function findInTree(tree, searchFilter, {
	walkable = null,
	ignore = []
} = {}) {
	if (typeof searchFilter === "string") {
		if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
	} else if (searchFilter(tree)) {
		return tree;
	}
	if (typeof tree !== "object" || tree == null) return undefined;
	let tempReturn;
	if (Array.isArray(tree)) {
		for (const value of tree) {
			tempReturn = findInTree(value, searchFilter, {
				walkable,
				ignore
			});
			if (typeof tempReturn != "undefined") return tempReturn;
		}
	} else {
		const toWalk = walkable == null ? Object.keys(tree) : walkable;
		for (const key of toWalk) {
			if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
			tempReturn = findInTree(tree[key], searchFilter, {
				walkable,
				ignore
			});
			if (typeof tempReturn != "undefined") return tempReturn;
		}
	}
	return tempReturn;
};

const settings = ZLibrary.Utilities.loadSettings("DataAttributes", {
  popouts: true,
  modals: true,
  usernames: true,
  messages: true,
});
module.exports = class DataAttributes {
	start() {}
	stop() {}
	getSettingsPanel() {
const S = ZLibrary.Settings;
return S.SettingPanel.build((id, value) => {
  settings[id.toLowerCase()] = value;
  ZLibrary.Utilities.saveSettings("DataAttributes", settings);
},
  new S.Switch("Popouts", "Add user ID & unique ID to popouts", settings.popouts),
  new S.Switch("Modals", "Add user ID & unique ID to modals", settings.modals),
    new S.Switch("Usernames", "Add user ID & unique ID to usernames", settings.usernames),
	  new S.Switch("Messages", "Add user ID & unique ID to messages", settings.messages),
);
}
	observer(e) {
		if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
		const element = e.addedNodes[0];
		if (settings.popouts) {
			const popout = element.querySelector(`[class*="userPopoutOuter_"]`) ?? element;
			if (popout && popout.matches(`[class*="userPopoutOuter_"]`)) {
				const userId = findInTree(BdApi.ReactUtils.getInternalInstance(popout), m => m?.user?.id || m?.userId || m?.message?.author?.id, {
					walkable: ["memoizedProps", "return"]
				});
				popout.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
				popout.id = "userpopout";
			}
}
		if (settings.modals) {
		const modal = element.querySelector(`[class*="root_ba16f0"]`);
		if (modal) {
			const userId = findInTree(BdApi.ReactUtils.getInternalInstance(modal), m => m?.user?.id || m?.userId || m?.message?.author?.id, {
				walkable: ["memoizedProps", "return"]
			});
			modal.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
			modal.id = "usermodal";
			}
}
		if (settings.usernames) {
        const usernames = element.querySelectorAll(`[class*="username_"], [class*="heading-lg-semibold_"], [class*="nickname_"], [class*="userTagUsernameBase_"], [class*="discriminator_"]`);
        if (usernames.length) {
            for (const username of usernames) {
                const userId = findInTree(BdApi.ReactUtils.getInternalInstance(username), m => m?.user?.id || m?.userId || m?.message?.author?.id, {walkable: ["memoizedProps", "return"]});
                username.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
                username.id = "username";
            }
        }
}

		if (settings.messages) {
		const messages = element.querySelectorAll(`[class*="message__80c10"]`);
		if (messages.length) {
			for (const message of messages) {
				const userId = findInTree(BdApi.ReactUtils.getInternalInstance(message), m => m?.user?.id || m?.userId || m?.message?.author?.id, {walkable: ["memoizedProps", "return"]});
				message.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
				message.id = "messages";
				}
			}
		}
	}
}

/*@end@*/