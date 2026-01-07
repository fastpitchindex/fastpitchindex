// Utility functions for date formatting and data manipulation

export const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
};

export const formatMonthDayYear = (value?: string | null): string => {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatShortDate = (date: Date): string => `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;

export const formatShortDateWithYear = (date: Date): string => `${formatShortDate(date)}, ${date.getFullYear()}`;

export const formatLongDate = (value?: string | null): string => {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export const formatDateRange = (start?: string | null, end?: string | null): string => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate) return "";
  if (!endDate) return formatShortDateWithYear(startDate);
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatShortDateWithYear(startDate);
  }
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();
  if (sameMonth) {
    return `${formatShortDate(startDate)} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
  }
  if (sameYear) {
    return `${formatShortDate(startDate)} - ${formatShortDateWithYear(endDate)}`;
  }
  return `${formatShortDateWithYear(startDate)} - ${formatShortDateWithYear(endDate)}`;
};

export const formatDivision = (division: string): string => {
  const trimmed = division.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "hs") return "HS";
  if (/^\d+$/.test(trimmed)) return `${trimmed}U`;
  const match = trimmed.match(/^(\d+)\s*u$/i);
  if (match) return `${match[1]}U`;
  return trimmed.replace(/u/gi, "U");
};

export const getDivisionLabel = (
  division: string | number | { division?: string | null; division_age?: string | null; age?: string | null; level?: string | null } | null | undefined
): string => {
  if (!division) return "";
  if (typeof division === "string") return division;
  if (typeof division === "number") return String(division);
  if (typeof division === "object") {
    if (division.division) return division.division;
    if (division.division_age) return division.division_age;
    if (division.age) {
      const age = division.age;
      const level = division.level;
      return level ? `${age} ${level}` : age;
    }
  }
  return "";
};

export const sortDivisions = (divisions: string[]): string[] => {
  return divisions
    .map((value) => String(value))
    .filter((value) => value.trim().length > 0)
    .sort((a, b) => {
      const aIsHs = a.trim().toLowerCase() === "hs";
      const bIsHs = b.trim().toLowerCase() === "hs";
      if (aIsHs && bIsHs) return 0;
      if (aIsHs) return 1;
      if (bIsHs) return -1;
      const aMatch = a.match(/\d+/);
      const bMatch = b.match(/\d+/);
      if (aMatch && bMatch) return Number(aMatch[0]) - Number(bMatch[0]);
      if (aMatch) return -1;
      if (bMatch) return 1;
      return a.localeCompare(b);
    });
};

export const formatLevel = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length === 1) return trimmed.toUpperCase();
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
};

export const formatLevels = (levels?: string[] | null): string => {
  if (!levels || levels.length === 0) return "";
  const formatted = levels.map(formatLevel).filter(Boolean);
  return formatted.join(" • ");
};

export const formatGamesGuaranteed = (value?: string | number | null): string => {
  if (value === null || value === undefined) return "TBD";
  const trimmed = String(value).trim();
  if (!trimmed) return "TBD";
  if (/gg$/i.test(trimmed)) return trimmed.toUpperCase();
  const digits = trimmed.match(/\d+/)?.[0];
  if (digits) return `${digits}GG`;
  return trimmed.toUpperCase();
};

export const parseLocalDate = (value?: string | null): Date | null => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.valueOf()) ? null : date;
  }
  return parseDate(value);
};

export const toLocalDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateBlock = (start?: string | null, end?: string | null): { monthLabel: string; dayLabel: string } => {
  const startDate = parseDate(start);
  if (!startDate) {
    return { monthLabel: "-", dayLabel: "-" };
  }
  const endDate = parseDate(end) || startDate;
  const monthLabel = MONTHS_SHORT[startDate.getMonth()].toUpperCase();
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const dayLabel = startDay === endDay ? `${startDay}` : `${startDay}-${endDay}`;
  return { monthLabel, dayLabel };
};

export const formatWeekendRange = (start: Date): string => {
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}-${end.getDate()}`;
  }
  return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}-${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
};

export const getWeekendStart = (date: Date): Date => {
  const day = date.getDay();
  let offset = 5 - day;
  if (day === 0) offset = -2;
  if (day === 6) offset = -1;
  const start = new Date(date);
  start.setDate(date.getDate() + offset);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const formatWeekendHeader = (start: Date): string => {
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  const startLabel = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
  const endLabel =
    start.getMonth() === end.getMonth()
      ? `${end.getDate()}`
      : `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
  return `Weekend of ${startLabel}-${endLabel}`;
};

export const formatMoney = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `$${Math.round(value)}`;
};

export const toAgeKey = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/hs/i.test(trimmed)) return "HS";
  const match = trimmed.match(/\d+/);
  if (match) return `${match[0]}U`;
  return formatDivision(trimmed);
};

