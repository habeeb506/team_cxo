import { Award } from '../../src/models/index.js';

const AWARDS_PER_USER = 3;

const AWARDS = [
  { title: 'Employee of the Month', category: 'Recognition' },
  { title: 'Customer Champion Award', category: 'Customer Service' },
  { title: 'Innovation Award', category: 'Innovation' },
  { title: 'Team Player Award', category: 'Collaboration' },
  { title: 'Above and Beyond Award', category: 'Recognition' },
];

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `awards` for each of the seed script's "activity" users (see
 * seedUsers.mjs), so the Dashboard's Individual Contribution "Awards"
 * tab always has real data to show.
 */
export async function seedAwards(activityUsers) {
  const records = [];
  const now = Date.now();

  activityUsers.forEach((user, userIndex) => {
    for (let i = 0; i < AWARDS_PER_USER; i++) {
      const { title, category } = pick(AWARDS, i + userIndex);
      const awardedDaysAgo = i * 45 + (userIndex % 10);

      records.push({
        title,
        category,
        description: 'Seed data for local development and testing of the Individual Contribution panel.',
        awardedAt: new Date(now - awardedDaysAgo * 24 * 60 * 60 * 1000),
        assignedTo: user._id,
      });
    }
  });

  return Award.insertMany(records);
}
