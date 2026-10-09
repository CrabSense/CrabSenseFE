import {
    BOX_ADMIN_STATUS_OPTIONS,
  } from '../../../constants/boxStatuses'
  
  
  function BoxForm({
    form,
    onChange,
    disabled,
    isOccupied,
  }) {
    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
      } = event.target
  
      onChange(
        name,
        value
      )
    }
  
  
    return (
      <div className="box-form">
  
        <div className="box-form-group">
          <label htmlFor="box-code">
            Box Code
            <span>*</span>
          </label>
  
          <input
            id="box-code"
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            disabled={disabled}
            placeholder="BOX-0001"
          />
        </div>
  
  
        <div className="box-form-group">
          <label>
            Status
          </label>
  
          {isOccupied ? (
            <div className="box-status-readonly">
              <span
                className={`box-status-dot status-${form.status}`}
              />
  
              <strong>
                {form.status}
              </strong>
  
              <small>
                Managed by the crab farming workflow.
              </small>
            </div>
          ) : (
            <select
              id="box-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={disabled}
            >
              {BOX_ADMIN_STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          )}
        </div>
  
      </div>
    )
  }
  
  export default BoxForm