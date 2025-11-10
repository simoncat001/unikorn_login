import React, { useState, useEffect } from "react";
import TemplateService, {
  Template,
  templateJSON,
  LayeredWordOrder,
} from "../api/TemplateService";
import { Box, Typography, Button } from "@material-ui/core";

import { useHistory } from "react-router-dom";
import Common from "../common/Common";
import Map from "../common/Map";
import Icon from "./Icon";
import ReviewStatusUtils from "../common/ReviewStatusUtils";
import Utils, { CenterSnackbar } from "../common/Utils";
import {
  ERROR_PATH,
  TEMPLATES_EDIT_PATH,
  TEMPLATES_DETAIL_PATH,
  TEMPLATES_PATH,
} from "../common/Path";
import { useStyles, BreadNav, DetailDivier } from "./DetailUtils";
import EditButton from "./detail/EditButton";
import DetailDataItem from "./detail/DetailDataItem";
import RejectedReason from "./detail/RejectedReason";
import DesginComponent from "./DesignComponent";
import { JSONSchema7 } from "json-schema";
import LoadingComponent from "./LoadingComponent";
import PreviewCard from "./detail/PreviewCard";
import {
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW,
} from "../common/ReviewStatusUtils";

const aColor = Common.allColor;

const SchemaItem: React.FC<{
  dataType: string;
  title: string;
  unit: string;
}> = ({ dataType, title, unit }) => {
  return (
    <Box>
      {DesginComponent.templateItem(dataType, title)}
      <Box style={{ margin: "10px 8px" }}>
        {DesginComponent.templateDataTypeComponent(dataType, unit)}
      </Box>
    </Box>
  );
};

const PreviewChangeButton: React.FC<{
  review_status: string;
  id: string;
  setTemplateJsonData: React.Dispatch<
    React.SetStateAction<templateJSON | undefined>
  >;
  setStatus: React.Dispatch<React.SetStateAction<number>>;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ review_status, id, setTemplateJsonData, setStatus, setAlertOpen }) => {
  const btnClasses = Common.buttonStyles();
  const handleClick = async () => {
    try {
      const status = await TemplateService.applyPassedReview(id);
      setStatus(status);
      if (status === 0) {
        setTemplateJsonData((oldTemplateJsonData) => {
          if (oldTemplateJsonData) {
            oldTemplateJsonData.review_status =
              REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW;
            return { ...oldTemplateJsonData };
          }
        });
      }
      setAlertOpen(true);
    } catch (e) {
      console.error(e);
    }
  };
  if (review_status === REVIEW_STATUS_PASSED_REVIEW_PREVIEW)
    return (
      <Button
        className={btnClasses.SecondarySmallIcon}
        startIcon={Icon.editIcon}
        disableRipple
        onClick={handleClick}
      >
        申请正式发表
      </Button>
    );
  else return null;
};

const OrderedSchemaList: React.FC<{
  wordOrder: LayeredWordOrder[];
  schema: JSONSchema7;
  depth: number;
}> = ({ wordOrder, schema, depth }) => {
  return (
    <div
      style={{
        borderLeftStyle: "solid",
        borderLeftColor: aColor.border,
        borderLeftWidth: depth > 0 ? "1px" : "0px",
      }}
    >
      <div
        style={{
          marginLeft: "24px",
        }}
      >
        {wordOrder.map((currentKey) => {
          const unit = currentKey.unit ? currentKey.unit : "";

          return currentKey.type === "array" || currentKey.type === "object" ? (
            <div key={currentKey.title + depth}>
              <SchemaItem
                dataType={currentKey.type}
                title={currentKey.title}
                unit={unit}
              />
              <OrderedSchemaList
                schema={
                  (schema.properties?.[currentKey.title] as JSONSchema7) ||
                  schema.items
                }
                wordOrder={currentKey.order}
                depth={depth + 1}
              />
            </div>
          ) : (
            <SchemaItem
              dataType={currentKey.type}
              title={currentKey.title}
              unit={unit}
              key={currentKey.title + depth}
            />
          );
        })}
      </div>
    </div>
  );
};

const TemplateDetailComponent: React.FC<{ id: string }> = ({ id }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [templateJsonData, setTemplateJsonData] = useState<templateJSON>();
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [status, setStatus] = React.useState(0);
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const history = useHistory();

  useEffect(() => {
    void (async () => {
      try {
        const templateObject: Template = await TemplateService.getTemplate(id);
        setTemplateJsonData(templateObject.json_schema);
      } catch (e) {
        console.log(e);
      }
      setIsLoaded(true);
    })();
  }, [id]);

  if (!isLoaded) {
    return <LoadingComponent />;
  }
  if (!templateJsonData) {
    history.replace(ERROR_PATH);
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" m={4}>
      <CenterSnackbar
        open={alertOpen}
        status={status}
        handleClose={() => {
          setAlertOpen(false);
        }}
        ifApply={true}
      />
      <BreadNav
        HOME_PATH={TEMPLATES_PATH}
        breadName={templateJsonData.title}
        DETAIL_PATH={TEMPLATES_DETAIL_PATH + "/" + id}
      />
      <Box display="flex" my={3}>
        <Typography className={fontClasses.DetailTitle}>
          {templateJsonData.title}
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <EditButton
          review_status={templateJsonData.review_status}
          EDIT_PATH={TEMPLATES_EDIT_PATH + "/" + id}
          type={"template"}
        />
        <PreviewChangeButton
          review_status={templateJsonData.review_status}
          id={id}
          setTemplateJsonData={setTemplateJsonData}
          setAlertOpen={setAlertOpen}
          setStatus={setStatus}
        />
      </Box>
      <Box display="flex" className={classes.detailBackground}>
        <Box display="flex" flexDirection="row" mx={2} my={3}>
          <Box display="flex" flexDirection="column">
            <DetailDataItem
              label={Map.templateItemMap.author}
              content={templateJsonData.author}
            />
            <DetailDataItem
              label={Map.templateItemMap.create_timestamp}
              content={Utils.transformTimeStamp(
                templateJsonData.create_timestamp
              )}
            />
            <DetailDataItem
              label={Map.templateItemMap.reviewer}
              content={templateJsonData.reviewer}
            />
            <DetailDataItem
              label={Map.templateItemMap.review_status}
              content={
                templateJsonData.review_status === "draft"
                  ? ""
                  : ReviewStatusUtils.reviewStatusMap[
                      templateJsonData.review_status
                    ]
              }
              icon={
                <RejectedReason
                  review_status={templateJsonData.review_status}
                  rejected_reason={templateJsonData.rejected_reason}
                />
              }
            />
            <DetailDataItem
              label={Map.templateItemMap.citation_count}
              content={templateJsonData.citation_count}
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
              label={Map.templateItemMap.title}
              content={templateJsonData.title}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.data_generate_method}
              content={
                Map.dataGenerateMethodMap[templateJsonData.data_generate_method]
              }
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.institution}
              content={templateJsonData.institution}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.template_publish_platform}
              content={templateJsonData.template_publish_platform}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.source_standard_number}
              content={templateJsonData.source_standard_number}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.source_standard_name}
              content={templateJsonData.source_standard_name}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.templateItemMap.template_type}
              content={Map.templateTypeMap[templateJsonData.template_type]}
              isLeft={false}
            />
          </Box>
        </Box>
      </Box>
      <PreviewCard
        itemType={"templates"}
        content={
          <OrderedSchemaList
            wordOrder={templateJsonData.word_order || []}
            schema={templateJsonData.schema}
            depth={0}
          />
        }
      />
    </Box>
  );
};

export default TemplateDetailComponent;
