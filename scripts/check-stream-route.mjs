import fs from 'fs';

const route = fs.readFileSync('D:/cms.geduconnect.org/src/api/stream/routes/stream.js', 'utf8');
console.log('Stream route:', route);

const controller = fs.readFileSync('D:/cms.geduconnect.org/src/api/stream/controllers/stream.js', 'utf8');
console.log('Stream controller:', controller);
