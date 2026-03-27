export type EntityLike = Record<string, any> | string | number | null | undefined;

export function isObjectEntity(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getEntityId(value: EntityLike): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (isObjectEntity(value)) {
    const idValue = value._id ?? value.id ?? "";
    return idValue ? String(idValue) : "";
  }
  return "";
}

export function resolveById<T extends Record<string, any>>(list: T[], ref: EntityLike): T | undefined {
  const targetId = getEntityId(ref);
  if (!targetId) return undefined;
  return list?.find((item) => getEntityId(item) === targetId);
}

function toCamelKey(key: string): string {
  if (key.startsWith("_")) return key;
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function toCamelDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelDeep(item)) as T;
  }
  if (isObjectEntity(value)) {
    const result: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      result[toCamelKey(key)] = toCamelDeep((value as Record<string, any>)[key]);
    });
    return result as T;
  }
  return value;
}

export function normalizeEntity<T extends EntityLike>(value: T): T {
  if (!isObjectEntity(value)) return value;
  const camel = toCamelDeep(value) as Record<string, any>;
  const idValue = getEntityId(camel);
  if (idValue && !camel._id) {
    camel._id = idValue;
  }
  return camel as T;
}

export function normalizeEntityList(value: unknown): Array<Record<string, any> | string> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (isObjectEntity(item) ? (normalizeEntity(item) as Record<string, any>) : String(item)));
}

export function resolveEntity<T extends Record<string, any>>(list: T[], ref: EntityLike): T | undefined {
  if (isObjectEntity(ref)) {
    return normalizeEntity(ref) as T;
  }
  return resolveById(list, ref);
}

export function safeText<T>(value: T, fallback = "Chưa có thông tin"): T | string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    return value.trim() === "" ? fallback : value;
  }
  return value;
}
