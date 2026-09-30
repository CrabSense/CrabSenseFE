function TodayTasks({ tasks }) {
    return (
      <article className="dashboard-card">
        <div className="dashboard-card-heading">
          <div>
            <p className="dashboard-eyebrow">
              OPERATIONS
            </p>
  
            <h3>Today's Tasks</h3>
          </div>
  
          <span className="dashboard-count">
            {tasks.length}
          </span>
        </div>
  
        {tasks.length === 0 ? (
          <div className="dashboard-empty">
            No operational tasks today.
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div
                className="task-item"
                key={task.id}
              >
                <div
                  className={`task-status-dot ${
                    task.isCompleted ? 'completed' : ''
                  }`}
                />
  
                <div className="task-content">
                  <strong>{task.title}</strong>
  
                  <span>{task.target}</span>
                </div>
  
                <span className={`priority ${task.priority?.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    )
  }
  
  export default TodayTasks