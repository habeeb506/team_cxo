/**
 * Small, hand-picked name pools used only to generate deterministic,
 * varied-looking seed data (scripts/seed.mjs and friends) -- not a
 * dependency on an external fixture-data package, since this is the
 * only place in the app that needs one.
 */
export const FIRST_NAMES = [
  'Aiden', 'Maya', 'Ethan', 'Sofia', 'Liam', 'Grace', 'Noah', 'Zara',
  'Lucas', 'Priya', 'Mason', 'Nora', 'Oliver', 'Ivy', 'Elijah', 'Ruby',
  'James', 'Chloe', 'Benjamin', 'Layla', 'Henry', 'Aria', 'Theo', 'Mila',
  'Leo', 'Ella', 'Jack', 'Freya', 'Owen', 'Luna', 'Caleb', 'Hazel',
  'Wyatt', 'Nova', 'Isaac', 'Aurora', 'Julian', 'Willow', 'Levi', 'Stella',
  'Gabriel', 'Violet', 'Anthony', 'Hannah', 'Dylan', 'Naomi', 'Adrian', 'Iris',
  'Nathan', 'Delilah',
];

export const LAST_NAMES = [
  'Carter', 'Bennett', 'Foster', 'Coleman', 'Reyes', 'Sullivan', 'Griffin', 'Patel',
  'Morgan', 'Hayes', 'Bishop', 'Fleming', 'Cortez', 'Doyle', 'Pierce', 'Sharma',
  'Whitfield', 'Nolan', 'Sinclair', 'Ashford', 'Barrett', 'Lindqvist', 'Okafor', 'Delgado',
  'Winslow', 'Marsh', 'Kavanagh', 'Ellison', 'Trevino', 'Rowe', 'Faulkner', 'Iyer',
  'Whitaker', 'Novak', 'Bristow', 'Calloway', 'Duarte', 'Sorensen', 'Pham', 'Osei',
];

export const JOB_TITLES_BY_ROLE = {
  admin: ['Platform Administrator', 'Operations Director', 'IT Administrator'],
  manager: ['Engineering Manager', 'Support Manager', 'Team Lead', 'Delivery Manager'],
  employee: [
    'Software Engineer', 'Support Specialist', 'QA Engineer', 'Business Analyst',
    'Product Analyst', 'Customer Success Associate', 'Systems Engineer',
  ],
};

/**
 * Builds `count` unique { name, email } pairs from the pools above by
 * pairing every first name with every last name and taking a
 * deterministic slice -- guarantees uniqueness up to
 * FIRST_NAMES.length * LAST_NAMES.length combinations (1,960 here),
 * far more than any seed size this app uses.
 */
export function buildNamePool(count) {
  const pairs = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) {
      pairs.push({ first, last });
    }
  }

  if (count > pairs.length) {
    throw new Error(`Requested ${count} unique names but only ${pairs.length} combinations are available`);
  }

  // Deterministic shuffle (fixed seed) so re-running the seed script
  // produces the same roster rather than a different random sample
  // each time.
  const seeded = [...pairs];
  let seed = 42;
  const nextRandom = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = seeded.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
  }

  return seeded.slice(0, count).map(({ first, last }, index) => ({
    name: `${first} ${last}`,
    email: `${first}.${last}.${index}@sample.com`.toLowerCase(),
  }));
}
