import React, { FC, useState, useEffect } from "react";
import { CarPayload } from "../../types/CarPayload";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
    if (mode === "create") {
      setName("");
      setColor("#ffffff");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type={"text"}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={"Car name"}
          disabled={disabled}
          style={{
            background: "#1e1e2e",
            border: "1px solid #2a2a35",
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
          disabled={disabled || !name.trim()}
          style={{
            background: disabled ? "#2a2a35" : "#6c63ff",
            color: disabled ? "#555" : "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 12px",
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {mode === "create" ? "Add" : "Save"}
        </button>
      </div>
    </form>
  );
});
