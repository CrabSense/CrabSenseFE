function RecentActivity({ activities }) {
    return (
      <article className="dashboard-card">
        <div className="dashboard-card-heading">
          <div>
            <p className="dashboard-eyebrow">
              ACTIVITY
            </p>
  
            <h3>Recent Activity</h3>
          </div>
        </div>
  
        {activities.length === 0 ? (
          <div className="dashboard-empty">
            No recent activity.
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div
                className="activity-item"
                key={activity.id}
              >
                <div className="activity-dot" />
  
                <div className="activity-content">
                  <strong>
                    {activity.title}
                  </strong>
  
                  <p>
                    {activity.description}
                  </p>
  
                  <time>
                    {new Date(
                      activity.timestamp
                    ).toLocaleString()}
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    )
  }
  
  export default RecentActivity