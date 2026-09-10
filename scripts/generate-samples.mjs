import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {zipSync,strToU8} from 'fflate';
await mkdir('.sites-runtime',{recursive:true});
await build({entryPoints:['lib/demo.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/demo.mjs'});
const {demoSources,demoCandidates}=await import('../.sites-runtime/demo.mjs');
await mkdir('samples/applications',{recursive:true});
const zipped={};for(const c of demoCandidates){const filename=c.name.replaceAll(' ','_')+'.txt';await writeFile('samples/applications/'+filename,demoSources[c.id]+'\n');zipped[filename]=strToU8(demoSources[c.id]+'\n');}
await writeFile('public/sample-applications.zip',zipSync(zipped));
