# apispec

Version 1.x.x

## Init

1. Authority contacts `POST:/init`
2. The provider creates a new Init object and returns it to the authority.
3. The user is redirected to the provider's authorization page, where they create a project.
4. The provider redirects the user back to the authority with the project ID.
5. The user gives the authority a bearer key.
6. The authority can now sync with the provider.

## Sync

1. Authority contacts `POST:/projects/:project_id/sync`, authorised with the bearer, and sends the encrypted payload.
2. The provider decrypts the payload and updates the project, notifies integrations.
