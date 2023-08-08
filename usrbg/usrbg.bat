rem/*
@node %0&exit/b&*/=0

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

	data.sort((a, b) => (a.uid > b.uid) ? 1 : -1)
	return data.map(a => `.id-${a.uid}:not(#messages, #username){--u:url(${a.img.replace("https://", "//").replace("http://", "//")});width: auto; height: auto;}\r\n`).join("");
}

async function main() {
    try {
        const rawJson = await downloadJson();
        const css = compile(rawJson);
        fs.writeFileSync("./usrbg.css", css.trim());
    }
    catch (err) { console.log(err) }
}

main();