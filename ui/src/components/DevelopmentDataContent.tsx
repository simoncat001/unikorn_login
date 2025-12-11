import Common from "../common/Common";

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Link } from "@material-ui/core";
import {
  ElementType,
  DataContent,
  NumberRange,
  UserFile,
} from "../api/DevelopmentDataService";
import { MGID_DETAIL_PATH } from "../common/Path";
// fixDownloadLink removed as it's no longer used

const useStyles = makeStyles(() =>
  createStyles({
    titleBlock: {
      backgroundColor: aColor.accentBackground,
      border: `solid 0.5px ${aColor.lighterBorder}`,
      minWidth: "120px",
      maxWidth: "120px",
    },
    contentBlock: {
      border: `solid 0.5px ${aColor.lighterBorder}`,
    },
    link: {
      color: aColor.bodyText,
      "&:hover": {
        color: aColor.primaryColor,
        textDecoration: "none",
      },
    },
  })
);

const aColor = Common.allColor;

const findMetaByTitle = (
  order: ElementType[] | undefined,
  title: string
): ElementType | undefined => {
  if (!order || !title) {
    return undefined;
  }
  return order.find((item) => item?.title === title);
};

const sortByOrder = (
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

const fallbackStringify = (value: unknown): string => {
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

const normalizeArrayEntry = (
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

function normalizeObjectContent(
  content: DataContent[] | undefined,
  order: ElementType[] | undefined
): DataContent[] {
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
      const elementMeta = item.element_type ?? meta?.element_type;
      nextContent = (item.content as unknown[])
        .map((entry) => normalizeArrayEntry(entry, elementMeta)) as DataContent["content"];
    }
    return {
      ...item,
      element_type: item.element_type ?? meta?.element_type,
      unit: item.unit ?? meta?.unit,
      content: nextContent,
    };
  });
}

function getNumberRange(content: NumberRange, unit?: string) {
  return content.start + "~" + content.end + unit;
}

function getEnumText(content: string[]) {
  return content.join(", ");
}

function getNumber(content: string | number, unit?: string) {
  return String(content) + (unit ?? "");
}

const ContentTitle: React.FC<{
  title: string;
}> = ({ title }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex" p={2} className={classes.titleBlock}>
      <Typography className={fontClasses.boldFont}>{title}</Typography>
    </Box>
  );
};

