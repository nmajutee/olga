import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
	...nextVitals,
	globalIgnores([
		".next/**",
		".open-next/**",
		"dist/**",
		".wrangler/**",
	]),
];

export default config;