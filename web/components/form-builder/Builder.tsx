"use client";

import { Button, Input, Select, Textarea } from "../ui";
import { useFormBuilderState } from "./state";
import { Field } from "../types";

function FieldEditor({
  field,
  onChange,
  onRemove,
}: {
  field: Field;
  onChange: (f: Field) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Input
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="Question label"
        />
        <Select
          value={field.type}
          onChange={(e) => onChange({ ...field, type: e.target.value as any })}
        >
          <option value="text">Text</option>
          <option value="multiple_choice">Multiple choice</option>
          <option value="checkbox">Checkboxes</option>
          <option value="rating">Rating</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          Required
        </label>
        <Button className="ml-auto" onClick={onRemove}>
          Remove
        </Button>
      </div>

      {field.type === "text" && (
        <Input
          value={field.placeholder ?? ""}
          onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
          placeholder="Placeholder"
        />
      )}

      {(field.type === "multiple_choice" || field.type === "checkbox") && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Options</div>
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Input
                  value={opt.label}
                  onChange={(e) =>
                    onChange({
                      ...field,
                      options: (field.options ?? []).map((o) =>
                        o.id === opt.id ? { ...o, label: e.target.value } : o
                      ),
                    })
                  }
                />
                <Button
                  onClick={() =>
                    onChange({
                      ...field,
                      options: (field.options ?? []).filter(
                        (o) => o.id !== opt.id
                      ),
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={() =>
              onChange({
                ...field,
                options: [
                  ...(field.options ?? []),
                  {
                    id: Math.random().toString(36).slice(2, 8),
                    label: `Option ${(field.options?.length ?? 0) + 1}`,
                  },
                ],
              })
            }
          >
            Add option
          </Button>
        </div>
      )}

      {field.type === "rating" && (
        <div className="flex gap-2 items-center">
          <div className="text-sm">Min</div>
          <Input
            type="number"
            value={field.minRating ?? 1}
            onChange={(e) =>
              onChange({
                ...field,
                minRating: parseInt(e.target.value || "1", 10),
              })
            }
            className="w-24"
          />
          <div className="text-sm">Max</div>
          <Input
            type="number"
            value={field.maxRating ?? 5}
            onChange={(e) =>
              onChange({
                ...field,
                maxRating: parseInt(e.target.value || "5", 10),
              })
            }
            className="w-24"
          />
        </div>
      )}
    </div>
  );
}

export default function Builder() {
  const state = useFormBuilderState();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Input
          value={state.title}
          onChange={(e) => state.setTitle(e.target.value)}
          className="text-lg font-medium"
        />
        <Button onClick={() => state.addField("text")}>Add Text</Button>
        <Button onClick={() => state.addField("multiple_choice")}>
          Add Multiple
        </Button>
        <Button onClick={() => state.addField("checkbox")}>
          Add Checkboxes
        </Button>
        <Button onClick={() => state.addField("rating")}>Add Rating</Button>
        <Button
          className="ml-auto"
          onClick={async () => {
            const api =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            try {
              const res = await fetch(api + "/api/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: state.title,
                  fields: state.fields,
                }),
              });
              const json = await res.json().catch(() => ({}));
              if (res.ok) {
                window.location.href = `/forms/${json.id}`;
              } else {
                alert("Failed to save: " + (json?.message || res.statusText));
              }
            } catch (e: any) {
              alert(
                "Failed to connect to API. Check NEXT_PUBLIC_API_URL. Error: " +
                  (e?.message || String(e))
              );
            }
          }}
        >
          Save
        </Button>
      </div>

      <div className="space-y-4" onDragOver={(e) => e.preventDefault()}>
        {state.fields.map((f, i) => (
          <div
            key={f.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData("text/plain"));
              state.moveField(from, i);
            }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Button onClick={() => i > 0 && state.moveField(i, i - 1)}>
                ↑
              </Button>
              <Button
                onClick={() =>
                  i < state.fields.length - 1 && state.moveField(i, i + 1)
                }
              >
                ↓
              </Button>
              <span className="text-xs text-gray-500 self-center">
                Drag to reorder
              </span>
            </div>
            <FieldEditor
              field={f}
              onChange={(nf) => state.updateField(f.id, () => nf)}
              onRemove={() => state.removeField(f.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
