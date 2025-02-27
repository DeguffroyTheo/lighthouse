/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const rollup = require('rollup');
const rollupPlugins = require('./rollup-plugins.js');
const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;
const {LH_ROOT} = require('../root.js');

const distDir = path.join(LH_ROOT, 'dist', 'dt-report-resources');
const bundleOutFile = `${distDir}/report-generator.js`;

/**
 * @param {string} name
 * @param {string} content
 */
function writeFile(name, content) {
  assert(content);
  fs.writeFileSync(`${distDir}/${name}`, content);
}

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

writeFile('report.js', '// This can be removed after the next CDT roll deletes this file');
writeFile('standalone-template.html',
  '<!-- This can be removed after the next CDT roll deletes this file -->');
writeFile('report.d.ts', 'export {}');
writeFile('report-generator.d.ts', 'export {}');

async function buildReportGenerator() {
  const bundle = await rollup.rollup({
    input: 'report/generator/report-generator.js',
    plugins: [
      rollupPlugins.shim({
        [`${LH_ROOT}/report/generator/flow-report-assets.js`]: 'export default {}',
      }),
      rollupPlugins.commonjs(),
      rollupPlugins.nodeResolve(),
      rollupPlugins.inlineFs({verbose: Boolean(process.env.DEBUG)}),
    ],
  });

  await bundle.write({
    file: bundleOutFile,
    format: 'umd',
    name: 'Lighthouse.ReportGenerator',
  });
  await bundle.close();
}

buildReportGenerator().catch(err => {
  console.error(err);
  process.exit(1);
});
