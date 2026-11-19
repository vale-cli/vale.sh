// The tools' modules import each other without an extension, as the bundler
// allows. Node needs one, so a bare relative import falls back to its .ts file.
import { registerHooks } from 'node:module';

registerHooks({
	resolve(specifier, context, next) {
		try {
			return next(specifier, context);
		} catch (error) {
			if (specifier.startsWith('.')) return next(`${specifier}.ts`, context);
			throw error;
		}
	}
});
