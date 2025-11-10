import { useState, useEffect } from "react";
import WordService, { Word } from "../api/WordService";
import { Box, Typography } from "@material-ui/core";

import { useHistory } from "react-router-dom";
import Common from "../common/Common";
import Map from "../common/Map";
import ReviewStatusUtils from "../common/ReviewStatusUtils";
import Utils from "../common/Utils";
import { useStyles, BreadNav, DetailDivier } from "./DetailUtils";
import {
  ERROR_PATH,
  WORDS_EDIT_PATH,
  WORDS_PATH,
  WORDS_DETAIL_PATH,
} from "../common/Path";
import LoadingComponent from "./LoadingComponent";
import EditButton from "./detail/EditButton";
import RejectedReason from "./detail/RejectedReason";
import DetailDataItem from "./detail/DetailDataItem";

// 定义对象字段类型接口
interface FieldInfo {
  type: string;
  description?: string;
  required?: boolean;
}

const WordDetailComponent: React.FC<{ id: string }> = ({ id }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [wordJsonData, setWordJsonData] = useState(JSON.parse("{}"));
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const history = useHistory();

  useEffect(() => {
    void (async () => {
      try {
        const wordObject: Word = await WordService.getWord(id);
        setWordJsonData(wordObject.json_data);
      } catch (e) {
        setWordJsonData(null);
      }
      setIsLoaded(true);
    })();
  }, [id]);

  if (!isLoaded) {
    return <LoadingComponent />;
  }
  if (!wordJsonData) {
    history.replace(ERROR_PATH);
    return null;
  }

  let dataTypeSwitch = null;
  if (
    wordJsonData.data_type === "number" ||
    wordJsonData.data_type === "number_range"
  ) {
    dataTypeSwitch = (
      <DetailDataItem
        label={Map.wordItemMap.unit}
        content={wordJsonData.unit}
        isLeft={false}
      />
    );
  } else if (wordJsonData.data_type === "enum_text") {
    const optionList: string[] = wordJsonData.options;
    dataTypeSwitch = (
      <div>
        {optionList.map((opition, index) => (
          <Box m={1} key={index}>
            <Box className={classes.rightTitle}>
              <Typography
                className={fontClasses.boldFont}
                style={{ whiteSpace: "pre" }}
              >
                {index === 0 ? "可选项列表：" : "\n"}
              </Typography>
            </Box>
            <Box className={classes.rightValue}>
              <Typography className={fontClasses.unboldFont}>
                {index + 1}. {opition}
              </Typography>
            </Box>
          </Box>
        ))}
      </div>
    );
  } else if (wordJsonData.data_type === "object" && wordJsonData.object_fields) {
    // 处理对象类型数据，展示object_fields下的所有字段
    const objectFields: Record<string, FieldInfo> = wordJsonData.object_fields;
    dataTypeSwitch = (
      <div>
        <Box m={1}>
          <Box className={classes.rightTitle}>
            <Typography className={fontClasses.boldFont}>
              对象字段列表：
            </Typography>
          </Box>
          <Box className={classes.rightValue}>
            {Object.entries(objectFields).map(([fieldName, fieldInfo], index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <Typography className={fontClasses.boldFont}>
                  {fieldName}
                </Typography>
                <Typography className={fontClasses.unboldFont} style={{ marginLeft: '16px' }}>
                  类型: {Map.dataTypeMap[fieldInfo.type] || fieldInfo.type}
                </Typography>
                {fieldInfo.description && (
                  <Typography className={fontClasses.unboldFont} style={{ marginLeft: '16px' }}>
                    描述: {fieldInfo.description}
                  </Typography>
                )}
                {fieldInfo.required && (
                  <Typography className={fontClasses.unboldFont} style={{ marginLeft: '16px', color: 'red' }}>
                    必填: 是
                  </Typography>
                )}
              </div>
            ))}
          </Box>
        </Box>
      </div>
    );
  }

  const WordDetailTitle =
    "N" + wordJsonData.serial_number + "：" + wordJsonData.chinese_name;

  return (
    <Box display="flex" flexDirection="column" m={4}>
      <BreadNav
        HOME_PATH={WORDS_PATH}
        breadName={WordDetailTitle}
        DETAIL_PATH={WORDS_DETAIL_PATH + "/" + id}
      />
      <Box display="flex" my={3}>
        <Typography className={fontClasses.DetailTitle}>
          {WordDetailTitle}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <EditButton
          review_status={wordJsonData.review_status}
          EDIT_PATH={WORDS_EDIT_PATH + "/" + id}
        />
      </Box>
      <Box display="flex" className={classes.detailBackground}>
        <Box display="flex" flexDirection="row" mx={2} my={3}>
          <Box display="flex" flexDirection="column">
            <DetailDataItem
              label={Map.wordItemMap.author}
              content={wordJsonData.author}
            />
            <DetailDataItem
              label={Map.wordItemMap.create_timestamp}
              content={Utils.transformTimeStamp(wordJsonData.create_timestamp)}
            />
            <DetailDataItem
              label={Map.wordItemMap.reviewer}
              content={wordJsonData.reviewer}
            />
            <DetailDataItem
              label={Map.wordItemMap.review_status}
              content={
                ReviewStatusUtils.isDraft(wordJsonData.review_status)
                  ? ""
                  : ReviewStatusUtils.reviewStatusMap[
                      wordJsonData.review_status
                    ]
              }
              icon={
                <RejectedReason
                  review_status={wordJsonData.review_status}
                  rejected_reason={wordJsonData.rejected_reason}
                />
              }
            />
          </Box>
          <DetailDivier />
          <Box
            display="flex"
            flexDirection="column"
            ml={3}
            style={{ width: "auto" }}
          >
            <DetailDataItem
              label={Map.wordItemMap.chinese_name}
              content={wordJsonData.chinese_name}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.wordItemMap.english_name}
              content={wordJsonData.english_name}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.wordItemMap.abbr}
              content={wordJsonData.abbr}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.wordItemMap.definition}
              content={wordJsonData.definition}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.wordItemMap.data_type}
              content={Map.dataTypeMap[wordJsonData.data_type]}
              isLeft={false}
            />
            {dataTypeSwitch}
            <DetailDataItem
              label={Map.wordItemMap.source_standard_id}
              content={wordJsonData.source_standard_id}
              isLeft={false}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WordDetailComponent;
