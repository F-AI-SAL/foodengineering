export const createId = () => Math.random().toString(36).slice(2, 10);

export const isPdfFile = (value?: string | null) => Boolean(value?.toLowerCase().endsWith(".pdf"));
