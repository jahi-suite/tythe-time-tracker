# Updates: tt-ts-shifts-payrates-20260223

- Task created. Goal: easier shift edit/delete (buttons on each row, auto-load) + pay rates editing in Manage Users.
- 2026-02-23: Completed `shifts-01` in `tt-ts/src/client/pages/ManagerPage.tsx` by adding row-level Edit/Delete buttons in View All Entries. Edit switches to Edit tab, pre-fills entry ID, and loads shift data; Delete switches to Delete tab and pre-fills entry ID.
- 2026-02-23: Completed `shifts-02` in `tt-ts/src/client/pages/ManagerPage.tsx` by auto-loading the selected shift from an effect when Edit tab opens with a row-selected `editShiftEntryId`, so "Load Shift" is no longer required after clicking row Edit.
