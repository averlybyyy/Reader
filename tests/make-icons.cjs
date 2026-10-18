const path=require('node:path');
const sharp=require(path.join(process.env.READER_DEPENDENCIES||'..\node_modules','sharp'));
Promise.all([[192,'icon-192'],[512,'icon-512'],[180,'apple-touch-icon']].map(([size,name])=>sharp('icons/paw.svg').resize(size,size).png().toFile('icons/'+name+'.png'))).then(()=>console.log('Icons generated'));
