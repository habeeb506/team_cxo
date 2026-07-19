import { CxoPermission } from '../../src/models/index.js';

/**
 * Seeds `cxo_permissions` -- a realistic spread of grants across the
 * roster seedCxoTeams just created, so the Permissions page has real
 * data (and real resource/action variety) to list instead of an empty
 * page. Not exhaustive -- just enough members and resources to
 * demonstrate the shape: the CEO gets a global grant, each Director
 * gets scoped grants over two other resources, and half the Managers
 * get a grant over one operational resource.
 */
export async function seedCxoPermissions({ ceo, directors, managers }) {
  const records = [];

  // CEO: full access to everything.
  records.push({
    member: ceo._id,
    resource: '*',
    actions: ['create', 'read', 'update', 'delete'],
    grantedBy: null,
  });

  // Every Director: manage the leadership roster, view the business roster.
  directors.forEach((director) => {
    records.push({
      member: director._id,
      resource: 'cxo_teams',
      actions: ['read', 'update'],
      grantedBy: ceo._id,
    });
    records.push({
      member: director._id,
      resource: 'business_teams',
      actions: ['read'],
      grantedBy: ceo._id,
    });
  });

  // Half the Managers: read/update over tickets; the other half over tasks.
  managers.forEach((manager, index) => {
    const resource = index % 2 === 0 ? 'tickets' : 'tasks';
    records.push({
      member: manager._id,
      resource,
      actions: ['read', 'update'],
      grantedBy: directors[index % directors.length]._id,
    });
  });

  return CxoPermission.insertMany(records);
}
