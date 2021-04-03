const { html, stripIndents } = require('common-tags')
const Epub = require('epub-gen');
const fs = require('fs')

// list: [{ title: String , src: String}] -> includes the links data to paste...
// return: String -> path where saved the template...
function makeCustonToc(albumData, list) {
  const toc = html`
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
  <head>
      <title>${albumData.name}</title>
      <meta charset="UTF-8" />
      <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
  <body>
    <h1 class="h1">"${albumData.name}" lyrics:</h1>
    <nav id="toc" epub:type="toc">
      
      <ul>
        <li>
          <a href="toc.xhtml">Index</a>
          <ol>
            ${list.map( link => `<li><a href="${link.src}">${link.title}</a></li>`)}
          </ol>
        </li>
      </ul>
    </nav>
  </body>
  </html>
  `
  //console.log(toc)
  return new Promise((res, rej) => {
    fs.writeFile('C:/Users/yaquelin ramirez/Proyectos/CLI/temp/toc.xhtml', toc, err => {
      if(err) console.log(err)
      res('C:/Users/yaquelin ramirez/Proyectos/CLI/temp/toc.xhtml');
    })
  })
}

function makeCustomNCX(albumData, list) {
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
  <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
      <head>
          <meta name="dtb:uid" content="b047ab87-083a-4a27-9e2a-f78b3c58390d" />
          <meta name="dtb:generator" content="epub-gen"/>
          <meta name="dtb:depth" content="1"/>
          <meta name="dtb:totalPageCount" content="0"/>
          <meta name="dtb:maxPageNumber" content="0"/>
      </head>
      <docTitle>
          <text>${albumData.name}</text>
      </docTitle>
      <docAuthor>
          <text>${albumData.artist}</text>
      </docAuthor>
      <navMap>
          
          <navPoint id="toc" playOrder="0" class="chapter">
              <navLabel>
                  <text>List of Songs from "${albumData.name}" album:</text>
              </navLabel>
              <content src="toc.xhtml"/>

              ${list.map( (link, idx) => `
                <navPoint id="content_${idx}_item_${idx}" playOrder="${idx + 1}" class="chapter">
                  <navLabel><text>${idx + 1}. ${link.title}</text></navLabel>
                  <content src="${link.src}"/>
                </navPoint>`)
              }
          </navPoint>
      </navMap>
  </ncx>
  `
  console.log(ncx)
  return new Promise((res, rej) => {
    fs.writeFile('C:/Users/yaquelin ramirez/Proyectos/CLI/temp/toc.ncx', ncx, err => {
      if(err) console.log(err)
      res('C:/Users/yaquelin ramirez/Proyectos/CLI/temp/toc.ncx');
    })
  })
}

async function createEbookWithLyrics(albumData) {
  const { name, artist, listOfLyrics } = albumData

  const epubData = {
    title: name,
    author: artist,
    tocTitle: 'List of Songs from ' + name + ' album:',
    content: [],
    css:  '.text-centered { text-align: center; } ' +
          '.lyric-title { margin: 5px auto }' +
          '.artist { margin: 0px auto; font-family: Serif; }',
    //customHtmlTocTemplatePath: '/Users/yaquelin ramirez/Proyectos/CLI/lyrics/toc.xhtml'
  }

  const listOfLinks = []

  for(let lyricData of listOfLyrics) {
    let { title, artist, lyric } = lyricData;

    const filename = title.toLowerCase().replace(' ', '-')

    const data = `
      <div class="text-centered">
        <h2 class="lyric-title">${title}</h2>
        <h3 class="artist">by ${artist}</h3>
        <p>${lyric.split('\n').join('</br>')}</p>
      <div>`;

    epubData.content.push({ data, filename });
    listOfLinks.push({title, src: `${filename}.xhtml`})
  }

  epubData.customNcxTocTemplatePath = await makeCustomNCX(albumData, listOfLinks)
  epubData.customHtmlTocTemplatePath = await makeCustonToc(albumData, listOfLinks)

  new Epub(epubData, `/Users/yaquelin ramirez/Proyectos/CLI/lyrics/${name} - ${artist}.epub`);
}

module.exports = createEbookWithLyrics;

/*
(async () => {

  const albumData = 
  {
    name: 'Manic',
    artist: 'Halsey',
   
    listOfLyrics: [
      { title: 'Castle', artist: 'Halsey', 
        lyric: stripIndents`Sick of all these people talking, sick of all this noise
          Tired of all these cameras flashing, sick of being poised
          Now my neck is open wide, begging for a fist around it
          Already choking on my pride, so there's no use crying about it

          I'm headed straight for the castle
          They wanna make me their queen
          And there's an old man sitting on the throne that's
          Saying that I probably shouldn't be so mean
          I'm headed straight for the castle
          They’ve got the kingdom locked up
          And there's an old man sitting on the throne that's
          Saying I should probably keep my pretty mouth shut
          Straight for the castle

          Oh, all these minutes passing, sick of feeling used
          If you wanna break these walls down, you’re gonna get bruised
          Now my neck is open wide, begging for a fist around it
          Already choking on my pride, so there's no use crying about it

          Crying about it
          Crying about it
          Crying about it

          I'm headed straight for the castle
          They wanna make me their queen
          And there's an old man sitting on the throne that's
          Saying that I probably shouldn't be so mean
          I'm headed straight for the castle
          They’ve got the kingdom locked up
          And there's an old man sitting on the throne that's
          Saying I should probably keep my pretty mouth shut
          Straight for the castle

          There's no use crying about it
          There's no use crying about it
          There's no use crying about it
          There's no use crying about it

          I'm headed straight for the castle
          They wanna make me their queen
          And there's an old man sitting on the throne that's
          Saying that I probably shouldn't be so mean
          I'm headed straight for the castle
          They’ve got the kingdom locked up
          And there's an old man sitting on the throne that's
          Saying I should probably keep my pretty mouth shut

          Straight for the castle
          They wanna make me their queen
          And there's an old man sitting on the throne that's
          Saying that I probably shouldn't be so mean
          I'm headed straight for the castle
          They’ve got the kingdom locked up
          And there's an old man sitting on the throne that's
          Saying I should probably keep my pretty mouth shut

          Straight for the castle`
      },
      { 
        title: 'New Americana', 
        artist: 'Halsey', 
        lyric: stripIndents`Cigarettes and tiny liquor bottles, just what you’d expect inside her new Balenciaga
          Bad romance, turned dreams into an empire
          Self-made success now she rose with Rockafellas

          Survival of the richest, the city’s ours until the fall
          They're Monaco and Hamptons bound but we don’t feel like outsiders at all

          We are the new Americana
          High on legal marijuana
          Raised on Biggie and Nirvana
          We are the new Americana

          Young James Dean, some say he looks just like his father, but he could never love somebody’s daughter
          Football team loved more than just the game so he vowed to be his husband at the altar

          Survival of the richest, the city’s ours until the fall
          They’re Monaco and Hamptons bound but we don’t feel like outsiders at all

          We are the new Americana
          High on legal marijuana
          Raised on Biggie and Nirvana
          We are the new Americana

          We know very well who we are, so we hold it down when summer starts
          What kind of dough have you been spending?
          What kind of bubblegum have you been blowing lately?

          We are the new Americana
          High on legal marijuana
          Raised on Biggie and Nirvana
          We are the new Americana
          We are the new Americana (we know very well)
          High on legal marijuana (who we are)
          Raised on Biggie and Nirvana (so we hold it down)
          We are the new Americana`
      },
      { 
        title: 'Drive', 
        artist: 'Halsey', 
        lyric: stripIndents`My hands wrapped around your stick shift
          Swerving on the 405, I can never keep my eyes off this
          My neck, the feeling of your soft lips
          Illuminated in the light, bouncing off the exit signs I missed

          All we do is drive
          All we do is think about the feelings that we hide
          All we do is sit in silence waiting for a sign
          Sick and full of pride
          All we do is drive

          And California never felt like home to me
          And California never felt like home
          And California never felt like home to me
          Until I had you on the open road and now we're singing

          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah

          Your laugh, echoes down the hallway
          Carves into my hollow chest, spreads over the emptiness
          It's bliss
          It's so simple but we can't stay
          Over analyze again, would it really kill you if we kissed

          All we do is drive
          All we do is think about the feelings that we hide
          All we do is sit in silence waiting for a sign
          Sick and full of pride
          All we do is drive

          And California never felt like home to me
          And California never felt like home
          And California never felt like home to me
          Until I had you on the open road and I was singing

          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah
          Ah, ah, ah, ah, ah`
      }
    ]
  }

  await createEbookWithLyrics(albumData)
})();*/