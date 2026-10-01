import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from 'recharts'
  
  function HarvestTrendChart({
    data = [],
  }) {
    const chartData = data.map((item) => ({
      date: new Date(
        item.date
      ).toLocaleDateString(),
      quantity: item.quantity,
      weightKg: Number(item.weightKg),
    }))
  
    return (
      <article className="analytics-panel">
        <div className="analytics-panel-heading">
          <div>
            <span>
              HARVEST
            </span>
  
            <h2>
              Harvest Trend
            </h2>
  
            <p>
              Quantity and weight by harvest date.
            </p>
          </div>
        </div>
  
        {chartData.length === 0 ? (
          <div className="analytics-empty">
            No harvest data available.
          </div>
        ) : (
          <div className="analytics-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
  
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: '#667169',
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
  
                <YAxis
                  tick={{
                    fill: '#667169',
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
  
                <Tooltip
                  contentStyle={{
                    background: '#0d1510',
                    border:
                      '1px solid rgba(119,255,0,.12)',
                    borderRadius: 8,
                  }}
                />
  
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  name="Weight (kg)"
                  stroke="#77ff00"
                  strokeWidth={2}
                  dot={false}
                />
  
                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="Quantity"
                  stroke="#8a958d"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </article>
    )
  }
  
  export default HarvestTrendChart