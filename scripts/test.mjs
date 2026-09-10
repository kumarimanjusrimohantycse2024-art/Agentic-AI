import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('.sites-runtime/tests',{recursive:true});
await build({entryPoints:['tests/screening.test.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/tests/screening.mjs'});
const r=spawnSync(process.execPath,['--test','.sites-runtime/tests/screening.mjs'],{stdio:'inherit'});process.exitCode=r.status||0;
