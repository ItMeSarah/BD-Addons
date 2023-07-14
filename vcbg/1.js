const fs = require("fs");
const https = require("https");

async function downloadJson() {
    return new Promise(resolve => {
        https.get("https://raw.githubusercontent.com/Discord-Custom-Covers/usrbg/master/dist/usrbg.json", res => {
            let str = "";
            res.on("data", c => str += c)
            res.on("end", () => resolve(JSON.parse(str)));
        });
    });
}

function compile(data) {

    const createRule = (uids, rules) => `${uids.map(uid => `[data-selenium-video-tile="${uid}"] .background-L8lGH6`).join(",\n")}{${rules.join("")}}\r\n`

    const backgrounds = new Map(Object.entries({none: new Map, left: new Map, right: new Map}))

    for (let {orientation, img, uid} of data) {
        if (!orientation) orientation = "none";
        let parsedImage = img.startsWith("http") ? img : `//i.imgur.com/${img}.gif`;
        parsedImage = parsedImage.replace("https://", "//").replace("http://", "//");
        const map = backgrounds.get(orientation);
        const background = map.get(parsedImage);
        if (!background) map.set(parsedImage, [uid]);
        else background.push(uid);
    }

    const css = [...backgrounds].map(([orientation, map]) => {
        return [...map].map(([img, uids]) => {
            if (orientation === "none") return createRule(uids, [`--vcbg:url(${img})`])
            else return createRule(uids, [`--vcbg:url(${img});`])
        }).join("");
    }).join("");
const base = `/*VCBG Stuff*/
.background-L8lGH6{background: var(--vcbg);background-size:contain !important;}
.background-L8lGH6{--vcbg: url(https://wallpapercave.com/wp/wp5493870.jpg); /* Change this image to change the default image of people without vcbgs.*/
}
/*End VCBG Stuff*/\n`;
return base + css;
}

async function main() {
    try {
        const rawJson = await downloadJson();
        const css = compile(rawJson);
        fs.writeFileSync("./vcbg.css", css);
    }
    catch (err) { console.log(err) }
}

main();