export const formatAgeSelection = (selected: string[]): string => {
  if (selected.length === 0) return "";
  const normalized = sortDivisions(selected).map(formatDivision);
  const hasHs = normalized.includes("HS");
  const numeric = normalized
    .filter((value) => value !== "HS")
    .map((value) => Number(value.replace(/U/i, "")))
    .filter((value) => Number.isFinite(value));
  let range = "";
  if (numeric.length > 0) {
    const minAge = Math.min(...numeric);
    const maxAge = Math.max(...numeric);
    range = minAge === maxAge ? `${minAge}U` : `${minAge}-${maxAge}U`;
  }
  const parts = [range, hasHs ? "HS" : ""].filter(Boolean);
  if (parts.length === 0) return normalized.join(", ");
  return parts.join(", ");
};

export const getSeasonRange = (seasonKey: string, reference: Date): { label: string; start: Date; end: Date } => {
  const year = reference.getMonth() >= 7 ? reference.getFullYear() : reference.getFullYear() - 1;
  const start = new Date(year, 7, 1);
  const end = new Date(year + 1, 6, 31);
  if (seasonKey === "current") return { label: `${year}-${String(year + 1).slice(2)}`, start, end };
  if (seasonKey === "fall") return { label: "Fall", start: new Date(year, 7, 1), end: new Date(year, 10, 30) };
  if (seasonKey === "winter")
    return { label: "Winter", start: new Date(year, 11, 1), end: new Date(year + 1, 1, 28) };
  if (seasonKey === "spring")
    return { label: "Spring", start: new Date(year + 1, 2, 1), end: new Date(year + 1, 4, 31) };
  if (seasonKey === "summer")
    return { label: "Summer", start: new Date(year + 1, 5, 1), end: new Date(year + 1, 6, 31) };
  return { label: `${year}-${String(year + 1).slice(2)}`, start, end };
};

export const hasWeekendBetween = (start: Date, end: Date): boolean => {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 6) return true;
  for (let i = 0; i <= diffDays; i += 1) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) return true;
  }
  return false;
};

export const eventOverlapsRange = (eventStart: Date, eventEnd: Date, rangeStart: Date, rangeEnd: Date): boolean => {
  return eventStart <= rangeEnd && eventEnd >= rangeStart;
};

export const toRadians = (value: number): number => (value * Math.PI) / 180;

export const getDistanceMiles = (from: { lat: number; lon: number }, to: { lat: number; lon: number }): number => {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
};

export const splitTitleParenthetical = (title: string): { main: string; extra: string } => {
  const match = title.match(/^(.*?)(\s*\(.+\))$/);
  if (!match) return { main: title, extra: "" };
  const simplifyParenthetical = (value: string): string => {
    const cleaned = value.replace(/[()]/g, "").trim();
    if (!cleaned) return "";
    if (/ring/i.test(cleaned)) return "(Rings)";
    if (cleaned.length <= 18 && cleaned.split(/\s+/).length <= 3) return `(${cleaned})`;
    const firstWord = cleaned.split(/\s+/)[0] || cleaned;
    return `(${firstWord})`;
  };
  const extra = simplifyParenthetical(match[2].trim());
  return { main: match[1].trim(), extra };
};

/**
 * Sanitizes a password input to prevent malicious input and ensure security.
 * - Removes null bytes and other problematic control characters
 * - Enforces maximum length to prevent DoS attacks
 * - Does NOT trim whitespace (passwords may intentionally include spaces)
 * 
 * @param password - The raw password input
 * @param maxLength - Maximum allowed password length (default: 128)
 * @returns Sanitized password string
 */
