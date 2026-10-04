import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { basename, dirname, join } from 'node:path';

export type AtomicWriteFileHooks = {
	tempName?: (filePath: string) => string;
	writeTempFile?: (tempPath: string, contents: string) => Promise<void>;
	renameTempFile?: (tempPath: string, filePath: string) => Promise<void>;
};

export async function writeFileAtomically(
	filePath: string,
	contents: string,
	hooks: AtomicWriteFileHooks = {}
): Promise<void> {
	const dir = dirname(filePath);
	await mkdir(dir, { recursive: true });

	const tempPath = hooks.tempName?.(filePath) ?? join(dir, `.${basename(filePath)}.${process.pid}.${randomUUID()}.tmp`);
	const writeTempFile = hooks.writeTempFile ?? ((path, value) => writeFile(path, value, { flag: 'wx' }));
	const renameTempFile = hooks.renameTempFile ?? rename;

	try {
		await writeTempFile(tempPath, contents);
		await renameTempFile(tempPath, filePath);
	} catch (error) {
		await unlink(tempPath).catch((unlinkError: unknown) => {
			if ((unlinkError as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw unlinkError;
			}
		});
		throw error;
	}
}
