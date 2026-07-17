# React Hooks

The library exposes several hooks that subscribe to the `@wordpress/data` store and automatically trigger component re-renders when data is fetched, updated, or invalidated.

## `useFrappeResourceList`

Fetches and subscribes to a list of records for a specific DocType.

```tsx
import { useFrappeResourceList } from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

function LeadsTable() {
  const { resources, isResolving, error } = useFrappeResourceList(frappeStore, 'CRM Lead', {
    fields: ['name', 'lead_name', 'email_id', 'status'],
    filters: [['status', '=', 'Open']],
    orderBy: 'creation desc',
    limit: 50,
  });

  if (isResolving && !resources) return <div>Loading...</div>;
  if (error) return <div>Error fetching leads</div>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {resources?.map((lead) => (
            <tr key={lead.name}>
              <td>{lead.name}</td>
              <td>{lead.lead_name}</td>
              <td>{lead.email_id}</td>
              <td>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## `useFrappeResource`

Fetches a single document by its DocType and unique `name` (ID).

```tsx
import { useFrappeResource } from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

function LeadDetails({ leadId }: { leadId: string }) {
  const { resource, isResolving, error } = useFrappeResource(frappeStore, 'CRM Lead', leadId);

  if (isResolving && !resource) return <div>Loading...</div>;
  if (!resource) return <div>Not found</div>;

  return (
    <div>
      <h2>{resource.lead_name}</h2>
      <p>Email: {resource.email_id}</p>
      <p>Mobile: {resource.mobile_no}</p>
    </div>
  );
}
```

## `useFrappeResourceActions`

Provides action creators to mutate (save, update, delete) records and invalidate list caches.

```tsx
import { useFrappeResourceActions } from '@lubusin/wp-frappe-data-store';
import { frappeStore } from './store';

function CreateLeadButton() {
  const { saveResource, invalidateResourceLists } = useFrappeResourceActions(frappeStore);

  const handleCreate = async () => {
    try {
      await saveResource('CRM Lead', {
        lead_name: 'New Prospective Client',
        email_id: 'client@example.com',
        status: 'Open',
      });
      // Invalidate list caches so any active useFrappeResourceList hooks re-fetch
      invalidateResourceLists('CRM Lead');
      alert('Lead created.');
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleCreate}>Create Lead</button>;
}
```
