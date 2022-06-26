const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const canvas = createCanvas(500, 500);
const ctx = canvas.getContext("2d");

const FILE_PATH = "./images";

const { face, body, background } = require("./traits.js");
const { NFTStorage, File } = require("nft.storage");
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhBNzQ3RjBFOEQ0ZjRhYjc0NkQ3Q0M2Q2I4QTA1NmQzMjBBRjA4YTEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0NjU4MDA1OTQ5MiwibmFtZSI6IldEVVQtTkZUIn0.W33rW2q_5XsE1jiFxjM6dbCZONJLpAgsnZKxgPpzZGk";
const client = new NFTStorage({ token: apiKey });

const saveImage = (canvas, index) => {
    const filename = `N${index.toString().padStart(3,0)}`;

    fs.writeFileSync(
        `${FILE_PATH}/_Final/${filename}.png`,
        canvas.toBuffer("image/png")
    );
    console.log(filename);
};

const create = async (t, i) => {
    const face = await loadImage(`${FILE_PATH}/Face/${t[0]}.png`);
    const body = await loadImage(`${FILE_PATH}/Body/${t[1]}.png`);
    const background = await loadImage(`${FILE_PATH}/Background/${t[2]}.png`);

    await ctx.drawImage(background, 0, 0, 500, 500);
    await ctx.drawImage(body, 0, 0, 500, 500);
    await ctx.drawImage(face, 175, 175, 150, 150);

    saveImage(canvas, i+1);

    await uploadMetaData(t, i+1); // metadata upload to IPFS
};
exports.create = create;

const getAttributes = (v, k) => {
    let attributes = {};
    let trait_type = "";
    let value = "";

    switch (k) {
        case 0:
            trait_type = "Face";
            value = face[v-1].name;
            break;
        
        case 1:
            trait_type = "Body";
            value = body[v-1].name;
            break;

        case 2:
            trait_type = "Background";
            value = background[v-1].name;
            break;

        default:
            trait_type = "";
            value = "";
    }

    attributes.trait_type = trait_type;
    attributes.value = value;

    return attributes;
};

const uploadMetaData = async (t, i) => {
    let metadata = {
        description: "WDUT::What do you think of my hairstyle? NFT",
        name: `WDUT-${i}`,
        type: "Collectable",
        image: "https://",
        attributes: []
    };

    for (let k = 0; k < 3; k++) {
        metadata.attributes.push(getAttributes(t[k], k));
    }
    const filename = `N${i.toString().padStart(3, 0)}`;
    
    metadata.image = new File(
        [await fs.promises.readFile(`${FILE_PATH}/_Final/${filename}.png`)],
        `${filename}.png`,
        { type: "image/png" }
    );

    const result = await client.store(metadata);
    console.log(result.url);
    saveMetadataUri(`${i}=${result.url}`);
};

const saveMetadataUri = (uri) => {
    const filename = `meta.txt`;
    fs.writeFileSync(`./${filename}`, uri + "\r\n", { flag: "a+" });
};

const readMetadataUri = async (index) => {
    const buffer = await fs.readFileSync(META_FILE);
    let tokenUri = "";

    let regexp = new RegExp("(\r?\n)?" + index + "=(.*)/metadata.json", "g");
    let result = buffer.toString().match(regexp);

    if (result != null) {
        tokenUri = result[0].slice(result[0].indexOf("=") + 1);
        console.log(tokenUri);
    }

    return tokenUri;
};
