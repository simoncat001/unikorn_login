import type { DataContent, ElementType, NumberRange } from '@/api/DevelopmentDataService';

export const findMetaByTitle = (
    order: ElementType[] | undefined,
    title: string
): ElementType | undefined => {
    if (!order || !title) {
        return undefined;
    }
    return order.find((item) => item?.title === title);
};

export const sortByOrder = (
    items: DataContent[],
    order: ElementType[] | undefined
): DataContent[] => {
    if (!order || order.length === 0) {
        return items;
    }
    const indexMap = new Map<string, number>();
    order.forEach((meta, idx) => {
        if (meta?.title && !indexMap.has(meta.title)) {
            indexMap.set(meta.title, idx);
        }
    });
    return [...items].sort((a, b) => {
        const ai = indexMap.get(a.title) ?? Number.MAX_SAFE_INTEGER;
        const bi = indexMap.get(b.title) ?? Number.MAX_SAFE_INTEGER;
        return ai - bi;
    });
};

export const fallbackStringify = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    try {
        return JSON.stringify(value);
    } catch (error) {
        return String(value);
    }
};

export const normalizeObjectContent = (
    content: DataContent[] | undefined,
    order: ElementType[] | undefined
): DataContent[] => {
    if (!content || content.length === 0) {
        return [];
    }
    const ordered = sortByOrder(content, order);
    return ordered.map((item) => {
        const meta = findMetaByTitle(order, item.title);
        let nextContent = item.content;
        if (item.type === "object" && Array.isArray(item.content)) {
            nextContent = normalizeObjectContent(
                item.content as DataContent[],
                meta?.order
            );
        } else if (item.type === "array" && Array.isArray(item.content)) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            nextContent = (item.content as unknown[])
                .map((entry) => normalizeArrayEntry(entry, item.element_type ?? meta?.element_type)) as any;
        }
        return {
            ...item,
            element_type: item.element_type ?? meta?.element_type,
            unit: item.unit ?? meta?.unit,
            content: nextContent,
        };
    });
};

export const normalizeArrayEntry = (
    entry: unknown,
    elementMeta: ElementType | undefined
): unknown => {
    if (!elementMeta) {
        return entry;
    }
    if (elementMeta.type === "object" && Array.isArray(entry)) {
        return normalizeObjectContent(entry as DataContent[], elementMeta.order);
    }
    if (elementMeta.type === "array" && Array.isArray(entry)) {
        return (entry as unknown[]).map((child) =>
            normalizeArrayEntry(child, elementMeta.element_type)
        );
    }
    return entry;
};

export const getNumberRange = (content: NumberRange, unit?: string): string => {
    return content.start + "~" + content.end + (unit ?? "");
};

export const getEnumText = (content: string[]): string => {
    return content.join(", ");
};

export const getNumber = (content: string | number, unit?: string): string => {
    return String(content) + (unit ?? "");
};
