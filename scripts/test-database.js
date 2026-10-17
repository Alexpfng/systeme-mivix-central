import { spawnSync } from 'node:child_process';

const run = (command, args) => spawnSync(command, args, {
  encoding: 'utf8',
  stdio: 'pipe',
});

const supabase = run('supabase', ['--version']);
if (supabase.error?.code === 'ENOENT') {
  console.error('Database tests NOT RUN: Supabase CLI is not installed.');
  console.error('Static fallback: npm run validate:sql');
  process.exit(2);
}

const docker = run('docker', ['info']);
if (docker.status !== 0) {
  console.error('Database tests NOT RUN: Docker is unavailable or its daemon is stopped.');
  console.error('Static fallback: npm run validate:sql');
  process.exit(2);
}

const result = run('supabase', ['test', 'db']);
process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
process.exit(result.status ?? 1);
