import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rollup/plugin-babel";
import { tamaguiPlugin } from "@tamagui/vite-plugin";
// @ts-expect-error - no types
import { flowPlugin, esbuildFlowPlugin } from "@bunchtogether/vite-plugin-flow";
// @ts-expect-error - no types
import dotenv from "dotenv";

dotenv.config();

const extensions = [
	".web.tsx",
	".tsx",
	".web.ts",
	".ts",
	".web.jsx",
	".jsx",
	".web.js",
	".js",
	".css",
	".json",
];

const tamaguiCompilerConfig = {
	components: ["tamagui"],
	config: "src/tamagui.config.ts",
	useReactNativeWebLite: false,
};

process.env.TAMAGUI_TARGET = "web";

export default defineConfig({
	define: {
		__DEV__: process.env.NODE_ENV === "development" ? "true" : "false",
		"process.env.TAMAGUI_TARGET": '"web"',
	},
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				".js": "jsx",
			},
			mainFields: ["module", "main"],
			resolveExtensions: extensions,
			plugins: [esbuildFlowPlugin(/react-native\/assets.+\.(flow|jsx?)$/)]
		},
	},
	resolve: {
		extensions,
		alias: {
			"react-native": "react-native-web",
			"@/": "/src/",
		},
	},
	plugins: [
		react({
			include: [/\.tsx?$/, /\.jsx?$/],
			exclude: [],
			fastRefresh: true,
			jsxPure: true,
		}),
		tamaguiPlugin(tamaguiCompilerConfig),
		flowPlugin({
			include: /react-native\/assets.+\.(flow|jsx?)$/,
			exclude: /nothinglol/
		}),
		babel({
			include: "**/node_modules/react-native-reanimated/**",
			configFile: false,
			babelHelpers: "bundled",
			presets: [
				[
					"@babel/preset-react",
					{
						modules: false,
					},
				],
			],
		}),
		{
			name: "force-exit-plugin",
			closeBundle() {
				console.info("Build finished, forcing exit in 2 seconds.");
				setTimeout(() => {
					process.exit(0);
				}, 2000);
			},
		},
	],
	build: {
		outDir: "web-build",
		commonjsOptions: {
			transformMixedEsModules: true,
			extensions,
		},
	},
});
