# P0.2 Farm Administrator box configuration
- Farm Administrator uses PUT /api/boxes/{id} for existing box configuration.
- The Staff-only PATCH /api/boxes/{id}/status is not used from Admin box inventory or form.
- Clearing an unoccupied box keeps its code and sends isOccupied=false; BE rejects any concurrent active allocation.
- Occupied boxes cannot be cleared, and editing code preserves current status/occupancy.
- Manual acceptance: log in as Farm Administrator, choose assigned area/row, edit code and allowed status of empty box, clear an unoccupied box, attempt to clear an occupied box (disabled), verify concurrent occupancy returns conflict, verify System Administrator cannot open farm routes.
