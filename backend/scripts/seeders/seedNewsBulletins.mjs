import { NewsBulletin } from '../../src/models/index.js';

const BULLETINS = [
  {
    title: 'Q3 town hall recording now available',
    description:
      'Missed this week\'s town hall? The full recording, along with the slide deck and a written summary of the Q&A session, is now posted on the internal knowledge base. Leadership covered the roadmap for the next two quarters, an update on the office expansion, and answered questions submitted anonymously ahead of time. If you have follow-up questions that weren\'t addressed, reply to the announcement thread and a leadership team member will follow up directly.',
    link: 'https://sample.com/news/q3-town-hall',
  },
  {
    title: 'New health insurance provider starting next month',
    description:
      'Starting next month, our health insurance plan is moving to a new provider with expanded coverage and a lower deductible. HR will be hosting two info sessions this week to walk through the changes and answer questions about the transition. New insurance cards will be mailed directly to your home address on file, so please confirm your address is up to date in the HR portal before the end of the week.',
    link: 'https://sample.com/news/new-insurance-provider',
  },
  {
    title: 'Office closed for the upcoming public holiday',
    description:
      'A friendly reminder that the office will be closed for the upcoming public holiday. Support coverage will be handled by the on-call rotation as usual -- please check the on-call schedule if you are unsure whether you are covering. Normal business hours resume the following business day.',
    link: '',
  },
  {
    title: 'Engineering all-hands: new deployment pipeline',
    description:
      'The infrastructure team has finished rolling out the new deployment pipeline across all services. Deployments should now be noticeably faster and rollbacks fully automated in the event of a failed health check. A short recorded walkthrough of the new process is linked below for anyone who wants a refresher before their next release.',
    link: 'https://sample.com/news/new-deployment-pipeline',
  },
  {
    title: 'Congratulations to this quarter\'s recognition award winners',
    description:
      'Please join us in congratulating this quarter\'s recognition award winners, selected from nominations submitted by peers across every team. Winners will be recognized individually at Friday\'s all-hands, and each will receive an additional day of paid time off as part of the award. Thank you to everyone who took the time to nominate a colleague this quarter.',
    link: '',
  },
  {
    title: 'New parking arrangement effective immediately',
    description:
      'Due to ongoing construction in the main lot, parking arrangements have changed effective immediately. Overflow parking is now available in the adjacent structure, validated at the front desk. Shuttle service between the structure and the main building runs every fifteen minutes during core hours.',
    link: '',
  },
  {
    title: 'Annual security awareness training due end of month',
    description:
      'This is a reminder that annual security awareness training is due by the end of the month. The training takes approximately 30 minutes and covers phishing recognition, password hygiene, and data handling policy updates. Completion is tracked automatically -- you do not need to send a confirmation to your manager.',
    link: 'https://sample.com/news/security-training',
  },
  {
    title: 'Cafeteria menu refresh starting Monday',
    description:
      'Based on feedback from the last employee survey, the cafeteria is refreshing its menu starting Monday with more plant-based options and a build-your-own bowl station. Let facilities know if you have dietary restrictions that aren\'t currently accommodated -- they are actively collecting requests for the next rotation.',
    link: '',
  },
  {
    title: 'New employee resource group: Parents & Caregivers',
    description:
      'We\'re excited to announce a new employee resource group for parents and caregivers, open to anyone interested in joining regardless of team. The group will meet monthly to share resources, host occasional guest speakers, and provide informal peer support. Sign-up details are linked below.',
    link: 'https://sample.com/news/erg-parents-caregivers',
  },
  {
    title: 'Wi-Fi maintenance scheduled for this weekend',
    description:
      'IT will be performing scheduled maintenance on the office Wi-Fi network this weekend to improve coverage in the east wing. Expect brief, intermittent outages during the maintenance window. No action is needed on your part -- devices will reconnect automatically once the work is complete.',
    link: '',
  },
  {
    title: 'Updated expense reporting policy now in effect',
    description:
      'An updated expense reporting policy is now in effect, raising the receipt threshold and simplifying the approval workflow for recurring software subscriptions. The finance team has published a short guide covering what changed and how it affects existing pending reports.',
    link: 'https://sample.com/news/expense-policy-update',
  },
  {
    title: 'Volunteer day sign-ups now open',
    description:
      'Sign-ups are now open for this quarter\'s company-sponsored volunteer day. Employees who participate receive a paid day off in addition to their regular time off allotment. Space is limited for some of the on-site volunteer opportunities, so sign up early if you have a preference.',
    link: 'https://sample.com/news/volunteer-day',
  },
  {
    title: 'Reminder: submit your goals for next quarter',
    description:
      'This is a reminder that quarterly goals are due by the end of the week. Please work with your manager to finalize your goals in the performance system before the deadline -- goals submitted late may not be reviewed until the following cycle.',
    link: '',
  },
  {
    title: 'New badge readers installed at all entrances',
    description:
      'New badge readers have been installed at all building entrances as part of the ongoing security upgrade. Existing badges will continue to work without any changes needed. If you experience any issues badging in, contact facilities and a temporary badge will be issued while the issue is resolved.',
    link: '',
  },
  {
    title: 'Customer support wins "Best in Class" industry award',
    description:
      'Our customer support team has been recognized with a "Best in Class" award from an independent industry review board, based on response time and customer satisfaction scores over the past year. This is a direct result of the whole team\'s work -- congratulations to everyone involved.',
    link: 'https://sample.com/news/support-award',
  },
  {
    title: 'Building HVAC upgrade begins next week',
    description:
      'Facilities will begin a phased HVAC upgrade next week, floor by floor, to improve temperature consistency across the building. Each floor\'s work is expected to take one to two days. You\'ll receive a separate notice the day before work begins on your floor.',
    link: '',
  },
  {
    title: 'New learning stipend available for all employees',
    description:
      'A new annual learning stipend is now available to all employees, covering courses, certifications, books, and conference registration. Details on how to submit a request and what qualifies are available on the internal learning portal.',
    link: 'https://sample.com/news/learning-stipend',
  },
  {
    title: 'Password policy update: minimum length increased',
    description:
      'As part of an ongoing security review, the minimum password length requirement has increased. You will be prompted to update your password the next time you log in if your current one doesn\'t meet the new requirement. No other action is needed.',
    link: '',
  },
  {
    title: 'Company picnic date confirmed',
    description:
      'The date for this year\'s company picnic has been confirmed. Family members are welcome to attend, and a calendar invite with RSVP details will go out separately. Please RSVP by the date on the invite so catering can be sized accordingly.',
    link: 'https://sample.com/news/company-picnic',
  },
  {
    title: 'New internal tool for submitting IT requests',
    description:
      'IT has launched a new internal tool for submitting and tracking support requests, replacing the old email-based process. The new tool gives you visibility into request status and estimated turnaround time. The old email alias will continue to work during a short transition period before being retired.',
    link: 'https://sample.com/news/new-it-request-tool',
  },
];

/**
 * Seeds `news_bulletins` -- 20 items spread over the last ~40 days so
 * the Dashboard's News Bulletin panel has enough history to
 * demonstrate pagination/lazy-loading, sorted latest first.
 */
export async function seedNewsBulletins() {
  const now = Date.now();
  const records = BULLETINS.map((bulletin, index) => ({
    ...bulletin,
    // Spread roughly every 2 days going backwards, with a little jitter
    // so publish times aren't suspiciously round.
    publishedAt: new Date(now - index * 2 * 24 * 60 * 60 * 1000 - index * 37 * 60 * 1000),
  }));

  return NewsBulletin.insertMany(records);
}
