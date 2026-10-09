function RowForm({
    form,
    onChange,
    disabled,
  }) {
    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
      } = event.target
  
      onChange(name, value)
    }
  
    return (
      <div className="row-form">
        <div className="row-form-group row-form-full">
          <label htmlFor="row-name">
            Row Name
            <span>*</span>
          </label>
  
          <input
            id="row-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Nursery Row 1"
            disabled={disabled}
            autoFocus
          />
        </div>
  
        <div className="row-form-grid">
          <div className="row-form-group">
            <label htmlFor="row-location">
              Location
            </label>
  
            <input
              id="row-location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. North side"
              disabled={disabled}
            />
          </div>
  
          <div className="row-form-group">
            <label htmlFor="row-capacity">
              Capacity
              <small>
                {' '}0 = unlimited
              </small>
            </label>
  
            <input
              id="row-capacity"
              name="capacity"
              type="number"
              min="0"
              max="500"
              step="1"
              value={form.capacity}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>
        </div>
  
        <div className="row-form-group row-form-full">
          <label htmlFor="row-sort-order">
            Sort Order
          </label>
  
          <input
            id="row-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            value={form.sortOrder}
            onChange={handleChange}
            disabled={disabled}
          />
  
          <small className="row-form-help">
            Controls the display order of this row.
          </small>
        </div>
  
        <div className="row-form-group row-form-full">
          <label htmlFor="row-description">
            Description
          </label>
  
          <textarea
            id="row-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional row description..."
            rows={4}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }
  
  export default RowForm