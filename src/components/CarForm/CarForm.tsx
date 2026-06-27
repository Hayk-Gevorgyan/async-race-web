import React, { FC, useState, useEffect } from "react";
import { CarPayload } from "../../types/CarPayload";

const NAME_MAX_LENGTH = 50;

interface CarFormProps {
  mode: "create" | "edit";
  initialValues?: CarPayload;
  disabled?: boolean;
  onSubmit: (payload: CarPayload) => void;
}

export const CarForm: FC<CarFormProps> = React.memo(function CarForm({
  mode,
  initialValues,
  disabled = false,
  onSubmit,
}) {
  const [name, setName]   = useState(initialValues?.name  ?? "");
  const [color, setColor] = useState(initialValues?.color ?? "#ffffff");

  useEffect(() => {
    if (mode === "edit") {
      setName(initialValues?.name   ?? "");
      setColor(initialValues?.color ?? "#ffffff");
    }
  }, [initialValues, mode]);

  const isTooLong  = name.length > NAME_MAX_LENGTH;
  const isInvalid  = !name.trim() || isTooLong;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isInvalid) return;
    onSubmit({ name: name.trim(), color });
    if (mode === "create") {
      setName("");
      setColor("#ffffff");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type={"text"}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={"Car name"}
          disabled={disabled}
          style={{
            background: "#1e1e2e",
            border: `1px solid ${isTooLong ? "#f87171" : "#2a2a35"}`,
            borderRadius: 4,
            color: "#e0e0f0",
            padding: "4px 8px",
            fontSize: 13,
            outline: "none",
            width: 140,
          }}
        />
        <input
          type={"color"}
          value={color}
          onChange={e => setColor(e.target.value)}
          disabled={disabled}
          style={{ width: 32, height: 28, border: "none", background: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0 }}
        />
        <button
          type={"submit"}
          disabled={disabled || isInvalid}
          style={{
            background: disabled || isInvalid ? "#2a2a35" : "#6c63ff",
            color: disabled || isInvalid ? "#555" : "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 12px",
            fontSize: 13,
            cursor: disabled || isInvalid ? "not-allowed" : "pointer",
          }}
        >
          {mode === "create" ? "Add" : "Save"}
        </button>
      </div>
      {isTooLong && (
        <span style={{ fontSize: 11, color: "#f87171" }}>
          Name too long ({name.length}/{NAME_MAX_LENGTH})
        </span>
      )}
    </form>
  );
});
