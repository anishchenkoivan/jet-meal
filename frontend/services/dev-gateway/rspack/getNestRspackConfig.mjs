import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { rspack } from "@rspack/core";
import { RunScriptWebpackPlugin } from "run-script-webpack-plugin";
import nodeExternals from "webpack-node-externals";

const DEFAULT_MONOREPO_ALLOWLIST = /^@jet-meal\//;

const NEST_WEBPACK_LAZY_IMPORTS = [
  "@nestjs/microservices",
  "@nestjs/websockets",
  "@nestjs/platform-express",
  "cache-manager",
  "class-validator",
  "class-transformer",
];

/**
 * @param {string | URL} metaUrl — `import.meta.url` сервиса
 * @returns {import('@rspack/core').Configuration}
 */
export function getNestRspackConfig(metaUrl) {
  const serviceRootDir = path.dirname(fileURLToPath(metaUrl));
  const isDev = process.env.NODE_ENV === "development";
  const resolveFromService = createRequire(
    path.join(serviceRootDir, "package.json"),
  );

  return {
    context: serviceRootDir,
    target: "node",
    mode: isDev ? "development" : "production",
    ignoreWarnings: [() => true],
    entry: "./src/main.ts",
    output: {
      path: path.join(serviceRootDir, "dist"),
      filename: "main.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".js", ".tsx", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                target: "esnext",
                parser: {
                  syntax: "typescript",
                  decorators: true,
                  dynamicImport: true,
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true,
                  useDefineForClassFields: false,
                },
              },
              module: {
                type: "commonjs",
              },
            },
          },
        },
      ],
    },
    externalsType: "commonjs",
    externalsPresets: { node: true },
    externals: [
      nodeExternals({
        allowlist: [DEFAULT_MONOREPO_ALLOWLIST],
        modulesFromFile: true,
      }),
    ],
    optimization: {
      nodeEnv: false,
      minimize: !isDev,
      minimizer: !isDev
        ? [
            new rspack.SwcJsMinimizerRspackPlugin({
              minimizerOptions: {
                compress: {
                  keep_classnames: true,
                  keep_fnames: true,
                },
                mangle: {
                  keep_classnames: true,
                  keep_fnames: true,
                },
              },
            }),
          ]
        : [],
    },
    plugins: [
      new rspack.IgnorePlugin({
        checkResource(resource) {
          if (!NEST_WEBPACK_LAZY_IMPORTS.includes(resource)) {
            return false;
          }
          try {
            resolveFromService.resolve(resource);
            return false;
          } catch {
            return true;
          }
        },
      }),
      ...(isDev
        ? [
            new RunScriptWebpackPlugin({
              name: "main.js",
              autoRestart: true,
            }),
          ]
        : []),
    ],
  };
}
