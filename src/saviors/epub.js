const { html, stripIndents } = require('common-tags')
const Epub = require('epub-gen');
const Path = require('path')
const fs = require('fs')
const os = require('os')

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
    fs.writeFile(Path.join(os.homedir(), 'my-app/lyrics/temp/toc.xhtml'), toc, err => {
      if(err) console.log(err)
      res(Path.join(os.homedir(), 'my-app/lyrics/temp/toc.xhtml'));
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
  `;
  
  return new Promise((res, rej) => {
    fs.writeFile(Path.join(os.homedir(), 'my-app/lyrics/temp/toc.ncx'), ncx, err => {
      if(err) console.log(err)
      res(Path.join(os.homedir(), 'my-app/lyrics/temp/toc.ncx'));
    })
  })
}

async function createEbookWithLyrics(albumData, whereSave) {
  console.log('here1')
  const { name, artist, lyrics } = albumData

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

  for(let oneLyric of lyrics) {

    let { title, artist, lyric } = oneLyric;

    let filename = '';

    if(title) {
      filename = title.toLowerCase().split(' ').join('-')

    } else {
      filename = 'undefined'
      console.log(title)
      console.log(lyrics.indexOf(oneLyric) + " not have title.")
    }

    console.log('here 2')

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
  console.log('here 3')

  const path = Path.join(whereSave, `${name} - ${artist}.epub`)
  console.log(path)
  new Epub(epubData, path);
}

module.exports = createEbookWithLyrics;