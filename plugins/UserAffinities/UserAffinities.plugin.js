/**
 * @name UserAffinities
 * @description Shows user affinity scores in user popouts and user profile.
 * @version 1.0.0
 * @author ItMeSarah
 * @authorLink https://github.com/ItMeSarah/ItMeSarah.github.io
 * @invite 7kzb9h27nR
 * @website https://itmesarah.github.io/
 */

/**
 * Finds a value, subobject, or array from a tree that matches a specific filter.
 * @param {object} tree Tree that should be walked
 * @param {callable} searchFilter Filter to check against each object and subobject
 * @param {object} options Additional options to customize the search
 * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
 * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
 */
function findInTree(tree, searchFilter, {walkable = null, ignore = []} = {}) {
    if (typeof searchFilter === "string") {
        if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
    }
    else if (searchFilter(tree)) {
        return tree;
    }

    if (typeof tree !== "object" || tree == null) return undefined;

    let tempReturn;
    if (Array.isArray(tree)) {
        for (const value of tree) {
            tempReturn = findInTree(value, searchFilter, {walkable, ignore});
            if (typeof tempReturn != "undefined") return tempReturn;
        }
    }
    else {
        const toWalk = walkable == null ? Object.keys(tree) : walkable;
        for (const key of toWalk) {
            if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
            tempReturn = findInTree(tree[key], searchFilter, {walkable, ignore});
            if (typeof tempReturn != "undefined") return tempReturn;
        }
    }
    return tempReturn;
}

const AffinityStore = BdApi.Webpack.getModule(m => m.getUserAffinities);
const ConsentStore = BdApi.Webpack.getStore("ConsentStore");
const updateConsents = BdApi.Webpack.getByStrings("SETTINGS_CONSENT", "grant", {searchExports: true});

module.exports = class UserAffinities { 
    start() {
        BdApi.DOM.addStyle("UserAffinities", `.affinity-value {
            color: var(--text-normal);
        }
        
        .affinity-label {
            color: var(--text-normal);
            font-weight: 700;
        }
        
        .affinity-container {
            user-select: text;
        }`);

        if (!ConsentStore.hasConsented("personalization")) {
            BdApi.UI.showConfirmationModal("Incorrect Setting", "In order for this plugin to work, you must enable Discord personalization data collection. Do you want to enable it now?", {
                confirmText: "Yes",
                cancelText: "Not Now",
                onConfirm: () => updateConsents(["personalization"])
            });
        }
    }

    stop() {
        BdApi.DOM.removeStyle("UserAffinities");
    }

    observer(e) {
        if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
        const element = e.addedNodes[0];

        const popout = element.querySelector(`[class*="userPopout-"],[class*="userPopoutOuter-"]`) ?? element;
        if (popout && popout.matches(`[class*="userPopout-"],[class*="userPopoutOuter-"]`)) {
            const userId = findInTree(BdApi.ReactUtils.getInternalInstance(popout), m => m?.user?.id || m?.userId || m?.message?.author?.id, {walkable: ["memoizedProps", "return"]});
            const id = userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id;

            // Check the set to see if this user has an affinity
            const affinityUsers = AffinityStore.getUserAffinitiesUserIds();
            if (!affinityUsers.has(id)) return;

            const affinities = AffinityStore.getUserAffinities();
            const affinity = affinities.find(a => a.user_id === id);

            const affinityLabel = document.createElement("span");
            affinityLabel.classList.add("affinity-label");
            affinityLabel.textContent = "Affinity Score: ";

            const affinityValue = document.createElement("span");
            affinityValue.classList.add("affinity-value");
            affinityValue.textContent = Math.round(affinity.affinity);

            const affinityWrap = document.createElement("div");
            affinityWrap.classList.add("affinity-container");
            affinityWrap.append(affinityLabel);
            affinityWrap.append(affinityValue);

            const wrapper = popout.querySelector(`[class*="userText-"]`);
            wrapper.append(affinityWrap);
        }




        const modal = element.querySelector(`[class*="root-8LYsGj"]`);
        if (modal) {
            const userId = findInTree(BdApi.ReactUtils.getInternalInstance(modal), m => m?.user?.id || m?.userId || m?.message?.author?.id, {walkable: ["memoizedProps", "return"]});
            const id = userId?.userId ?? userId?.user?.id ?? userId?.message?.author?.id;

            const affinityUsers = AffinityStore.getUserAffinitiesUserIds();
            if (!affinityUsers.has(id)) return;

            const affinities = AffinityStore.getUserAffinities();
            const affinity = affinities.find(a => a.user_id === id);

            const affinityLabel = document.createElement("span");
            affinityLabel.classList.add("affinity-label");
            affinityLabel.textContent = "Affinity Score: ";

            const affinityValue = document.createElement("span");
            affinityValue .classList.add("affinity-value");
            affinityValue .textContent = Math.round(affinity.affinity);

            const affinityWrap = document.createElement("div");
            affinityWrap.classList.add("affinity-container");
            affinityWrap.append(affinityLabel);
            affinityWrap.append(affinityValue);

            const wrapper = modal.querySelector(`[class*="container-3g15px"]`);
            wrapper.append(affinityWrap);
        }
    }
}