const ContentFile: React.FC<{ file: UserFile }> = ({ file }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  // 解析文件URL，支持MinIO完整格式
  // 格式: file:http://127.0.0.1:9000/mgsdb/devdata/filename.zip
  let displayName = file.name;
  let objectKey = "";

  // 1. 先清理末尾的特殊字符（冒号、分号等）
  displayName = displayName.replace(/[:;]+$/, "");

  // 2. 移除 file: 前缀
  displayName = displayName.replace(/^file:/, '');

  try {
    // 尝试解析为URL
    if (displayName.startsWith('http://') || displayName.startsWith('https://')) {
      const url = new URL(displayName);
      // 路径格式: /bucket/path/to/file.ext
      const pathParts = url.pathname.split('/').filter(p => p);

      if (pathParts.length >= 2) {
        // 第一部分是bucket，剩余部分是文件路径
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        objectKey = filePath;
        // 显示名称只显示最后的文件名
        displayName = pathParts[pathParts.length - 1];
      } else if (pathParts.length === 1) {
        // 只有文件名，没有路径
        objectKey = pathParts[0];
        displayName = pathParts[0];
      }
    } else {
      // 不是URL格式，直接使用原值
      displayName = displayName.replace(/^\/api\/download\//, '');
      objectKey = displayName;
    }
  } catch (e) {
    // URL解析失败，使用原始值
    displayName = displayName.replace(/^\/api\/download\//, '');
    objectKey = displayName;
  }

  // 构建下载链接，使用解析出的objectKey
  // 先解码一次，防止双重编码，然后再编码
  let finalKey = objectKey || displayName;
  try {
    // 尝试解码，如果已经是编码状态会正确解码，如果不是也不会出错
    finalKey = decodeURIComponent(finalKey);
  } catch (e) {
    // 解码失败，使用原值
  }

  // 对于显示名称也进行解码
  let finalDisplayName = displayName;
  try {
    finalDisplayName = decodeURIComponent(displayName);
  } catch (e) {
    // 解码失败，使用原值
  }

  const downloadUrl = `/api/download/${encodeURIComponent(finalKey)}`;

  return (
    <Box display="flex" flexGrow={1} p={2} className={classes.contentBlock}>
      <Typography
        className={fontClasses.unboldFont}
        style={{ wordBreak: "break-all" }}
      >
        <a
          target="_blank"
          rel="noreferrer"
          href={downloadUrl}
          style={{ color: aColor.primaryColor, textDecoration: 'underline' }}
          title={`下载文件: ${finalDisplayName}`}
        >
          {finalDisplayName}
        </a>
      </Typography>
    </Box>
  );
};

const ContentString: React.FC<{
  content: string | number | null;
  isURL?: boolean;
}> = ({ content, isURL = false }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const contentStr =
    content === null || content === undefined ? "" : String(content);

  return (
    <Box display="flex" flexGrow={1} p={2} className={classes.contentBlock}>
      <Typography
        className={fontClasses.unboldFont}
        style={{ wordBreak: "break-all" }}
      >
        {isURL ? (
          <Link
            className={classes.link}
            href={MGID_DETAIL_PATH + "/" + contentStr}
          >
            {contentStr}
          </Link>
        ) : (
          contentStr
        )}
      </Typography>
    </Box>
  );
};

const renderArrayValue = (
  value: unknown,
  elementMeta: ElementType | undefined,
  unit?: string
) => {
  if (elementMeta?.type === "object") {
    return (
      <ContentObject
        content={Array.isArray(value) ? (value as DataContent[]) : []}
        order={elementMeta.order}
      />
    );
  }
  if (
    !elementMeta &&
    Array.isArray(value) &&
    value.every(
      (child) => typeof child === "object" && child !== null && "title" in (child as Record<string, unknown>)
    )
  ) {
    return <ContentObject content={value as DataContent[]} />;
  }
  if (elementMeta?.type === "array") {
    const nestedList = Array.isArray(value) ? (value as unknown[]) : [];
    return (
      <ContentArray
        parentTitle={elementMeta.title || ""}
        elementMeta={elementMeta.element_type}
        contentList={nestedList}
        unit={elementMeta.unit || unit}
      />
    );
  }
  if (elementMeta?.type === "enum_text") {
    return (
      <ContentString content={getEnumText((value as string[]) || [])} />
    );
  }
  if (elementMeta?.type === "number_range") {
    return (
      <ContentString
        content={getNumberRange(
          (value as NumberRange) || { start: "", end: "" },
          elementMeta.unit || unit
        )}
      />
    );
  }
  if (elementMeta?.type === "number") {
    return (
      <ContentString
        content={getNumber(value as string | number, elementMeta.unit || unit)}
      />
    );
  }
  if (elementMeta?.type === "MGID") {
    return <ContentString content={(value as string) || ""} isURL={true} />;
  }
  if (elementMeta?.type === "file" || elementMeta?.type === "image") {
    return (
      <ContentFile
        file={(value as UserFile) || { name: "", sha256: "" }}
      />
    );
  }
  if (elementMeta?.type === "date" || elementMeta?.type === "string") {
    return <ContentString content={fallbackStringify(value)} />;
  }
  // 默认退化为字符串渲染
  return <ContentString content={fallbackStringify(value)} />;
};

const ContentArray: React.FC<{
  parentTitle: string;
  elementMeta?: ElementType;
  contentList: unknown[];
  unit?: string;
}> = ({ parentTitle, elementMeta, contentList, unit }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  if (!Array.isArray(contentList) || contentList.length === 0) {
    return (
      <Box display="flex" flexGrow={1} p={2} className={classes.contentBlock}>
        <Typography className={fontClasses.unboldFont}></Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      {contentList.map((item, index) => {
        const duplicateTitle =
          elementMeta?.title && elementMeta.title === parentTitle;
        const label = duplicateTitle
          ? `${parentTitle} (${index + 1})`
          : elementMeta?.title ||
          (contentList.length > 1
            ? `${parentTitle} (${index + 1})`
            : parentTitle);

        return (
          <Box
            display="flex"
            flexDirection="row"
            flexGrow={1}
            key={`${parentTitle}-${index}`}
          >
            <ContentTitle title={label} />
            {renderArrayValue(item, elementMeta, unit)}
          </Box>
        );
      })}
    </Box>
  );
};

const ContentItem: React.FC<{
  type: string;
  content: DataContent["content"];
  element_type?: ElementType;
  unit?: string;
  order?: ElementType[];
  parentTitle: string;
}> = ({ type, content, element_type, unit, order, parentTitle }) => {
  switch (type) {
    case "object":
      return (
        <ContentObject
          content={(content as DataContent[]) || []}
          order={order}
        />
      );
    case "array":
      return (
        <ContentArray
          parentTitle={parentTitle}
          elementMeta={element_type}
          contentList={Array.isArray(content) ? (content as unknown[]) : []}
          unit={element_type?.unit || unit}
        />
      );
    case "enum_text":
      return <ContentString content={getEnumText((content as string[]) || [])} />;
    case "number_range":
      return (
        <ContentString
          content={getNumberRange(
            (content as NumberRange) || { start: "", end: "" },
            unit
          )}
        />
      );
    case "number":
      return <ContentString content={getNumber(content as string | number, unit)} />;
    case "MGID":
      return <ContentString content={(content as string) || ""} isURL={true} />;
    case "string":
      return <ContentString content={(content as string) || ""} />;
    case "date":
      return <ContentString content={(content as string) || ""} />;
    case "file":
    case "image":
      return (
        <ContentFile
          file={(content as UserFile) || { name: "", sha256: "" }}
        />
      );
    default:
      return <ContentString content={fallbackStringify(content)} />;
  }
};

const ContentObject: React.FC<{
  content: DataContent[];
  order?: ElementType[];
}> = ({ content, order }) => {
  const normalized = normalizeObjectContent(content, order);
  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      {normalized.map((item, index) => {
        const meta = findMetaByTitle(order, item.title);
        return (
          <Box
            display="flex"
            flexDirection="row"
            flexGrow={1}
            key={item.title + index}
          >
            <ContentTitle title={item.title} />
            <ContentItem
              type={item.type}
              content={item.content}
              element_type={item.element_type ?? meta?.element_type}
              unit={item.unit ?? meta?.unit}
              order={meta?.order}
              parentTitle={item.title}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default ContentObject;
