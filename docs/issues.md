# Known Issues

List of known issues:

- The app does not have authentication (-> localhost only)
- On save, the editable grids force delete on all current rows and add all fetched rows
    - Not easy to implement undo/redo
    - The user loses cell selection on refresh
    - Refreshing *sometimes* resets scroll location, so the user loses original location
- There is no auto-fetching of new data in case multiple users are editing
- There is no warning when your data is not saved because of a conflicting edit

Given the known issues with datagrid editing, alternative approaches are:
- Use Google App Script with Google Sheets
- Change to form-based editing
