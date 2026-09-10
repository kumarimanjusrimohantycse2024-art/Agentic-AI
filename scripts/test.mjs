import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('.sites-runtime/tests',{recursive:true});
await build({entryPoints:['tests/screening.test.ts','tests/semantic-provider.test.ts'],bundle:true,platform:'node',format:'esm',outdir:'.sites-runtime/tests',outExtension:{'.js':'.mjs'}});
const r=spawnSync(process.execPath,['--test','.sites-runtime/tests/screening.test.mjs','.sites-runtime/tests/semantic-provider.test.mjs'],{stdio:'inherit'});process.exitCode=r.status||0;
