import React from "react";

export default function commitPopupComponent({
  fileName,
  message,
  setMessage,
  defaultMessage,
  errorMessage,
  onCancel,
  onCommit,
  extendedDescription,
  setExtendedDescription,
  loading
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Commit changes</h3>

        {errorMessage && (
          <div className="errorMessage">
            <p>{errorMessage}</p>
          </div>
        )}

        <hr />
        <label>Commit message</label>
        <input
          type="text"
          placeholder={defaultMessage}
          className="commit-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="commitChangesInput"
        />

        <label>Extended description</label>
        <textarea
          placeholder="Add an optional extended description..."
          className="commit-textarea"
          value={extendedDescription}
          onChange={(e) => setExtendedDescription(e.target.value)}
        />

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="commit-btn" onClick={onCommit} disabled={loading}>
            {loading ? "Saving...": "Commit changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
