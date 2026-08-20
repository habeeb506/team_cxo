#!/usr/bin/env node
/**
 * One-off operational script: overrides a single user's `alias` (see
 * backend/src/models/User.model.js and backend/src/utils/machineIdentity.js).
 * `alias` normally auto-derives from the email's local part (everything
 * before '@') the moment a user document is saved -- this script is
 * only needed when someone's real OS username doesn't happen to match
 * their email prefix (e.g. email `jane.doe@sample.com` but Windows
 * account `jdoe`). There's no admin UI for this yet -- `users` has no
 * CRUD page (see routes/v1/user.routes.js, read-only) -- so this is the
 * supported way to override it today.
 *
 * Usage:
 *   node scripts/setUserAlias.mjs <email> <osUsername>
 *   node scripts/setUserAlias.mjs <email> --reset   (back to the email-derived default)
 *
 * Or via the npm script wired up in package.json:
 *   npm run set-alias --prefix backend -- <email> <osUsername>
 *
 * `osUsername` is whatever `os.userInfo().username` reports on the
 * machine that should be allowed to sign in as this account -- on
 * Windows, this is the folder name under C:\Users\<name>. Run
 * `node -e "console.log(require('os').userInfo().username)"` on that
 * machine if you're not sure what to pass. Login now *requires* this
 * match for every account (see AuthService.verifyOtp) -- there's no
 * way to disable the check, only to correct which username an account
 * expects.
 */
import { User } from '../src/models/index.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

async function run() {
  const [, , email, value] = process.argv;

  if (!email || !value) {
    console.error('Usage: node scripts/setUserAlias.mjs <email> <osUsername|--reset>');
    process.exitCode = 1;
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  await connectDB();

  // '--reset' clears the override so the pre-validate hook re-derives
  // it from `email` the next time this document is saved -- but since
  // this script updates directly (not a document `.save()`), re-derive
  // it here too so `--reset` takes effect immediately rather than
  // silently doing nothing until some other update touches this user.
  const alias = value === '--reset' ? normalizedEmail.split('@')[0] : value.trim().toLowerCase();

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail, isDeleted: { $ne: true } },
    { $set: { alias } },
    { new: true },
  );

  if (!user) {
    console.error(`No user found with email ${normalizedEmail}`);
    process.exitCode = 1;
  } else {
    console.log(`${user.email} can now only sign in from OS username "${alias}".`);
  }

  await disconnectDB();
}

run().catch((error) => {
  console.error('setUserAlias failed:', error);
  process.exitCode = 1;
});
