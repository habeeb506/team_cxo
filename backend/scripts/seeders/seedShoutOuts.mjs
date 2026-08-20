import { ShoutOut } from '../../src/models/index.js';

const SHOUT_OUTS_PER_USER = 6;

const FROM_NAMES = [
  'Priya Nair',
  'Tom Becker',
  'Lena Fischer',
  'Omar Haddad',
  'Grace Kim',
  'Sam Okafor',
];

const MESSAGES = [
  'Huge thanks for jumping in on the client escalation over the weekend -- really appreciated it.',
  'Great job walking the new hires through the onboarding process this week.',
  'Thanks for catching that bug before it hit production!',
  'Your presentation to the stakeholders was clear and confident -- nice work.',
  'Really impressed with how you handled that tough customer conversation.',
  'Thanks for always being the first to help teammates who are stuck.',
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `shout_outs` for each of the seed script's "activity" users
 * (see seedUsers.mjs), so the Dashboard's Individual Contribution
 * "Shout-outs" tab always has real data to show.
 */
export async function seedShoutOuts(activityUsers) {
  const records = [];
  const now = Date.now();

  activityUsers.forEach((user, userIndex) => {
    for (let i = 0; i < SHOUT_OUTS_PER_USER; i++) {
      const givenDaysAgo = i * 9 + (userIndex % 5);

      records.push({
        fromName: pick(FROM_NAMES, i + userIndex),
        message: pick(MESSAGES, i + userIndex * 2),
        givenAt: new Date(now - givenDaysAgo * 24 * 60 * 60 * 1000),
        assignedTo: user._id,
      });
    }
  });

  return ShoutOut.insertMany(records);
}
