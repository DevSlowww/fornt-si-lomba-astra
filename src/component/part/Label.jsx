import React from "react";

export default function Label({ title, data, forLabel, href }) {
  let formattedHref = null;
  if (href != null) {
    formattedHref = href
      ? href.startsWith("http://") || href.startsWith("https://")
        ? href
        : `https://${href}`
      : "#";
  }

  return (
    <div className="mb-3">
      <label htmlFor={forLabel} className="form-label fw-bold">
        {title}
      </label>
      <br />
      <a href={formattedHref} target="_blank" rel="noopener noreferrer">
        <span style={{ whiteSpace: "pre-wrap" }}>{data}</span>
      </a>
    </div>
  );
}
