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

  // 处理文件名中可能包含的"file:"前缀和"/api/download/"前缀
  let displayName = file.name;
  // 使用replace函数移除file:前缀
  displayName = displayName.replace(/^file:/, '');
  // 使用replace函数移除/api/download/前缀
  displayName = displayName.replace(/^\/api\/download\//, '');
  console.log("🔍 ContentFile中处理后的文件名:", displayName);

  // 清理文件名中的特殊字符，确保显示正常
  displayName = displayName.replace(/[:;]+$/, "");

  // 构建下载链接，直接使用sha256和扩展名
  const downloadUrl = `/api/download/${displayName}`;

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
          title={`下载文件: ${displayName}`}
        >
          {displayName}
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

const ContentArray: React.FC<{
  type: string;
  title: string;
  contentList: (DataContent | string | number)[];
  unit?: string;
}> = ({ type, title, contentList, unit }) => {
  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      {contentList.map((item: any, index: number) => (
        <Box display="flex" flexDirection="row" flexGrow={1} key={index}>
          <ContentTitle title={title} />
          <ContentItem type={type} content={item} unit={unit} />
        </Box>
      ))}
    </Box>
  );
};

const ContentItem: React.FC<{
  type: string;
  content: DataContent["content"];
  element_type?: ElementType;
  unit?: string;
}> = ({ type, content, element_type, unit }) => {
  switch (type) {
    case "object":
      return <ContentObject content={(content as DataContent[]) || []} />;
    case "array":
      return (
        <ContentArray
          type={element_type?.type || ""}
          title={element_type?.title || ""}
          contentList={Array.isArray(content) ? (content as any[]) : []}
          unit={element_type?.unit || ""}
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
      return <ContentString content={(content as string | number | null) ?? ""} />;
  }
};

const ContentObject: React.FC<{ content: DataContent[] }> = ({ content }) => {
  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
      {content.map((item, index) => (
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
            element_type={item.element_type}
            unit={item.unit}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ContentObject;
