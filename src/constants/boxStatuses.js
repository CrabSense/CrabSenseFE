export const BOX_STATUS = {
    EMPTY: 'empty',
    ACTIVE: 'active',
    MOLTING: 'molting',
    QUARANTINE: 'quarantine',
    MAINTENANCE: 'maintenance',
    HARVESTED: 'harvested',
    WATCH: 'watch',
  }
  
  export const BOX_STATUS_OPTIONS = [
    {
      value: BOX_STATUS.EMPTY,
      label: 'Empty',
    },
    {
      value: BOX_STATUS.ACTIVE,
      label: 'Active',
    },
    {
      value: BOX_STATUS.MOLTING,
      label: 'Molting',
    },
    {
      value: BOX_STATUS.QUARANTINE,
      label: 'Quarantine',
    },
    {
      value: BOX_STATUS.MAINTENANCE,
      label: 'Maintenance',
    },
    {
      value: BOX_STATUS.HARVESTED,
      label: 'Harvested',
    },
    {
      value: BOX_STATUS.WATCH,
      label: 'Watch',
    },
  ]
  
  export const BOX_ADMIN_STATUS_OPTIONS = [
    {
      value: BOX_STATUS.EMPTY,
      label: 'Empty',
    },
    {
      value: BOX_STATUS.MAINTENANCE,
      label: 'Maintenance',
    },
    {
      value: BOX_STATUS.WATCH,
      label: 'Watch',
    },
  ]