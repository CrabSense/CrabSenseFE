export const translations = {
  // =====================================
  // ENGLISH
  // =====================================
  en: {
    nav: {
      dashboard: "Dashboard",
      monitoring: "Monitoring",
      analytics: "Analytics",
      farmManagement: "Farm Management",
      settings: "Settings",
      mainMenu: "MAIN MENU",
      adminPortal: "ADMIN PORTAL",
      platform: "CrabSense Platform",
      mainNavigation: "Main navigation",
      openNavigation: "Open navigation",
      closeNavigation: "Close navigation",
      expandSidebar: "Expand sidebar",
      collapseSidebar: "Collapse sidebar",
      farmWorkspace: "Farm workspace",
      workspaceDescription: "Monitoring and farm operations",
      systemMenu: "PREFERENCES",
      systemAdministration: "System administration",
      systemOverview: "System Overview",
      deviceManagement: "Device Management",
      cameraRecording: "Camera & Recording",
      aiServices: "AI Services",
      storageBackup: "Storage & Backup",
      deployment: "Deployment",
      securityAccess: "Security & Access",
      systemLogs: "System Logs",
      deviceAi: "DEVICE & AI",
      infrastructure: "INFRASTRUCTURE",
      securityGroup: "SECURITY",
      systemWorkspace: "System infrastructure",
      systemWorkspaceDescription:
        "Cameras, sensors, controllers, and AI services. Configure the recording schedule and monitor device status. Manage storage, backup, deployment, and system security.",
      systemRole: "System Administrator",
    },

    common: {
      save: "Save Settings",
      cancel: "Cancel",
      refresh: "Refresh",
      logout: "Logout",
      loggingOut: "Logging out...",
      administrator: "Administrator",
    },

    login: {
      farmTitle: "SMART SOFT-SHELL CRAB FARM",
      tagline: "Technology alongside — Healthy crabs every day",
      featureMonitor: "Smart\nmonitoring",
      featureManage: "Easy\nmanagement",
      featureEnvironment: "Stable\nenvironment",
      featureYield: "Sustainable\nyield",
      welcome: "Admin sign in",
      description: "Follow CrabSense from the admin console.",
      username: "Username",
      usernamePlaceholder: "Admin account name",
      password: "Password",
      passwordPlaceholder: "Enter password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      showPassword: "Show password",
      hidePassword: "Hide password",
      signIn: "Sign in",
      signingIn: "Signing in...",
      or: "or",
      register: "No account yet? Register",
      loginFailedTitle: "Sign in failed",
      dismissError: "Dismiss",
      requiredUsername: "Please enter your username",
      requiredPassword: "Please enter your password",
      noAdminAccess:
        "This account is not a farm administrator or system administrator.",
      invalidCredentials:
        "Username or password is incorrect. Please check and try again.",
      copyright: "© 2026 CrabSense • Soft-shell crab farm",
      policy: "Policy",
      terms: "Terms",
      help: "Help",
      contact: "Contact",
    },

    settings: {
      eyebrow: "SYSTEM PREFERENCES",
      title: "Settings",
      description: "Manage your display and monitoring preferences.",
      display: "Display Preferences",
      displayDescription: "Choose your interface language.",
      darkMode: "Dark Mode",
      darkModeDescription: "Use the dark CrabSense interface.",
      language: "Language",
      languageDescription: "Choose your interface language.",
      monitoring: "Monitoring Preferences",
      monitoringDescription: "Configure your monitoring preferences.",
      refreshInterval: "Refresh Interval",
      refreshDescription: "Preferred update frequency (5–300 seconds).",
      seconds: "seconds",
      alerts: "Enable Alerts",
      alertsDescription: "Notification preference (integration pending).",
      unsaved: "You have unsaved changes.",
      upToDate: "All local preferences are up to date.",
      saved: "Settings saved successfully.",
      saveFailed: "Unable to save settings.",
      invalidInterval: "Refresh interval must be between 5 and 300 seconds.",
    },

    areaSelector: {
      label: "FARMING AREA",
      loading: "Loading areas...",
      loadError: "Unable to load farming areas",
      allAreas: "All Farming Areas",
      viewCompleteSystem: "View complete system",
      boxes: "boxes",
      crabs: "crabs",
      noActiveAreas: "No active farming areas",
    },

    analytics: {
      // Header
      badge: "FARM ANALYTICS",
      title: "Performance Analytics",
      description:
        "Analyze survival, harvest, molting and operational performance for",
      allAreas: "all farming areas",
      refresh: "Refresh",
      refreshing: "Refreshing...",

      // Date filter
      dateRange: "Analytics date range",
      fromDate: "From Date",
      toDate: "To Date",

      // Common
      noData: "No data",
      unknownDate: "Unknown date",
      loading: "Loading analytics data",
      loadingDescription: "Loading analytics data, please wait.",
      crabs: "crabs",

      // KPI Grid
      kpiOverview: "Analytics key performance indicators",
      survivalRate: "Survival Rate",
      harvestWeight: "Harvest Weight",
      moltingRate: "Molting Rate",
      harvestRate: "Harvest Rate",
      aliveCrabs: "alive crabs",
      harvestedCrabs: "harvested crabs",
      moltedCrabs: "molted crabs",
      operationalEfficiencyDescription: "Operational efficiency",

      // Harvest Trend Chart
      harvestCategory: "HARVEST",
      harvestTrend: "Harvest Trend",
      harvestTrendDescription: "Quantity and weight by harvest date.",
      noHarvestData: "No harvest data available.",
      harvestChartAria:
        "Harvest trend showing weight in kilograms and harvested crab quantity by date",
      weightKg: "Weight (kg)",
      quantityCrabs: "Quantity (crabs)",

      // Molting Panel
      moltingCategory: "MOLTING",
      moltingPerformance: "Molting Performance",
      selectedAreaDescription: "Area breakdown for",
      selectedFarmingArea: "selected farming area",
      overallMoltingDescription: "Overall farm molting performance",
      noMoltingData: "No molting data available",
      noMoltingBreakdown:
        "No molting breakdown was returned for the selected farming area.",
      moltingRateDescription: "Based on the reported molting data.",
      totalCrabs: "Total Crabs",
      molting: "Molting",
      molted: "Molted",

      // Efficiency Panel
      operationsCategory: "OPERATIONS",
      operationalEfficiency: "Operational Efficiency",
      efficiencyDescription: "Performance within the selected date range.",
      aliveRate: "Alive Rate",
      mortalityRate: "Mortality Rate",

      // Survival Panel
      survivalCategory: "SURVIVAL",
      populationOutcome: "Population Outcome",
      populationDescription:
        "Survival, mortality and harvest outcomes for the selected cohort.",
      survival: "Survival",
      mortality: "Mortality",
      harvested: "Harvested",
      total: "Total",
      alive: "Alive",
      dead: "Dead",

      // Error
      loadError: "Unable to load analytics",
      unexpectedError:
        "An unexpected error occurred while loading analytics data.",
      retry: "Try again",
      retrying: "Retrying...",
      dateRangeNote:
        "Date range applies to Survival and Operational Efficiency reports.",
      reportsAria: "Analytics reports",
    },

    dashboard: {
      // Header
      overviewBadge: "FARM OVERVIEW",
      overviewTitle: "Farm Overview",
      overviewDescription:
        "Monitor farm operations, system health and recent activity across CrabSense.",
      overviewAria: "Dashboard overview",
      lastUpdated: "Last Updated",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      refreshAria: "Refresh dashboard data",

      // KPI
      kpiAria: "Farm key performance indicators",
      totalBoxes: "Total Boxes",
      registeredBoxes: "Registered farming boxes",
      liveCrabs: "Live Crabs",
      currentlyAlive: "Currently alive",
      activeBoxes: "Active Boxes",
      activeBoxesDescription: "Active, molting or occupied",
      openAlerts: "Open Alerts",
      requiresAttention: "Requires attention",
      noActiveAlerts: "No active alerts",
      action: "ACTION",
      clear: "CLEAR",
      iotOnline: "IoT Online",
      connectedDevices: "Connected devices",

      // Farm Health
      farmHealthCategory: "FARM HEALTH",
      overallHealth: "Overall Health",
      overallHealthScore: "Overall farm health score",
      unknown: "Unknown",
      farmHealthAria: "Farm health overview",
      farmOperationsAria: "Farm operations",

      // Health Breakdown
      systemHealthCategory: "SYSTEM HEALTH",
      healthBreakdown: "Health Breakdown",
      waterQuality: "Water Quality",
      crabHealth: "Crab Health",
      deviceStatus: "Device Status",

      // Health status
      excellent: "Excellent",
      healthy: "Healthy",
      good: "Good",
      normal: "Normal",
      warning: "Warning",
      critical: "Critical",
      danger: "Danger",
      poor: "Poor",

      // Recent Activity
      activityCategory: "ACTIVITY",
      recentActivity: "Recent Activity",
      noRecentActivity: "No recent activity.",
      timeUnavailable: "Time unavailable",

      // Today's Tasks
      operationsCategory: "OPERATIONS",
      todaysTasks: "Today's Tasks",
      noTasks: "No operational tasks today.",
      completed: "Completed",
      pending: "Pending",
      priorityHigh: "High",
      priorityMedium: "Medium",
      priorityLow: "Low",

      // Error
      loadError: "Unable to load dashboard",
      unexpectedError: "An unexpected error occurred.",
      retry: "Try again",

      // Loading
      loading: "Loading dashboard",
      loadingDescription: "Loading dashboard data, please wait.",
    },

    monitoring: {
      // Header
      badge: "FARM MONITORING",
      title: "Environment & Box Monitoring",
      description:
        "Monitor environmental conditions, device status and box health for",
      allAreas: "all farming areas",
      overview: "Monitoring overview",
      lastSynced: "Last synced",
      notSynced: "Not synced yet",
      timeUnavailable: "Time unavailable",
      refresh: "Refresh",
      refreshing: "Refreshing...",

      // Environment
      environmentMetrics: "Environmental monitoring metrics",
      waterTemperature: "Water Temperature",
      temperatureDescription: "Area water temperature",
      phLevel: "pH Level",
      phDescription: "Current pH measurement",
      dissolvedOxygen: "Dissolved Oxygen",
      oxygenDescription: "Current oxygen level",
      devicesOnline: "Devices Online",
      noRegisteredDevices: "No registered devices",
      devicesOnlineCount: "{online} of {total} devices online",
      autoRefresh: "Auto Refresh",
      every: "Every",
      syncingData: "Syncing monitoring data...",
      refreshActive: "Monitoring refresh is active",

      // Summary
      boxSummary: "Box monitoring summary",
      totalBoxes: "Total Boxes",
      healthy: "Healthy",
      warning: "Warning",
      critical: "Critical",
      offline: "Offline",
      unknown: "Unknown",
      online: "Online",
      good: "Good",
      excellent: "Excellent",
      danger: "Danger",
      normal: "Normal",

      // Box table
      boxStatus: "BOX STATUS",
      boxMonitoring: "Box Monitoring",
      boxDescription:
        "Health, water, device and alert status for monitored boxes.",
      columnBox: "Box",
      columnHealth: "Health",
      columnScore: "Score",
      columnWater: "Water",
      columnDevice: "Device",
      columnAlerts: "Alerts",
      noBoxes: "No boxes available for this farming area.",
      noMatchingBoxes: "No boxes match the current filters.",

      // Search and filters
      searchAria: "Search monitoring boxes",
      searchPlaceholder: "Search box, row or area...",
      filterAria: "Filter boxes by status",
      allStatus: "All Status",

      // Errors
      loadError: "Unable to load monitoring",
      unexpectedError:
        "An unexpected error occurred while loading monitoring data.",
      retry: "Try again",
      retrying: "Retrying...",

      // Loading
      loading: "Loading monitoring data",
      loadingDescription: "Loading monitoring data, please wait.",
    },

    // ============================================
    // FARM MANAGEMENT - ENGLISH
    // ============================================

    farm: {
      // Header
      title: "Farm Management",
      category: "FARM STRUCTURE",
      structure: "FARM STRUCTURE",
      description: "Manage farming areas, rows and crab boxes for",
      overview: "Farm management overview",
      managementTitle: "Farm Management",
      managementOverview: "Farm management overview",
      managementDescription:
        "Manage farming areas, rows and crab boxes for {area}.",
      managementDescriptionPrefix:
        "Manage farming areas, rows and crab boxes for",
      allAreas: "all farming areas",
      allFarmingAreas: "all farming areas",

      // Summary
      summary: "Farm management summary",
      areas: "Areas",
      rows: "Rows",
      boxes: "Boxes",
      crabs: "Crabs",

      // General information
      capacity: "Capacity",
      unlimited: "Unlimited",
      active: "Active",
      inactive: "Inactive",
      closed: "Closed",
      selected: "Selected",
      location: "Location",
      region: "Region",
      address: "Address",
      descriptionLabel: "Description",
      status: "Status",
      actions: "Actions",

      // Actions
      edit: "Edit",
      deactivate: "Deactivate",
      reactivate: "Reactivate",
      clear: "Clear",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      retry: "Retry",
      tryAgain: "Try again",
      cancel: "Cancel",
      confirm: "Confirm",
      confirmAction: "Confirm Action",
      processing: "Processing...",
      saving: "Saving...",
      saveChanges: "Save Changes",
      checking: "Checking...",
      deactivating: "Deactivating...",
      reactivating: "Reactivating...",
      clearing: "Clearing...",

      // Generated values
      systemGenerated: "System generated",
      autoGenerated: "Auto generated",

      // Selected items
      selectedArea: "Selected Area",
      selectedRow: "Selected Row",
      selectedBox: "Selected Box",
      selectedItem: "SELECTED ITEM",
      selectedAreaLabel: "SELECTED AREA",
      selectedRowLabel: "SELECTED ROW",
      selectedBoxLabel: "SELECTED BOX",

      // Confirmation modal
      actionCategory: "FARM MANAGEMENT ACTION",
      reviewAction: "Review the action before confirming.",

      // Loading
      loading: "Loading farm management",
      loadingManagement: "Loading farm management",
      loadingStructure: "Loading farm structure...",

      // Errors
      errorCategory: "FARM MANAGEMENT ERROR",
      loadError: "Unable to load farm management",
      unableToLoad: "Unable to load farm management",
      loadErrorDescription:
        "An unexpected error occurred while loading farm data.",
      unexpectedError: "An unexpected error occurred while loading farm data.",
      interrupted: "Data loading interrupted",
      dataLoadingInterrupted: "Data loading interrupted",
      connectionHelp:
        "Check your connection and retry. If the problem continues, check the API response in your browser's developer tools.",

      // Farm structure
      farmingArea: "FARMING AREA",
      farmingRow: "FARMING ROW",
      farmBox: "FARM BOX",
      areaCode: "AREA CODE",
      rowCode: "ROW CODE",
      boxCode: "BOX CODE",
      farmBoxFallback: "Farm box",
      noLocation: "No location",
      noAreaInfo: "No area information",
      parentArea: "Parent area",
      areaSize: "Area Size",
      established: "Established",
      sortOrder: "Sort Order",

      // Box statuses
      boxStatusEmpty: "Empty",
      boxStatusActive: "Active",
      boxStatusOccupied: "Occupied",
      boxStatusMolting: "Molting",
      boxStatusQuarantine: "Quarantine",
      boxStatusMaintenance: "Maintenance",
      boxStatusHarvested: "Harvested",
      boxStatusWatch: "Watch",
      boxWorkflowManaged: "Managed by the crab farming workflow.",

      // Validation
      nameRequired: "Name is required.",
    },

    // ============================================
    // FARMING AREAS - ENGLISH
    // ============================================

    farmAreas: {
      // Overview
      category: "FARMING AREAS",
      overview: "Area Overview",
      overviewDescription: "Select an area to view its rows and boxes.",
      viewAll: "View all areas",
      newArea: "New Area",
      createArea: "Create Area",
      editArea: "Edit Area",
      selectedMessage: "Selected farming area",

      // Empty state
      emptyTitle: "No farming areas available",
      emptyDescription:
        "Create your first farming area to start organizing rows and crab boxes.",
      createFirst: "Create First Area",

      // Form
      areaName: "Area Name",
      namePlaceholder: "e.g. Soft-shell Area A",
      locationPlaceholder: "e.g. North Zone",
      regionPlaceholder: "e.g. Mekong Delta",
      addressPlaceholder: "Farm address",
      descriptionPlaceholder: "Optional farming area description...",
      editDescription: "Update farming area information.",
      createDescription: "Enter information for a new farming area.",

      // Validation
      nameRequired: "Area name is required.",
      invalidSize: "Area size must be a valid non-negative number.",

      // API errors
      updateFailed: "Unable to update farming area.",
      createFailed: "Unable to create farming area.",

      // Deactivate area
      deactivateTitle: "Deactivate Area",
      deactivateDescription:
        "This farming area will remain in the system but will no longer appear in the active area list.",
      deactivateWarning: "Rows, boxes, and historical data are not deleted.",
      containsCrabs:
        "This farming area still contains active crabs. Move or harvest all crabs before deactivating the area.",
      activeRowsRemain:
        "Deactivate all active rows first. {count} active row(s) remain.",
      verifyFailed: "Unable to verify this farming area.",
      deactivateFailed: "Unable to deactivate farming area.",

      // Archived areas
      archivedCategory: "ARCHIVED AREAS",
      archivedTitle: "Inactive Farming Areas",
      archivedDescription: "Reactivate a previously closed farming area.",
      archivedAria: "Archived farming areas",
      archivedRefresh: "Refresh archived areas",
      archivedEmpty: "No archived farming areas",
      archivedEmptyDescription: "Inactive farming areas will appear here.",
      archivedLoadFailed: "Unable to load archived farming areas.",

      // Reactivate area
      reactivateTitle: "Reactivate Area",
      reactivateDescription:
        "This farming area will become active and will appear again in the active farming area list.",
      reactivateWarning:
        "Closed rows inside this area will remain closed and must be reactivated separately.",
      reactivateFailed: "Unable to reactivate farming area.",
    },

    // ============================================
    // FARMING ROWS - ENGLISH
    // ============================================

    farmRows: {
      // Overview
      category: "FARMING ROWS",
      overview: "Row Structure",
      structure: "Row Structure",
      structureDescription: "Manage rows in the selected farming area.",
      manageInArea: "Manage rows in {area}.",
      selectAreaBeforeCreate: "Select a farming area before creating a row.",

      // Selection
      clearSelection: "Clear row",
      clearRow: "Clear row",
      viewAll: "View all rows",

      // Actions
      newRow: "New Row",
      createRow: "Create Row",
      editRow: "Edit Row",
      createFirst: "Create First Row",

      // Select area
      selectArea: "Select a farming area",
      selectAreaDescription:
        "A row must belong to one farming area. Choose an area above or from the global area selector first.",
      selectAreaFirst: "Select a farming area first",

      // Empty state
      emptyTitle: "No farming rows available",
      emptyDescription: "Create the first row for this farming area.",

      // Form
      rowName: "Row Name",
      namePlaceholder: "e.g. Nursery Row 1",
      locationPlaceholder: "e.g. North side",
      capacityHint: "0 = Unlimited capacity",
      sortOrderHint: "Controls the display order of this row.",
      descriptionPlaceholder: "Optional row description...",
      editDescription: "Update the selected farming row.",
      createDescription: "Add a new row to the selected farming area.",

      // Validation
      nameRequired: "Row name is required.",
      areaRequired: "A farming area must be selected.",
      areaChanged:
        "The selected farming area has changed. Close this dialog and try again.",
      differentArea: "This row belongs to a different farming area.",
      invalidCapacity: "Capacity must be a whole number between 0 and 500.",
      invalidSortOrder:
        "Sort order must be a whole number greater than or equal to 0.",
      capacityTooSmall:
        "Capacity cannot be less than the current box count ({count}).",
      capacityBelowBoxes:
        "Capacity cannot be less than the current box count ({count}).",

      // API errors
      updateFailed: "Unable to update farming row.",
      createFailed: "Unable to create farming row.",

      // Deactivate row
      deactivateTitle: "Deactivate Row",
      deactivateDescription:
        "This farming row will remain in the system but will no longer appear in the active row list.",
      deactivateWarning:
        "Existing boxes are not deleted. Reactivate the row later if it needs to be used again.",
      containsCrabs:
        "This farming row still contains active crabs. Move or harvest all crabs before deactivating it.",
      containsOccupiedBoxes: "This row still contains crabs or occupied boxes.",
      deactivateFailed: "Unable to deactivate farming row.",

      // Archived rows
      archivedCategory: "ARCHIVED ROWS",
      archivedTitle: "Inactive Farming Rows",
      archivedAria: "Archived farming rows",
      archivedDescription: "Reactivate previously closed farming rows.",
      archivedEmpty: "No archived farming rows",
      archivedEmptyDescription: "Closed farming rows will appear here.",
      archivedLoadFailed: "Unable to load archived farming rows.",

      // Reactivate row
      reactivateTitle: "Reactivate Row",
      reactivateDescription:
        "This farming row will become active and will appear again in the active row list.",
      reactivateWarning: "Existing boxes remain unchanged.",
      reactivateFailed: "Unable to reactivate farming row.",
      reactivateParentFirst: "Reactivate the parent farming area first.",
      parentMustBeActive:
        "The parent farming area must be active before reactivating this row.",
    },

    // ============================================
    // FARM BOXES - ENGLISH
    // ============================================

    farmBoxes: {
      // Overview
      category: "FARM BOXES",
      inventory: "Box Inventory",
      inventoryAria: "Farm box inventory",
      boxesInside: "Boxes inside {row}.",
      selectRowBeforeCreate: "Select a farming row to view and create boxes.",

      // Search
      search: "Search boxes",
      searchPlaceholder: "Search boxes...",

      // Actions
      newBox: "New Box",
      createBox: "Create Box",
      editBox: "Edit Box",
      createFirst: "Create First Box",

      // Capacity
      selectRowFirst: "Select a row first",
      capacityReached: "Row capacity reached",

      // Select row
      selectRow: "Select a farming row",
      selectRowDescription:
        "A box must belong to one farming row. Select a row above before managing boxes.",

      // Empty state
      emptyTitle: "No boxes available",
      emptyDescription: "Create the first box for this farming row.",
      noSearchResults: "No boxes match your search",
      searchSuggestion: "Try a different code, status or crab tag.",

      // Table
      crabTag: "Crab Tag",
      boxColumn: "Box",
      rowColumn: "Row",

      // Validation
      codeRequired: "Box code is required.",
      rowRequired: "A farming row must be selected.",

      // Box form
      currentStatus: "Current box status",
      editDescription: "Update box information and administrative status.",
      createDescription:
        "Create a new empty box inside the selected farming row.",
      createNotice:
        "A new empty box will be created in the selected farming row.",

      // API errors
      updateFailed: "Unable to update box.",
      createFailed: "Unable to create box.",

      // Clear box
      clearBox: "Clear Box",
      clearDescription:
        "The box will remain in the system and will be reset to the empty state.",
      clearWarning:
        "Only clear this box after its crab has been moved or harvested.",
      containsCrab:
        "This box still contains a crab. Move or harvest the crab before clearing it.",
      alreadyEmpty: "Box is already empty.",
      clearFailed: "Unable to clear box.",
    },
  },

  // =====================================
  // VIETNAMESE
  // =====================================
  vi: {
    nav: {
      dashboard: "Tổng quan",
      monitoring: "Giám sát",
      analytics: "Phân tích",
      farmManagement: "Quản lý trang trại",
      settings: "Cài đặt",
      mainMenu: "MENU CHÍNH",
      adminPortal: "CỔNG QUẢN TRỊ",
      platform: "Nền tảng CrabSense",
      mainNavigation: "Điều hướng chính",
      openNavigation: "Mở menu điều hướng",
      closeNavigation: "Đóng menu điều hướng",
      expandSidebar: "Mở rộng thanh bên",
      collapseSidebar: "Thu gọn thanh bên",
      farmWorkspace: "Không gian quản lý trang trại",
      workspaceDescription: "Giám sát và vận hành trang trại",
      systemMenu: "TÙY CHỌN",
      systemAdministration: "Quản trị hệ thống",
      systemOverview: "Tổng quan hệ thống",
      deviceManagement: "Quản lý thiết bị",
      cameraRecording: "Camera và ghi hình",
      aiServices: "Dịch vụ AI",
      storageBackup: "Lưu trữ và sao lưu",
      deployment: "Triển khai",
      securityAccess: "Bảo mật và truy cập",
      systemLogs: "Nhật ký hệ thống",
      deviceAi: "THIẾT BỊ VÀ AI",
      infrastructure: "HẠ TẦNG",
      securityGroup: "BẢO MẬT",
      systemWorkspace: "Hạ tầng hệ thống",
      systemWorkspaceDescription:
        "Camera, cảm biến, bộ điều khiển và dịch vụ AI. Cấu hình lịch ghi hình và theo dõi trạng thái thiết bị. Quản lý lưu trữ, sao lưu, triển khai và bảo mật hệ thống.",
      systemRole: "System Administrator",
    },

    common: {
      save: "Lưu cài đặt",
      cancel: "Hủy",
      refresh: "Làm mới",
      logout: "Đăng xuất",
      loggingOut: "Đang đăng xuất...",
      administrator: "Quản trị viên",
    },

    login: {
      farmTitle: "TRẠI NUÔI CUA LỘT THÔNG MINH",
      tagline: "Công nghệ đồng hành — Cua khỏe mỗi ngày",
      featureMonitor: "Giám sát\nthông minh",
      featureManage: "Quản lý\ndễ dàng",
      featureEnvironment: "Môi trường\nổn định",
      featureYield: "Năng suất\nbền vững",
      welcome: "Đăng nhập quản trị",
      description: "Theo dõi hệ thống ngay trên bảng quản trị.",
      username: "Tên đăng nhập",
      usernamePlaceholder: "Tên tài khoản quản trị",
      password: "Mật khẩu",
      passwordPlaceholder: "Nhập mật khẩu",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      showPassword: "Hiện mật khẩu",
      hidePassword: "Ẩn mật khẩu",
      signIn: "Đăng nhập",
      signingIn: "Đang đăng nhập...",
      or: "hoặc",
      register: "Chưa có tài khoản? Đăng ký",
      loginFailedTitle: "Đăng nhập không thành công",
      dismissError: "Đóng",
      requiredUsername: "Vui lòng nhập tên đăng nhập",
      requiredPassword: "Vui lòng nhập mật khẩu",
      noAdminAccess:
        "Tài khoản không thuộc Farm Administrator, Farm Manager, Farm Staff hoặc System Administrator.",
      invalidCredentials:
        "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra và thử lại.",
      copyright: "© 2026 CrabSense • Trại nuôi cua lột",
      policy: "Chính sách",
      terms: "Điều khoản",
      help: "Trợ giúp",
      contact: "Liên hệ",
    },

    settings: {
      eyebrow: "TÙY CHỌN HỆ THỐNG",

      title: "Cài đặt",

      description: "Quản lý tùy chọn hiển thị và giám sát.",

      display: "Tùy chọn hiển thị",

      displayDescription: "Chọn ngôn ngữ giao diện.",

      darkMode: "Chế độ tối",

      darkModeDescription: "Sử dụng giao diện tối của CrabSense.",

      language: "Ngôn ngữ",

      languageDescription: "Chọn ngôn ngữ giao diện.",

      monitoring: "Tùy chọn giám sát",

      monitoringDescription: "Thiết lập các tùy chọn giám sát.",

      refreshInterval: "Chu kỳ cập nhật",

      refreshDescription: "Thời gian tự động cập nhật từ 5–300 giây.",

      seconds: "giây",

      alerts: "Bật cảnh báo",

      alertsDescription: "Tùy chọn thông báo (chưa tích hợp).",

      unsaved: "Bạn có thay đổi chưa lưu.",

      upToDate: "Các tùy chọn đã được lưu.",

      saved: "Đã lưu cài đặt thành công.",

      saveFailed: "Không thể lưu cài đặt.",

      invalidInterval: "Chu kỳ cập nhật phải từ 5 đến 300 giây.",
    },

    areaSelector: {
      label: "KHU VỰC NUÔI",
      loading: "Đang tải khu vực...",
      loadError: "Không thể tải danh sách khu vực nuôi",
      allAreas: "Tất cả khu vực nuôi",
      viewCompleteSystem: "Xem toàn bộ hệ thống",
      boxes: "hộp",
      crabs: "cua",
      noActiveAreas: "Không có khu vực nuôi đang hoạt động",
    },

    analytics: {
      // Header
      badge: "PHÂN TÍCH TRANG TRẠI",
      title: "Phân tích hiệu suất",
      description:
        "Phân tích tỷ lệ sống, thu hoạch, lột xác và hiệu quả vận hành cho",
      allAreas: "tất cả khu vực nuôi",
      refresh: "Làm mới",
      refreshing: "Đang làm mới...",

      // Date filter
      dateRange: "Khoảng thời gian phân tích",
      fromDate: "Từ ngày",
      toDate: "Đến ngày",

      // Common
      noData: "Không có dữ liệu",
      unknownDate: "Không rõ ngày",
      loading: "Đang tải dữ liệu phân tích",
      loadingDescription: "Đang tải dữ liệu phân tích, vui lòng đợi.",
      crabs: "con cua",

      // KPI Grid
      kpiOverview: "Các chỉ số hiệu suất chính",
      survivalRate: "Tỷ lệ sống",
      harvestWeight: "Khối lượng thu hoạch",
      moltingRate: "Tỷ lệ lột xác",
      harvestRate: "Tỷ lệ thu hoạch",
      aliveCrabs: "con cua còn sống",
      harvestedCrabs: "con cua đã thu hoạch",
      moltedCrabs: "con cua đã lột xác",
      operationalEfficiencyDescription: "Hiệu quả vận hành",

      // Harvest Trend Chart
      harvestCategory: "THU HOẠCH",
      harvestTrend: "Xu hướng thu hoạch",
      harvestTrendDescription: "Số lượng và khối lượng theo ngày thu hoạch.",
      noHarvestData: "Chưa có dữ liệu thu hoạch.",
      harvestChartAria:
        "Biểu đồ xu hướng thu hoạch theo khối lượng và số lượng cua từng ngày",
      weightKg: "Khối lượng (kg)",
      quantityCrabs: "Số lượng (con cua)",

      // Molting Panel
      moltingCategory: "LỘT XÁC",
      moltingPerformance: "Hiệu suất lột xác",
      selectedAreaDescription: "Thống kê lột xác tại",
      selectedFarmingArea: "khu vực nuôi đã chọn",
      overallMoltingDescription: "Tình hình lột xác trên toàn trang trại",
      noMoltingData: "Chưa có dữ liệu lột xác",
      noMoltingBreakdown: "Không có dữ liệu lột xác cho khu vực nuôi đã chọn.",
      moltingRateDescription: "Dựa trên dữ liệu lột xác đã ghi nhận.",
      totalCrabs: "Tổng số cua",
      molting: "Đang lột xác",
      molted: "Đã lột xác",

      // Efficiency Panel
      operationsCategory: "VẬN HÀNH",
      operationalEfficiency: "Hiệu quả vận hành",
      efficiencyDescription: "Hiệu suất trong khoảng thời gian đã chọn.",
      aliveRate: "Tỷ lệ còn sống",
      mortalityRate: "Tỷ lệ tử vong",

      // Survival Panel
      survivalCategory: "TỶ LỆ SỐNG",
      populationOutcome: "Tình trạng quần thể cua",
      populationDescription:
        "Kết quả sống, tử vong và thu hoạch của nhóm cua được chọn.",
      survival: "Còn sống",
      mortality: "Tử vong",
      harvested: "Đã thu hoạch",
      total: "Tổng số",
      alive: "Còn sống",
      dead: "Đã chết",

      // Error
      loadError: "Không thể tải dữ liệu phân tích",
      unexpectedError: "Đã xảy ra lỗi khi tải dữ liệu phân tích.",
      retry: "Thử lại",
      retrying: "Đang thử lại...",

      dateRangeNote:
        "Khoảng thời gian được áp dụng cho báo cáo Tỷ lệ sống và Hiệu quả vận hành.",
      reportsAria: "Các báo cáo phân tích",
    },

    dashboard: {
      // Header
      overviewBadge: "TỔNG QUAN TRANG TRẠI",
      overviewTitle: "Tổng quan trang trại",
      overviewDescription:
        "Theo dõi hoạt động nuôi cua, sức khỏe hệ thống và các hoạt động gần đây trên CrabSense.",
      overviewAria: "Tổng quan bảng điều khiển",
      lastUpdated: "Cập nhật lần cuối",
      refresh: "Làm mới",
      refreshing: "Đang làm mới...",
      refreshAria: "Làm mới dữ liệu bảng điều khiển",

      farmHealthAria: "Tổng quan sức khỏe trang trại",
      farmOperationsAria: "Hoạt động vận hành trang trại",

      // KPI
      kpiAria: "Các chỉ số chính của trang trại",
      totalBoxes: "Tổng số hộp",
      registeredBoxes: "Số hộp nuôi đã đăng ký",
      liveCrabs: "Cua còn sống",
      currentlyAlive: "Số cua hiện còn sống",
      activeBoxes: "Hộp đang hoạt động",
      activeBoxesDescription:
        "Đang hoạt động, có cua lột xác hoặc đang chứa cua",
      openAlerts: "Cảnh báo chưa xử lý",
      requiresAttention: "Cần chú ý",
      noActiveAlerts: "Không có cảnh báo đang hoạt động",
      action: "CẦN XỬ LÝ",
      clear: "BÌNH THƯỜNG",
      iotOnline: "IoT trực tuyến",
      connectedDevices: "Thiết bị đã kết nối",

      // Farm Health
      farmHealthCategory: "SỨC KHỎE TRANG TRẠI",
      overallHealth: "Sức khỏe tổng thể",
      overallHealthScore: "Điểm sức khỏe tổng thể của trang trại",
      unknown: "Không xác định",

      // Health Breakdown
      systemHealthCategory: "SỨC KHỎE HỆ THỐNG",
      healthBreakdown: "Chi tiết sức khỏe hệ thống",
      waterQuality: "Chất lượng nước",
      crabHealth: "Sức khỏe cua",
      deviceStatus: "Trạng thái thiết bị",

      // Health status
      excellent: "Xuất sắc",
      healthy: "Khỏe mạnh",
      good: "Tốt",
      normal: "Bình thường",
      warning: "Cảnh báo",
      critical: "Nguy cấp",
      danger: "Nguy hiểm",
      poor: "Kém",

      // Recent Activity
      activityCategory: "HOẠT ĐỘNG",
      recentActivity: "Hoạt động gần đây",
      noRecentActivity: "Chưa có hoạt động gần đây.",
      timeUnavailable: "Không có thông tin thời gian",

      // Today's Tasks
      operationsCategory: "VẬN HÀNH",
      todaysTasks: "Công việc hôm nay",
      noTasks: "Hôm nay chưa có công việc vận hành.",
      completed: "Đã hoàn thành",
      pending: "Chưa hoàn thành",
      priorityHigh: "Cao",
      priorityMedium: "Trung bình",
      priorityLow: "Thấp",

      // Error
      loadError: "Không thể tải bảng điều khiển",
      unexpectedError: "Đã xảy ra lỗi không mong muốn.",
      retry: "Thử lại",

      // Loading
      loading: "Đang tải bảng điều khiển",
      loadingDescription: "Đang tải dữ liệu bảng điều khiển, vui lòng đợi.",
    },

    monitoring: {
      // Header
      badge: "GIÁM SÁT TRANG TRẠI",
      title: "Giám sát môi trường và hộp nuôi",
      description:
        "Theo dõi điều kiện môi trường, trạng thái thiết bị và sức khỏe hộp nuôi tại",
      allAreas: "tất cả khu vực nuôi",
      overview: "Tổng quan giám sát",
      lastSynced: "Đồng bộ lần cuối",
      notSynced: "Chưa đồng bộ",
      timeUnavailable: "Không có thông tin thời gian",
      refresh: "Làm mới",
      refreshing: "Đang làm mới...",

      // Environment
      environmentMetrics: "Các chỉ số giám sát môi trường",
      waterTemperature: "Nhiệt độ nước",
      temperatureDescription: "Nhiệt độ nước trong khu vực nuôi",
      phLevel: "Độ pH",
      phDescription: "Giá trị pH hiện tại",
      dissolvedOxygen: "Oxy hòa tan",
      oxygenDescription: "Nồng độ oxy hòa tan hiện tại",
      devicesOnline: "Thiết bị trực tuyến",
      noRegisteredDevices: "Chưa có thiết bị được đăng ký",
      devicesOnlineCount: "{online}/{total} thiết bị đang trực tuyến",
      autoRefresh: "Tự động làm mới",
      every: "Mỗi",
      syncingData: "Đang đồng bộ dữ liệu giám sát...",
      refreshActive: "Chức năng tự động làm mới đang hoạt động",

      // Summary
      boxSummary: "Tổng quan trạng thái hộp nuôi",
      totalBoxes: "Tổng số hộp",
      healthy: "Khỏe mạnh",
      warning: "Cảnh báo",
      critical: "Nguy cấp",
      offline: "Ngoại tuyến",
      unknown: "Không xác định",
      online: "Trực tuyến",
      good: "Tốt",
      excellent: "Rất tốt",
      danger: "Nguy hiểm",
      normal: "Bình thường",

      // Box table
      boxStatus: "TRẠNG THÁI HỘP NUÔI",
      boxMonitoring: "Giám sát hộp nuôi",
      boxDescription:
        "Theo dõi sức khỏe, chất lượng nước, thiết bị và cảnh báo của các hộp nuôi.",
      columnBox: "Hộp nuôi",
      columnHealth: "Sức khỏe",
      columnScore: "Điểm",
      columnWater: "Nước",
      columnDevice: "Thiết bị",
      columnAlerts: "Cảnh báo",
      noBoxes: "Không có hộp nuôi trong khu vực này.",
      noMatchingBoxes: "Không có hộp nuôi phù hợp với bộ lọc hiện tại.",

      // Search and filters
      searchAria: "Tìm kiếm hộp nuôi đang giám sát",
      searchPlaceholder: "Tìm hộp nuôi, hàng hoặc khu vực...",
      filterAria: "Lọc hộp nuôi theo trạng thái",
      allStatus: "Tất cả trạng thái",

      // Errors
      loadError: "Không thể tải dữ liệu giám sát",
      unexpectedError: "Đã xảy ra lỗi khi tải dữ liệu giám sát.",
      retry: "Thử lại",
      retrying: "Đang thử lại...",

      // Loading
      loading: "Đang tải dữ liệu giám sát",
      loadingDescription: "Đang tải dữ liệu giám sát, vui lòng đợi.",
    },

    // ============================================
    // FARM MANAGEMENT - VIETNAMESE
    // ============================================

    farm: {
      // Header
      title: "Quản lý trang trại",
      category: "CẤU TRÚC TRANG TRẠI",
      structure: "CẤU TRÚC TRANG TRẠI",
      description: "Quản lý khu vực nuôi, hàng nuôi và hộp nuôi cua tại",
      overview: "Tổng quan quản lý trang trại",
      managementTitle: "Quản lý trang trại",
      managementOverview: "Tổng quan quản lý trang trại",
      managementDescription:
        "Quản lý khu vực nuôi, hàng nuôi và hộp nuôi cua tại {area}.",
      managementDescriptionPrefix:
        "Quản lý khu vực nuôi, hàng nuôi và hộp nuôi cua tại",
      allAreas: "tất cả khu vực nuôi",
      allFarmingAreas: "tất cả khu vực nuôi",

      // Summary
      summary: "Tổng quan quản lý trang trại",
      areas: "Khu vực",
      rows: "Hàng nuôi",
      boxes: "Hộp nuôi",
      crabs: "Cua",

      // General information
      capacity: "Sức chứa",
      unlimited: "Không giới hạn",
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      closed: "Đã đóng",
      selected: "Đã chọn",
      location: "Vị trí",
      region: "Vùng",
      address: "Địa chỉ",
      descriptionLabel: "Mô tả",
      status: "Trạng thái",
      actions: "Thao tác",

      // Actions
      edit: "Chỉnh sửa",
      deactivate: "Ngừng hoạt động",
      reactivate: "Kích hoạt lại",
      clear: "Làm trống",
      refresh: "Làm mới",
      refreshing: "Đang làm mới...",
      retry: "Thử lại",
      tryAgain: "Thử lại",
      cancel: "Hủy",
      confirm: "Xác nhận",
      confirmAction: "Xác nhận thao tác",
      processing: "Đang xử lý...",
      saving: "Đang lưu...",
      saveChanges: "Lưu thay đổi",
      checking: "Đang kiểm tra...",
      deactivating: "Đang ngừng hoạt động...",
      reactivating: "Đang kích hoạt lại...",
      clearing: "Đang làm trống...",

      // Generated values
      systemGenerated: "Hệ thống tự tạo",
      autoGenerated: "Tự động tạo",

      // Selected items
      selectedArea: "Khu vực đã chọn",
      selectedRow: "Hàng nuôi đã chọn",
      selectedBox: "Hộp nuôi đã chọn",
      selectedItem: "MỤC ĐÃ CHỌN",
      selectedAreaLabel: "KHU VỰC ĐÃ CHỌN",
      selectedRowLabel: "HÀNG NUÔI ĐÃ CHỌN",
      selectedBoxLabel: "HỘP NUÔI ĐÃ CHỌN",

      // Confirmation modal
      actionCategory: "THAO TÁC QUẢN LÝ TRANG TRẠI",
      reviewAction: "Kiểm tra thao tác trước khi xác nhận.",

      // Loading
      loading: "Đang tải quản lý trang trại",
      loadingManagement: "Đang tải dữ liệu quản lý trang trại",
      loadingStructure: "Đang tải cấu trúc trang trại...",

      // Errors
      errorCategory: "LỖI QUẢN LÝ TRANG TRẠI",
      loadError: "Không thể tải dữ liệu quản lý trang trại",
      unableToLoad: "Không thể tải dữ liệu quản lý trang trại",
      loadErrorDescription: "Đã xảy ra lỗi khi tải dữ liệu trang trại.",
      unexpectedError:
        "Đã xảy ra lỗi không mong muốn khi tải dữ liệu trang trại.",
      interrupted: "Quá trình tải dữ liệu bị gián đoạn",
      dataLoadingInterrupted: "Quá trình tải dữ liệu bị gián đoạn",
      connectionHelp:
        "Kiểm tra kết nối và thử lại. Nếu lỗi tiếp diễn, hãy kiểm tra phản hồi API trong công cụ dành cho nhà phát triển của trình duyệt.",

      // Farm structure
      farmingArea: "KHU VỰC NUÔI",
      farmingRow: "HÀNG NUÔI",
      farmBox: "HỘP NUÔI",
      areaCode: "MÃ KHU VỰC",
      rowCode: "MÃ HÀNG",
      boxCode: "MÃ HỘP",
      farmBoxFallback: "Hộp nuôi",
      noLocation: "Chưa có vị trí",
      noAreaInfo: "Chưa có thông tin khu vực",
      parentArea: "Khu vực cha",
      areaSize: "Diện tích khu vực",
      established: "Ngày thành lập",
      sortOrder: "Thứ tự hiển thị",

      // Box statuses
      boxStatusEmpty: "Trống",
      boxStatusActive: "Đang hoạt động",
      boxStatusOccupied: "Đang có cua",
      boxStatusMolting: "Đang lột xác",
      boxStatusQuarantine: "Cách ly",
      boxStatusMaintenance: "Bảo trì",
      boxStatusHarvested: "Đã thu hoạch",
      boxStatusWatch: "Cần theo dõi",
      boxWorkflowManaged: "Trạng thái được quản lý bởi quy trình nuôi cua.",

      // Validation
      nameRequired: "Tên là bắt buộc.",
    },

    // ============================================
    // FARMING AREAS - VIETNAMESE
    // ============================================

    farmAreas: {
      // Overview
      category: "KHU VỰC NUÔI",
      overview: "Tổng quan khu vực nuôi",
      overviewDescription: "Chọn khu vực để xem các hàng nuôi và hộp nuôi.",
      viewAll: "Xem tất cả khu vực",
      newArea: "Thêm khu vực",
      createArea: "Tạo khu vực",
      editArea: "Chỉnh sửa khu vực",
      selectedMessage: "Khu vực nuôi đang chọn",

      // Empty state
      emptyTitle: "Chưa có khu vực nuôi",
      emptyDescription:
        "Tạo khu vực nuôi đầu tiên để bắt đầu tổ chức các hàng nuôi và hộp cua.",
      createFirst: "Tạo khu vực đầu tiên",

      // Form
      areaName: "Tên khu vực",
      namePlaceholder: "Ví dụ: Khu cua lột A",
      locationPlaceholder: "Ví dụ: Khu phía Bắc",
      regionPlaceholder: "Ví dụ: Đồng bằng sông Cửu Long",
      addressPlaceholder: "Địa chỉ trang trại",
      descriptionPlaceholder: "Mô tả khu vực nuôi (không bắt buộc)...",
      editDescription: "Cập nhật thông tin khu vực nuôi.",
      createDescription: "Nhập thông tin cho khu vực nuôi mới.",

      // Validation
      nameRequired: "Vui lòng nhập tên khu vực.",
      invalidSize: "Diện tích phải là số hợp lệ không âm.",

      // API errors
      updateFailed: "Không thể cập nhật khu vực nuôi.",
      createFailed: "Không thể tạo khu vực nuôi.",

      // Deactivate area
      deactivateTitle: "Ngừng hoạt động khu vực",
      deactivateDescription:
        "Khu vực này vẫn được lưu trong hệ thống nhưng không còn xuất hiện trong danh sách khu vực đang hoạt động.",
      deactivateWarning:
        "Các hàng nuôi, hộp nuôi và dữ liệu lịch sử sẽ không bị xóa.",
      containsCrabs:
        "Khu vực này vẫn còn cua đang nuôi. Hãy chuyển hoặc thu hoạch toàn bộ cua trước khi ngừng hoạt động.",
      activeRowsRemain:
        "Hãy ngừng hoạt động tất cả hàng nuôi trước. Hiện còn {count} hàng đang hoạt động.",
      verifyFailed: "Không thể kiểm tra khu vực nuôi này.",
      deactivateFailed: "Không thể ngừng hoạt động khu vực nuôi.",

      // Archived areas
      archivedCategory: "KHU VỰC ĐÃ LƯU TRỮ",
      archivedTitle: "Khu vực nuôi ngừng hoạt động",
      archivedDescription: "Kích hoạt lại khu vực nuôi đã đóng trước đó.",
      archivedAria: "Các khu vực nuôi đã lưu trữ",
      archivedRefresh: "Làm mới khu vực đã lưu trữ",
      archivedEmpty: "Chưa có khu vực đã lưu trữ",
      archivedEmptyDescription:
        "Các khu vực ngừng hoạt động sẽ xuất hiện tại đây.",
      archivedLoadFailed: "Không thể tải danh sách khu vực đã lưu trữ.",

      // Reactivate area
      reactivateTitle: "Kích hoạt lại khu vực",
      reactivateDescription:
        "Khu vực này sẽ hoạt động trở lại và xuất hiện trong danh sách khu vực nuôi đang hoạt động.",
      reactivateWarning:
        "Những hàng nuôi đã đóng trong khu vực này vẫn được giữ ở trạng thái đóng và cần kích hoạt riêng.",
      reactivateFailed: "Không thể kích hoạt lại khu vực nuôi.",
    },

    // ============================================
    // FARMING ROWS - VIETNAMESE
    // ============================================

    farmRows: {
      // Overview
      category: "HÀNG NUÔI",
      overview: "Cấu trúc hàng nuôi",
      structure: "Cấu trúc hàng nuôi",
      structureDescription: "Quản lý các hàng nuôi trong khu vực đang chọn.",
      manageInArea: "Quản lý các hàng nuôi trong {area}.",
      selectAreaBeforeCreate: "Chọn khu vực nuôi trước khi tạo hàng nuôi.",

      // Selection
      clearSelection: "Bỏ chọn hàng",
      clearRow: "Bỏ chọn hàng",
      viewAll: "Xem tất cả hàng nuôi",

      // Actions
      newRow: "Thêm hàng nuôi",
      createRow: "Tạo hàng nuôi",
      editRow: "Chỉnh sửa hàng nuôi",
      createFirst: "Tạo hàng nuôi đầu tiên",

      // Select area
      selectArea: "Chọn khu vực nuôi",
      selectAreaDescription:
        "Mỗi hàng nuôi phải thuộc một khu vực. Hãy chọn khu vực phía trên hoặc trong bộ chọn khu vực chung.",
      selectAreaFirst: "Vui lòng chọn khu vực nuôi trước",

      // Empty state
      emptyTitle: "Chưa có hàng nuôi",
      emptyDescription: "Tạo hàng nuôi đầu tiên cho khu vực này.",

      // Form
      rowName: "Tên hàng nuôi",
      namePlaceholder: "Ví dụ: Hàng ươm số 1",
      locationPlaceholder: "Ví dụ: Phía Bắc",
      capacityHint: "0 = Sức chứa không giới hạn",
      sortOrderHint: "Điều chỉnh thứ tự hiển thị của hàng nuôi.",
      descriptionPlaceholder: "Mô tả hàng nuôi (không bắt buộc)...",
      editDescription: "Cập nhật thông tin hàng nuôi đã chọn.",
      createDescription: "Thêm hàng mới vào khu vực nuôi đã chọn.",

      // Validation
      nameRequired: "Vui lòng nhập tên hàng nuôi.",
      areaRequired: "Vui lòng chọn một khu vực nuôi.",
      areaChanged:
        "Khu vực đang chọn đã thay đổi. Hãy đóng hộp thoại và thử lại.",
      differentArea: "Hàng nuôi này thuộc một khu vực khác.",
      invalidCapacity: "Sức chứa phải là số nguyên từ 0 đến 500.",
      invalidSortOrder:
        "Thứ tự hiển thị phải là số nguyên lớn hơn hoặc bằng 0.",
      capacityTooSmall:
        "Sức chứa không được nhỏ hơn số hộp hiện tại ({count}).",
      capacityBelowBoxes:
        "Sức chứa không được nhỏ hơn số hộp hiện tại ({count}).",

      // API errors
      updateFailed: "Không thể cập nhật hàng nuôi.",
      createFailed: "Không thể tạo hàng nuôi.",

      // Deactivate row
      deactivateTitle: "Ngừng hoạt động hàng nuôi",
      deactivateDescription:
        "Hàng nuôi này vẫn được lưu trong hệ thống nhưng không xuất hiện trong danh sách hàng đang hoạt động.",
      deactivateWarning:
        "Các hộp nuôi hiện có không bị xóa. Bạn có thể kích hoạt lại hàng nuôi khi cần.",
      containsCrabs:
        "Hàng nuôi này vẫn còn cua. Hãy chuyển hoặc thu hoạch hết cua trước khi ngừng hoạt động.",
      containsOccupiedBoxes: "Hàng nuôi này vẫn còn cua hoặc hộp đang có cua.",
      deactivateFailed: "Không thể ngừng hoạt động hàng nuôi.",

      // Archived rows
      archivedCategory: "HÀNG NUÔI ĐÃ LƯU TRỮ",
      archivedTitle: "Hàng nuôi ngừng hoạt động",
      archivedAria: "Các hàng nuôi đã lưu trữ",
      archivedDescription: "Kích hoạt lại các hàng nuôi đã đóng trước đó.",
      archivedEmpty: "Chưa có hàng nuôi đã lưu trữ",
      archivedEmptyDescription: "Các hàng nuôi đã đóng sẽ xuất hiện tại đây.",
      archivedLoadFailed: "Không thể tải danh sách hàng nuôi đã lưu trữ.",

      // Reactivate row
      reactivateTitle: "Kích hoạt lại hàng nuôi",
      reactivateDescription:
        "Hàng nuôi này sẽ hoạt động trở lại và xuất hiện trong danh sách hàng đang hoạt động.",
      reactivateWarning: "Trạng thái của các hộp hiện có không thay đổi.",
      reactivateFailed: "Không thể kích hoạt lại hàng nuôi.",
      reactivateParentFirst: "Hãy kích hoạt lại khu vực nuôi cha trước.",
      parentMustBeActive:
        "Khu vực nuôi cha phải hoạt động trước khi kích hoạt lại hàng này.",
    },

    // ============================================
    // FARM BOXES - VIETNAMESE
    // ============================================

    farmBoxes: {
      // Overview
      category: "HỘP NUÔI",
      inventory: "Danh sách hộp nuôi",
      inventoryAria: "Danh sách quản lý hộp nuôi",
      boxesInside: "Các hộp nuôi trong {row}.",
      selectRowBeforeCreate: "Chọn hàng nuôi để xem và tạo hộp nuôi.",

      // Search
      search: "Tìm hộp nuôi",
      searchPlaceholder: "Tìm kiếm hộp nuôi...",

      // Actions
      newBox: "Thêm hộp nuôi",
      createBox: "Tạo hộp nuôi",
      editBox: "Chỉnh sửa hộp nuôi",
      createFirst: "Tạo hộp nuôi đầu tiên",

      // Capacity
      selectRowFirst: "Vui lòng chọn hàng nuôi trước",
      capacityReached: "Hàng nuôi đã đạt sức chứa tối đa",

      // Select row
      selectRow: "Chọn hàng nuôi",
      selectRowDescription:
        "Mỗi hộp phải thuộc một hàng nuôi. Hãy chọn hàng nuôi phía trên trước khi quản lý hộp.",

      // Empty state
      emptyTitle: "Chưa có hộp nuôi",
      emptyDescription: "Tạo hộp nuôi đầu tiên cho hàng này.",
      noSearchResults: "Không tìm thấy hộp phù hợp",
      searchSuggestion: "Hãy thử mã hộp, trạng thái hoặc mã thẻ cua khác.",

      // Table
      crabTag: "Mã thẻ cua",
      boxColumn: "Hộp nuôi",
      rowColumn: "Hàng nuôi",

      // Validation
      codeRequired: "Vui lòng nhập mã hộp.",
      rowRequired: "Vui lòng chọn một hàng nuôi.",

      // Box form
      currentStatus: "Trạng thái hộp hiện tại",
      editDescription: "Cập nhật thông tin và trạng thái quản lý của hộp.",
      createDescription: "Tạo hộp trống mới trong hàng nuôi đã chọn.",
      createNotice: "Một hộp trống mới sẽ được tạo trong hàng nuôi đã chọn.",

      // API errors
      updateFailed: "Không thể cập nhật hộp nuôi.",
      createFailed: "Không thể tạo hộp nuôi.",

      // Clear box
      clearBox: "Làm trống hộp",
      clearDescription:
        "Hộp vẫn được giữ trong hệ thống và được đặt lại về trạng thái trống.",
      clearWarning:
        "Chỉ làm trống sau khi cua trong hộp đã được chuyển đi hoặc thu hoạch.",
      containsCrab:
        "Hộp này vẫn còn cua. Hãy chuyển hoặc thu hoạch cua trước khi làm trống.",
      alreadyEmpty: "Hộp đã ở trạng thái trống.",
      clearFailed: "Không thể làm trống hộp.",
    },
  },
};
