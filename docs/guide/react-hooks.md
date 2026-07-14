# React Hooks

The library exposes several hooks that subscribe to the `@wordpress/data` store and automatically trigger component re-renders when data is fetched, updated, or invalidated.

## `useFrappeResourceList`

Fetches and subscribes to a list of records for a specific DocType.

```tsx
import { useFrappeResourceList } from '@lubusin/wp-frappe-data-store';

function LeadsTable() {
  const { records, isResolving, error, refetch } = useFrappeResourceList('CRM Lead', {
    fields: ['name', 'lead_name', 'email_id', 'status'],
    filters: [['status', '=', 'Open']],
    order_by: 'creation desc',
    limit_page_length: 50
  });

  if (isResolving && !records) return <div>Loading...</div>;
  if (error) return <div>Error fetching leads</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
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
          {records?.map((lead) => (
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

function LeadDetails({ leadId }: { leadId: string }) {
  const { record, isResolving, error } = useFrappeResource('CRM Lead', leadId);

  if (isResolving) return <div>Loading...</div>;
  if (!record) return <div>Not found</div>;

  return (
    <div>
      <h2>{record.lead_name}</h2>
      <p>Email: {record.email_id}</p>
      <p>Mobile: {record.mobile_no}</p>
    </div>
  );
}
```

## `useFrappeResourceActions`

Provides action creators to mutate (save, update, delete) records and invalidate list caches.

```tsx
import { useFrappeResourceActions } from '@lubusin/wp-frappe-data-store';

function CreateLeadButton() {
  const { saveResource, invalidateResourceLists } = useFrappeResourceActions();

  const handleCreate = async () => {
    try {
      await saveResource('CRM Lead', {
        lead_name: 'New Prospective Client',
        email_id: 'client@example.com',
        status: 'Open'
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
