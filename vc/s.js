const path = require('path')
const fs = require('fs')

require('dotenv').config();

let album = {
	name: "Ashlyn",
	artist: "Ashe",

	year: 2021,

	cover: "C:\\Users\\Douglas.DESKTOP-5U87SPH\\AppData\\Roaming\\ymd\\temp\\https___images.genius.com_fdb58c2930f130eff9e33f490d8b934c.1000x1000x1.png",
	genre: "Pop",

	tracks: [
		{
			title: "Till Forever Falls Apart",
			artist: ["Ashe", "FINNEAS"],
			yt_url: ""
		},
		{
			title: "I'm Fine",
			yt_url: ""
		},
		{
			title: "Love Is Not Enough",
			yt_url: ""
		},
		{
			title: "When I'm Older",
			yt_url: ""
		},
		{
			title: "Me Without You",
			yt_url: "https://www.youtube.com/watch?v=-hQd87pyTxU"
		},
		{
			title: "Save Myself",
			yt_url: ""
		},
		{
			title: "Taylor",
			yt_url: ""
		},
		{
			title: "Not Mad Anymore",
			yt_url: ""
		},
		{
			title: "Always",
			yt_url: ""
		},
		{
			title: "Moral of the Story",
			yt_url: ""
		},
		{
			title: "Serial Monogamist",
			yt_url: ""
		},
		{
			title: "Ryne's Song",
			yt_url: ""
		},
		{
			title: "Kansas",
			yt_url: ""
		},
		{
			title: "Moral of the Story (Remix)",
			artist: ["Ashe", "Niall Horan"],
			yt_url: ""
		}
	]
}

const YAML = require('yaml')

//const album_yaml = YAML.stringify(album)

//console.log(album_yaml)
//fs.writeFileSync('album.yaml', album_yaml)

album = fs.readFileSync("album.yaml", 'utf8')
album = YAML.parse(album)

console.log(album)