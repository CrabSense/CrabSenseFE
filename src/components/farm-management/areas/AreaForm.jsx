function AreaForm({
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
      <div className="area-form">
        <div className="area-form-group area-form-full">
          <label htmlFor="area-name">
            Area Name
            <span>*</span>
          </label>
  
          <input
            id="area-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Soft-shell Area A"
            disabled={disabled}
            autoFocus
          />
        </div>
  
        <div className="area-form-grid">
          <div className="area-form-group">
            <label htmlFor="area-location">
              Location
            </label>
  
            <input
              id="area-location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. North Zone"
              disabled={disabled}
            />
          </div>
  
          <div className="area-form-group">
            <label htmlFor="area-region">
              Region
            </label>
  
            <input
              id="area-region"
              name="region"
              type="text"
              value={form.region}
              onChange={handleChange}
              placeholder="e.g. Mekong Delta"
              disabled={disabled}
            />
          </div>
        </div>
  
        <div className="area-form-group area-form-full">
          <label htmlFor="area-address">
            Address
          </label>
  
          <input
            id="area-address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="Farm address"
            disabled={disabled}
          />
        </div>
  
        <div className="area-form-grid">
          <div className="area-form-group">
            <label htmlFor="area-size">
              Area Size
              <small> m²</small>
            </label>
  
            <input
              id="area-size"
              name="areaSquareMeters"
              type="number"
              min="0"
              step="0.01"
              value={
                form.areaSquareMeters
              }
              onChange={handleChange}
              placeholder="0"
              disabled={disabled}
            />
          </div>
  
          <div className="area-form-group">
            <label htmlFor="area-established">
              Established
            </label>
  
            <input
              id="area-established"
              name="establishedAt"
              type="date"
              value={
                form.establishedAt
              } 
              disabled
            />
          </div>
        </div>
  
        <div className="area-form-group area-form-full">
          <label htmlFor="area-description">
            Description
          </label>
  
          <textarea
            id="area-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional farming area description..."
            rows={4}
            disabled={disabled}
          />
        </div>
      </div>
    )
  }
  
  export default AreaForm