import React from "react";
import {
  isParameterSafe,
  getStatusColor,
  formatNumber,
} from "../utils/helpers";
import { PARAMETER_UNITS, PARAMETER_LABELS } from "../utils/constants";

const WaterQualityCard = ({ parameter, value, timestamp }) => {
  const isSafe = isParameterSafe(parameter, value);
  const statusColor = getStatusColor(isSafe);
  const label = PARAMETER_LABELS[parameter] || parameter;
  const unit = PARAMETER_UNITS[parameter] || "";

  return (
    <div className={`water-quality-card status-${statusColor}`}>
      <div className="card-header">
        <h3>{label}</h3>
        <span className={`status-indicator ${statusColor}`}></span>
      </div>
      <div className="card-body">
        <p className="value">
          {formatNumber(value)} <span className="unit">{unit}</span>
        </p>
      </div>
      {timestamp && (
        <div className="card-footer">
          <small>
            Cập nhật: {new Date(timestamp).toLocaleTimeString("vi-VN")}
          </small>
        </div>
      )}
    </div>
  );
};

export default WaterQualityCard;
