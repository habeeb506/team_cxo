import { Voc } from '../../src/models/index.js';
import { VOC_CATEGORIES } from '../../src/config/constants.js';

const VOCS_PER_USER = 8;

const CUSTOMER_NAMES = [
  'Northwind Traders',
  'Globex Corp',
  'Initech LLC',
  'Umbrella Retail',
  'Stark Logistics',
  'Wayne Supplies',
  'Acme Manufacturing',
  'Hooli Systems',
];

const FEEDBACK_BY_CATEGORY = {
  praise: 'Extremely responsive support and a smooth resolution -- great experience overall.',
  complaint: 'Response time was slower than expected and the first fix did not hold.',
  suggestion: 'Would love a self-service option for this kind of request in the future.',
};

function pick(array, index) {
  return array[index % array.length];
}

/**
 * Seeds `vocs` (Voice of Customer) for each of the seed script's
 * "activity" users (see seedUsers.mjs), so the Dashboard's Individual
 * Contribution "VOCs" tab always has real data to show.
 */
export async function seedVocs(activityUsers) {
  const records = [];
  const now = Date.now();

  activityUsers.forEach((user, userIndex) => {
    for (let i = 0; i < VOCS_PER_USER; i++) {
      const category = pick(VOC_CATEGORIES, i + userIndex);
      const receivedDaysAgo = i * 6 + (userIndex % 4);

      records.push({
        customerName: pick(CUSTOMER_NAMES, i + userIndex),
        feedback: FEEDBACK_BY_CATEGORY[category],
        rating: category === 'praise' ? 5 : category === 'complaint' ? 2 : 4,
        category,
        receivedAt: new Date(now - receivedDaysAgo * 24 * 60 * 60 * 1000),
        assignedTo: user._id,
      });
    }
  });

  return Voc.insertMany(records);
}
