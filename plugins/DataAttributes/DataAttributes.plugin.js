/**
 * @name DataAttributes
 * @description Adds helpful data attributes to different elements. Useful for themes.
 * @version 1.0.3
 * @author Zerebos
 */

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
			const popout = element.querySelector(`[class*="userPopoutOuter-"]`) ?? element;
			if (popout && popout.matches(`[class*="userPopout-"],[class*="userPopoutOuter-"]`)) {
				const userId = findInTree(BdApi.ReactUtils.getInternalInstance(popout), m => m?.user?.id || m?.userId || m?.message?.author?.id, {
					walkable: ["memoizedProps", "return"]
				});
				popout.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
				popout.id = "userpopout";
			}
}
		if (settings.modals) {
		const modal = element.querySelector(`[class*="root-8LYsGj"],[class*="root-2uUafN"]`);
		if (modal) {
			const userId = findInTree(BdApi.ReactUtils.getInternalInstance(modal), m => m?.user?.id || m?.userId || m?.message?.author?.id, {
				walkable: ["memoizedProps", "return"]
			});
			modal.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
			modal.id = "usermodal";
			}
}
		if (settings.usernames) {
        const usernames = element.querySelectorAll(`[class*="username-"]`);
        if (usernames.length) {
            for (const username of usernames) {
                const userId = findInTree(BdApi.ReactUtils.getInternalInstance(username), m => m?.user?.id || m?.userId || m?.message?.author?.id, {walkable: ["memoizedProps", "return"]});
                username.classList.add(`id-${userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id}`);
                username.id = "username";
            }
        }
}

		if (settings.messages) {
		const messages = element.querySelectorAll(`[class*="message-2CShn3"]`);
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