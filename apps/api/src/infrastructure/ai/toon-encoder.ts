type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const INDENT = "  ";

function needsQuoting(value: string): boolean {
  if (value === "") return true;
  if (value !== value.trim()) return true;
  if (value === "true" || value === "false" || value === "null") return true;
  if (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)) return true;
  if (/^0\d+$/.test(value)) return true;
  if (/[:"\\[\]{}]/.test(value)) return true;
  if (/[\n\r\t]/.test(value)) return true;
  if (value === "-" || value.startsWith("-")) return true;
  if (value.includes(",")) return true;
  return false;
}

function escapeString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function encodePrimitive(value: JsonPrimitive): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "null";
    if (Object.is(value, -0)) return "0";
    return String(value);
  }
  if (needsQuoting(value)) return `"${escapeString(value)}"`;
  return value;
}

function isTabular(arr: JsonValue[]): boolean {
  if (arr.length === 0) return false;
  if (
    arr.some(
      (item) =>
        typeof item !== "object" || item === null || Array.isArray(item),
    )
  )
    return false;

  const keys = Object.keys(arr[0] as Record<string, JsonValue>);
  if (keys.length === 0) return false;

  return arr.every((item) => {
    const obj = item as Record<string, JsonValue>;
    const itemKeys = Object.keys(obj);
    if (itemKeys.length !== keys.length) return false;
    if (!keys.every((k) => k in obj)) return false;
    return Object.values(obj).every((v) => v === null || typeof v !== "object");
  });
}

function isPrimitiveArray(arr: JsonValue[]): boolean {
  return arr.every((v) => v === null || typeof v !== "object");
}

function encodeArray(key: string, arr: JsonValue[], depth: number): string {
  const indent = INDENT.repeat(depth);
  const prefix = key ? `${key}` : "";

  if (arr.length === 0) {
    return `${indent}${prefix}[0]:`;
  }

  if (isPrimitiveArray(arr)) {
    const values = arr
      .map((v) => encodePrimitive(v as JsonPrimitive))
      .join(",");
    return `${indent}${prefix}[${arr.length}]: ${values}`;
  }

  if (isTabular(arr)) {
    const fields = Object.keys(arr[0] as Record<string, JsonValue>);
    const header = `${indent}${prefix}[${arr.length}]{${fields.join(",")}}:`;
    const rows = arr.map((item) => {
      const obj = item as Record<string, JsonValue>;
      const values = fields
        .map((f) => encodePrimitive(obj[f] as JsonPrimitive))
        .join(",");
      return `${INDENT.repeat(depth + 1)}${values}`;
    });
    return [header, ...rows].join("\n");
  }

  const header = `${indent}${prefix}[${arr.length}]:`;
  const items = arr.map((item) => {
    if (item === null || typeof item !== "object") {
      return `${INDENT.repeat(depth + 1)}- ${encodePrimitive(item as JsonPrimitive)}`;
    }
    if (Array.isArray(item)) {
      return encodeArray(`${INDENT.repeat(depth + 1)}- `, item, 0);
    }
    return encodeObjectAsListItem(item as Record<string, JsonValue>, depth + 1);
  });
  return [header, ...items].join("\n");
}

function encodeObjectAsListItem(
  obj: Record<string, JsonValue>,
  depth: number,
): string {
  const indent = INDENT.repeat(depth);
  const entries = Object.entries(obj);
  const lines: string[] = [];

  entries.forEach(([key, value], index) => {
    if (index === 0) {
      if (value === null || typeof value !== "object") {
        lines.push(
          `${indent}- ${key}: ${encodePrimitive(value as JsonPrimitive)}`,
        );
      } else if (Array.isArray(value)) {
        lines.push(encodeArray(`${indent}- ${key}`, value, 0));
      } else {
        lines.push(`${indent}- ${key}:`);
        lines.push(encodeObject(value as Record<string, JsonValue>, depth + 2));
      }
    } else {
      lines.push(encodeEntry(key, value, depth + 1));
    }
  });

  return lines.join("\n");
}

function encodeEntry(key: string, value: JsonValue, depth: number): string {
  const indent = INDENT.repeat(depth);

  if (value === null || typeof value !== "object") {
    return `${indent}${key}: ${encodePrimitive(value as JsonPrimitive)}`;
  }

  if (Array.isArray(value)) {
    return encodeArray(`${key}`, value, depth);
  }

  const nested = encodeObject(value as Record<string, JsonValue>, depth + 1);
  if (nested === "") {
    return `${indent}${key}:`;
  }
  return `${indent}${key}:\n${nested}`;
}

function encodeObject(obj: Record<string, JsonValue>, depth: number): string {
  const entries = Object.entries(obj);
  if (entries.length === 0) return "";
  return entries
    .map(([key, value]) => encodeEntry(key, value, depth))
    .join("\n");
}

export function jsonToToon(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return encodePrimitive(value as JsonPrimitive);
  }

  if (Array.isArray(value)) {
    return encodeArray("", value, 0);
  }

  return encodeObject(value as Record<string, JsonValue>, 0);
}
