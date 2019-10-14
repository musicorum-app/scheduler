module.exports = {
  ENDPOINT_NOT_FOUND: {
    error: {
      code: 'S#404#001',
      message: 'Endpoint not found.',
      error: 'ENDPOINT_NOT_FOUND'
    }
  },

  INVALID_TOKEN: {
    error: {
      code: 'S#401#002',
      message: 'Invalid token.',
      error: 'INVALID_TOKEN'
    }
  },

  TASK_NOT_FOUND: {
    error: {
      code: 'S#404#003',
      message: 'Task not found.',
      error: 'TASK_NOT_FOUND'
    }
  },

  USER_NOT_FOUND: {
    error: {
      code: 'S#404#004',
      message: 'User not found.',
      error: 'USER_NOT_FOUND'
    }
  },

  SCHEDULE_NOT_FOUND: {
    error: {
      code: 'S#404#005',
      message: 'Schedule not found.',
      error: 'SCHEDULE_NOT_FOUND'
    }
  },

  SCHEDULE_ALREADY_RUNNING: {
    error: {
      code: 'S#404#006',
      message: 'Schedule already running.',
      error: 'SCHEDULE_ALREADY_RUNNING'
    }
  },

  INTERNAL_ERROR: {
    error: {
      code: 'S#500#007',
      message: 'Internal server error.',
      error: 'INTERNAL_ERROR'
    }
  }
}
