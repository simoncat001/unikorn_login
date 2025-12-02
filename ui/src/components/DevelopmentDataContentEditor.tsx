import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@material-ui/core";
import { DataContent, NumberRange, UserFile } from "../api/DevelopmentDataService";
import Common from "../common/Common";

const PrimitiveInput: React.FC<{
  label: string;
  value: string | number | null;
  type?: string;
  onChange: (value: string) => void;
}> = ({ label, value, type, onChange }) => (
  <TextField
    fullWidth
    variant="outlined"
    size="small"
    margin="dense"
    label={label}
    type={type}
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
  />
);

const ArrayEditor: React.FC<{
  item: DataContent;
  onChange: (updated: DataContent) => void;
}> = ({ item, onChange }) => {
  const btnClasses = Common.buttonStyles();
  const content = Array.isArray(item.content)
    ? item.content
    : ([] as (string | number | DataContent)[]);
  const isObjectArray =
    content.length > 0 &&
    typeof content[0] === "object" &&
    content[0] !== null &&
    (content[0] as any).title;

  if (isObjectArray) {
    const objectContent = content as DataContent[];
    return (
      <Box display="flex" flexDirection="column" width="100%" mt={1}>
        {objectContent.map((child, idx) => (
          <Box key={`${child.title}-${idx}`} ml={2}>
            <EditableDataContent
              item={child}
              onChange={(updated) => {
                const next = [...objectContent];
                next[idx] = updated;
                onChange({ ...item, content: next as DataContent[] });
              }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  const primitiveContent = content as (string | number)[];
  return (
    <Box display="flex" flexDirection="column" width="100%" mt={1}>
      {primitiveContent.map((value, idx) => (
        <Box display="flex" alignItems="center" key={`${item.title}-${idx}`}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            margin="dense"
            value={value as any}
            onChange={(e) => {
              const next = [...primitiveContent];
              next[idx] = e.target.value;
              onChange({ ...item, content: next as (string | number)[] });
            }}
          />
          <Button
            className={btnClasses.SecondarySmall}
            onClick={() => {
              const next = [...primitiveContent];
              next.splice(idx, 1);
              onChange({ ...item, content: next as (string | number)[] });
            }}
          >
            删除
          </Button>
        </Box>
      ))}
      <Box>
        <Button
          className={btnClasses.SecondarySmall}
          onClick={() =>
            onChange({
              ...item,
              content: [...primitiveContent, ""] as (string | number)[],
            })
          }
        >
          添加条目
        </Button>
      </Box>
    </Box>
  );
};

const FileEditor: React.FC<{
  item: DataContent;
  onChange: (updated: DataContent) => void;
}> = ({ item, onChange }) => {
  const content: UserFile = (item.content as UserFile) || { name: "", sha256: "" };
  return (
    <Box display="flex" flexDirection="column" width="100%" mt={1}>
      <PrimitiveInput
        label={`${item.title} - 文件名`}
        value={content.name}
        onChange={(v) => onChange({ ...item, content: { ...content, name: v } })}
      />
      <PrimitiveInput
        label={`${item.title} - 哈希/路径`}
        value={content.sha256}
        onChange={(v) => onChange({ ...item, content: { ...content, sha256: v } })}
      />
    </Box>
  );
};

const NumberRangeEditor: React.FC<{
  item: DataContent;
  onChange: (updated: DataContent) => void;
}> = ({ item, onChange }) => {
  const content: NumberRange = (item.content as NumberRange) || { start: "", end: "" };
  return (
    <Box display="flex" flexDirection="column" width="100%" mt={1}>
      <PrimitiveInput
        label={`${item.title} 起始`}
        value={content.start}
        onChange={(v) => onChange({ ...item, content: { ...content, start: v } })}
      />
      <PrimitiveInput
        label={`${item.title} 结束`}
        value={content.end}
        onChange={(v) => onChange({ ...item, content: { ...content, end: v } })}
      />
    </Box>
  );
};

const EditableDataContent: React.FC<{
  item: DataContent;
  onChange: (item: DataContent) => void;
}> = ({ item, onChange }) => {
  const renderByType = () => {
    switch (item.type) {
      case "object":
        return (
          <Box display="flex" flexDirection="column" width="100%" mt={1}>
            {(item.content as DataContent[] | undefined)?.map((child, idx) => (
              <Box key={`${child.title}-${idx}`} ml={2}>
                <EditableDataContent
                  item={child}
                  onChange={(updated) => {
                    const next: DataContent[] = Array.isArray(item.content)
                      ? [...(item.content as DataContent[])]
                      : [];
                    next[idx] = updated;
                    onChange({ ...item, content: next });
                  }}
                />
              </Box>
            ))}
          </Box>
        );
      case "array":
        return <ArrayEditor item={item} onChange={onChange} />;
      case "file":
      case "image":
        return <FileEditor item={item} onChange={onChange} />;
      case "number_range":
        return <NumberRangeEditor item={item} onChange={onChange} />;
      default:
        return (
          <PrimitiveInput
            label={item.unit ? `${item.title} (${item.unit})` : item.title}
            value={item.content as any}
            type={item.type === "number" ? "number" : item.type === "date" ? "date" : undefined}
            onChange={(v) => onChange({ ...item, content: item.type === "number" ? Number(v) : v })}
          />
        );
    }
  };

  return (
    <Box display="flex" flexDirection="column" width="100%" my={1}>
      <Typography variant="subtitle2">{item.title}</Typography>
      {renderByType()}
    </Box>
  );
};

const DevelopmentDataContentEditor: React.FC<{
  dataContent: DataContent[];
  onChange: (next: DataContent[]) => void;
}> = ({ dataContent, onChange }) => {
  return (
    <Paper style={{ padding: 16, width: "100%" }}>
      <Typography variant="h6">数据内容编辑</Typography>
      <Divider style={{ margin: "8px 0" }} />
      {dataContent.map((item, idx) => (
        <EditableDataContent
          key={`${item.title}-${idx}`}
          item={item}
          onChange={(updated) => {
            const next = [...dataContent];
            next[idx] = updated;
            onChange(next);
          }}
        />
      ))}
    </Paper>
  );
};

export default DevelopmentDataContentEditor;
