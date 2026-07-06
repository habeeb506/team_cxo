#!/usr/bin/env node
/**
 * Generates the boilerplate files for a new CRUD resource, following
 * the exact pattern already used by CxoTeam/BusinessTeam (backend) and
 * cxoTeam (frontend). Every generated file is a starting point with
 * TODO markers -- it is not meant to be a finished module.
 *
 * Usage:
 *   node scripts/scaffold-module.mjs <PascalCaseName> <kebab-route-segment>
 *
 * Example:
 *   node scripts/scaffold-module.mjs Task tasks
 *   node scripts/scaffold-module.mjs MomGenerator mom-generator
 *
 * <PascalCaseName> is the singular model name (Mongoose model name,
 * class name prefix). <kebab-route-segment> is the plural API route
 * segment (e.g. GET /api/v1/tasks) and is also used, converted to
 * camelCase, as the frontend feature folder name -- see
 * CONTRIBUTING.md's "Adding a new module" walkthrough for the full
 * naming rationale.
 *
 * What this script does NOT do (deliberately -- see printed checklist):
 *   - It does not touch any existing "registry" file (barrels, route
 *     index, routePaths, routeConfig, Sidebar, dashboardCards). Those
 *     are printed as a manual checklist instead of being edited
 *     automatically, because safely inserting a line into an existing
 *     file via a script is riskier than a human adding one line by
 *     hand with the file open.
 *   - It does not run npm/eslint for you -- run `node --check` on the
 *     backend files and your usual lint/build step after generating.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  backendControllerTemplate,
  backendModelTemplate,
  backendRepositoryTemplate,
  backendRoutesTemplate,
  backendServiceTemplate,
  backendValidationTemplate,
  frontendApiServiceTemplate,
  frontendManagementConfigTemplate,
  frontendPageTemplate,
} from './scaffoldTemplates.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function toCamelFromKebab(kebab) {
  return kebab.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function toScreamingSnake(camel) {
  return camel.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

/** Builds every name variant every template needs from the two CLI args. */
function buildNameVariants(pascalName, routeSegment) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(pascalName)) {
    throw new Error(`Resource name must be PascalCase, e.g. "Task" or "MomGenerator" (got "${pascalName}")`);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(routeSegment)) {
    throw new Error(`Route segment must be kebab-case, e.g. "tasks" or "mom-generator" (got "${routeSegment}")`);
  }

  const singularCamel = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
  const pluralCamel = toCamelFromKebab(routeSegment);
  const pluralPascal = capitalize(pluralCamel);

  return {
    pascalName,
    singularCamel,
    routeSegment,
    pluralCamel,
    pluralPascal,
    collectionName: routeSegment.replace(/-/g, '_'),
    screamingSnake: toScreamingSnake(singularCamel),
  };
}

function writeFile(relativePath, contents) {
  const fullPath = path.join(ROOT, relativePath);
  if (fs.existsSync(fullPath)) {
    throw new Error(`Refusing to overwrite existing file: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, contents, 'utf8');
  console.log(`  created  ${relativePath}`);
}

function printChecklist(n) {
  console.log(`
Next steps -- wire the new module into these existing "registry" files
(each needs exactly one line added; see CONTRIBUTING.md's "Adding a new
module" walkthrough for a worked example):

Backend
  backend/src/models/index.js
    export { default as ${n.pascalName} } from './${n.pascalName}.model.js';
  backend/src/repositories/index.js
    export { default as ${n.pascalName}Repository } from './${n.pascalName}Repository.js';
  backend/src/services/index.js
    export { default as ${n.pascalName}Service } from './${n.pascalName}Service.js';
  backend/src/controllers/index.js
    export { default as ${n.singularCamel}Controller } from './${n.singularCamel}.controller.js';
  backend/src/validations/index.js
    export { create${n.pascalName}Schema, update${n.pascalName}Schema } from './${n.singularCamel}.schema.js';
  backend/src/routes/v1/index.js
    import ${n.singularCamel}Routes from './${n.singularCamel}.routes.js';
    router.use('/${n.routeSegment}', ${n.singularCamel}Routes);

Frontend
  frontend/src/api/services/index.js
    export { default as ${n.singularCamel}ApiService } from './${n.singularCamel}ApiService.js';
  frontend/src/constants/routePaths.js
    ${n.pluralCamel}: '/${n.routeSegment}',
  frontend/src/routes/routeConfig.js
    import ${n.pluralPascal}Page from '../pages/${n.pluralPascal}Page.jsx';
    add { path: ROUTE_PATHS.${n.pluralCamel}, element: ${n.pluralPascal}Page } to a routes array
    (element is a component reference, not JSX -- see existing entries).
  frontend/src/components/layout/Sidebar.jsx
    add { label: '${n.pluralPascal}', path: ROUTE_PATHS.${n.pluralCamel} } to NAV_ITEMS
  frontend/src/constants/dashboardCards.js
    point this module's existing card's route at ROUTE_PATHS.${n.pluralCamel}
    instead of the ModulePlaceholderPage default (see moduleRoute()).

Then:
  1. Fill in the TODO markers in every generated file (real fields,
     filters, columns, uniqueFields).
  2. cd backend && node --check src/models/${n.pascalName}.model.js (repeat per file, or run your usual lint).
  3. If this resource isn't a natural CRUD roster (e.g. an analytics
     dashboard or a document-generation tool), use this scaffold only
     as the storage layer and build a bespoke page/controller action on
     top -- see CONTRIBUTING.md's "Non-CRUD modules" note.
`);
}

function main() {
  const [pascalName, routeSegment] = process.argv.slice(2);
  if (!pascalName || !routeSegment) {
    console.error('Usage: node scripts/scaffold-module.mjs <PascalCaseName> <kebab-route-segment>');
    console.error('Example: node scripts/scaffold-module.mjs Task tasks');
    process.exit(1);
  }

  const n = buildNameVariants(pascalName, routeSegment);

  console.log(`Scaffolding "${n.pascalName}" (/${n.routeSegment})...\n`);

  writeFile(`backend/src/models/${n.pascalName}.model.js`, backendModelTemplate(n));
  writeFile(`backend/src/repositories/${n.pascalName}Repository.js`, backendRepositoryTemplate(n));
  writeFile(`backend/src/validations/${n.singularCamel}.schema.js`, backendValidationTemplate(n));
  writeFile(`backend/src/services/${n.pascalName}Service.js`, backendServiceTemplate(n));
  writeFile(`backend/src/controllers/${n.singularCamel}.controller.js`, backendControllerTemplate(n));
  writeFile(`backend/src/routes/v1/${n.singularCamel}.routes.js`, backendRoutesTemplate(n));

  writeFile(`frontend/src/api/services/${n.singularCamel}ApiService.js`, frontendApiServiceTemplate(n));
  writeFile(
    `frontend/src/features/${n.pluralCamel}/${n.singularCamel}.management.config.js`,
    frontendManagementConfigTemplate(n),
  );
  writeFile(`frontend/src/pages/${n.pluralPascal}Page.jsx`, frontendPageTemplate(n));

  printChecklist(n);
}

main();
