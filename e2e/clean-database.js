import fs from 'node:fs';
import path from 'node:path';

const database = path.resolve('backend/data/e2e-test.db');
for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${database}${suffix}`, { force: true });