export function sanitizePassword(password: string, maxLength: number = 128): string {
  // Remove null bytes and other problematic control characters (but allow spaces)
  // Keep: printable ASCII (32-126), and common Unicode characters
  // Remove: null bytes (0x00), and other control chars that could cause issues
  let sanitized = password.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Enforce maximum length to prevent DoS attacks
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes an email input to prevent malicious input.
 * - Trims whitespace
 * - Removes null bytes and control characters
 * - Enforces maximum length
 * 
 * @param email - The raw email input
 * @param maxLength - Maximum allowed email length (default: 254 per RFC 5321)
 * @returns Sanitized email string
 */
export function sanitizeEmail(email: string, maxLength: number = 254): string {
  // Trim whitespace
  let sanitized = email.trim();
  
  // Remove null bytes and control characters (except newlines/tabs which shouldn't be in emails anyway)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes a general text input to prevent malicious input.
 * - Trims whitespace
 * - Removes HTML tags and script injection attempts
 * - Removes null bytes and control characters
 * - Enforces maximum length
 * 
 * @param text - The raw text input
 * @param maxLength - Maximum allowed text length (default: 1000)
 * @returns Sanitized text string
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  // Trim whitespace
  let sanitized = text.trim();
  
  // Remove HTML tags to prevent XSS
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Remove null bytes and control characters (but allow spaces, tabs, newlines for textarea)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes a URL input to prevent malicious input.
 * - Trims whitespace
 * - Removes null bytes and control characters
 * - Enforces maximum length
 * 
 * @param url - The raw URL input
 * @param maxLength - Maximum allowed URL length (default: 2048)
 * @returns Sanitized URL string
 */
export function sanitizeUrl(url: string, maxLength: number = 2048): string {
  // Trim whitespace
  let sanitized = url.trim();
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes a textarea input to prevent malicious input.
 * - Trims leading/trailing whitespace (but preserves internal formatting)
 * - Removes HTML tags and script injection attempts
 * - Removes null bytes and problematic control characters (but allows newlines/tabs)
 * - Enforces maximum length
 * 
 * @param textarea - The raw textarea input
 * @param maxLength - Maximum allowed textarea length (default: 10000)
 * @returns Sanitized textarea string
 */
export function sanitizeTextarea(textarea: string, maxLength: number = 10000): string {
  // Trim only leading/trailing whitespace
  let sanitized = textarea.trim();
  
  // Remove HTML tags to prevent XSS
  sanitized = sanitized.replace(/[<>]/g, '');
  
  // Remove null bytes and problematic control characters (but allow newlines \n and tabs \t)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Allowed file MIME types for contact form uploads
 * Only safe, common document and image types are allowed
 */
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Documents
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
] as const;

/**
 * Allowed file extensions (lowercase, without dot)
 * Must match the MIME types above
 */
const ALLOWED_EXTENSIONS = [
  // Images
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  // Documents
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv',
] as const;

/**
 * Blocked file extensions - dangerous file types that should never be allowed
 */
const BLOCKED_EXTENSIONS = [
  // Executables
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  // Scripts
  'sh', 'bash', 'ps1', 'py', 'pl', 'rb', 'php', 'asp', 'aspx', 'jsp',
  // Archives that could contain executables
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
  // System files
  'dll', 'sys', 'drv', 'msi', 'deb', 'rpm',
  // Other dangerous types
  'app', 'dmg', 'iso', 'bin', 'run',
] as const;

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates a file to ensure it's safe to upload.
 * 
 * @param file - The File object to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is 10MB.`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" is empty.`,
    };
  }

  // Get file extension (lowercase, without dot)
  const fileName = file.name.toLowerCase();
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return {
      isValid: false,
      error: `File "${file.name}" has no extension. Please upload a file with a valid extension.`,
    };
  }

  const extension = fileName.substring(lastDot + 1);

  // Check if extension is blocked
  if (BLOCKED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `File type "${extension}" is not allowed for security reasons.`,
    };
  }

  // Check if extension is allowed
  if (!ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: `File type "${extension}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}.`,
    };
  }

  // Validate MIME type if available
  if (file.type) {
    // Some browsers may not set MIME type correctly, so we check extension first
    // But if MIME type is set and doesn't match allowed types, that's suspicious
    const mimeTypeLower = file.type.toLowerCase();
    const isAllowedMimeType = ALLOWED_MIME_TYPES.some(allowed => 
      mimeTypeLower === allowed.toLowerCase()
    );

    // If MIME type is set but doesn't match our allowed list, be cautious
    // However, some browsers may set generic types, so we don't reject based solely on this
    // We primarily rely on extension validation
    if (file.type && !isAllowedMimeType && file.type !== 'application/octet-stream') {
      // Log warning but don't block - extension validation is primary
      console.warn(`File "${file.name}" has MIME type "${file.type}" which doesn't match expected types, but extension "${extension}" is allowed.`);
    }
  }

  // Additional security: Check for double extensions (e.g., "file.pdf.exe")
  const parts = fileName.split('.');
  if (parts.length > 2) {
    const lastExtension = parts[parts.length - 1];
    const secondLastExtension = parts[parts.length - 2];
    
    // If the last extension is blocked, reject even if second-to-last is allowed
    if (BLOCKED_EXTENSIONS.includes(lastExtension as any)) {
      return {
        isValid: false,
        error: `File "${file.name}" has a blocked extension "${lastExtension}".`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates multiple files.
 * 
 * @param files - FileList or array of File objects
 * @returns Object with isValid boolean, validFiles array, and errors array
 */
export function validateFiles(files: FileList | File[]): {
  isValid: boolean;
  validFiles: File[];
  errors: string[];
} {
  const fileArray = Array.from(files);
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    const validation = validateFile(file);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      errors.push(validation.error || `File "${file.name}" is invalid.`);
    }
  }

  return {
    isValid: errors.length === 0,
    validFiles,
    errors,
  };
}
