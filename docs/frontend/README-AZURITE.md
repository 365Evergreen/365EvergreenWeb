Azurite (local Azure Storage emulator)

Quick start

- Run globally (if installed):

```powershell
azurite --silent --location .\azurite --debug .\azurite\debug.log
```

- Run with `npx` (project-scoped):

```powershell
npx azurite --silent --location .\azurite --debug .\azurite\debug.log
```

- Run via npm script:

```powershell
npm run azurite
# or
npm run azurite:npx
```

Connection string for local dev:

- `UseDevelopmentStorage=true`

Notes

- Azurite emulates Blob, Queue and Table service APIs for development.
- For persistent local storage, use the `--location` path shown above.
- To install project-scoped dependency:

```powershell
npm install --save-dev azurite
```

- To stop Azurite, terminate the running process (Ctrl+C).
