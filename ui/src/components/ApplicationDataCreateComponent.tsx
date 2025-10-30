import { FormProps, UiSchema } from "@rjsf/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Form from "@rjsf/material-ui";
import Box from "@material-ui/core/Box";
import { useState, useEffect } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { tsXLXS } from "ts-xlsx-export";
import Common from "../common/Common";
import TemplateService, {
  TemplateNameData,
  LayeredWordOrder,
} from "../api/TemplateService";
import DevelopmentDataService, {
  RelatedDataMap,
  SampleSearchResult,
  DevelopmentData,
  DataContent,
} from "../api/DevelopmentDataService";
import { DataCard } from "./search/DataCardComponent";
import { CitationCard } from "./search/SearchDisplayComponent";
import ContentObject from "./DevelopmentDataContent";
import Icon from "./Icon";
import ApplicationDataUtils from "./applicationDataCreate/ApplicationDataUtils";
import { AdminDivider } from "./admin/AdminDisplayUtil";
import { JSONSchema7 } from "json-schema";

const aColor = Common.allColor;

interface dataSelectObject {
  [key: string]: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    styledTextFieldAutoComplete: {
      width: "430px",
      padding: "0px",
      backgroundColor: "inhebit",
      "& .MuiInputBase-root": {
        height: "auto",
        paddingLeft: "0px",
        backgroundColor: "inhebit",
      },
      "& .MuiOutlinedInput-input": {
        height: "auto",
        paddingLeft: "11px",
        backgroundColor: "inhebit",
      },
    },
    templateBox: {
      height: "32px",
      display: "flex",
      alignItems: "center",
      marginRight: "13px",
    },
    mainBox: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    filterBox: {
      display: "flex",
      flexDirection: "row",
      marginLeft: "11px",
      alignContent: "flex-start",
      alignItems: "center",
      height: "24px",
      backgroundColor: aColor.lighterBorder,
    },
    searchBox: {
      display: "flex",
      flexDirection: "column",
      marginTop: "44px",
      alignItems: "center",
    },
  })
);

const ApplicationDataSearchForm: React.FC<{
  templateSchema: JSONSchema7;
  templateUiSchmea: UiSchema;
  formData: any;
  onSubmit: (form: FormProps<any>) => void;
  onChange: (form: FormProps<any>) => void;
}> = ({ templateSchema, templateUiSchmea, formData, onSubmit, onChange }) => {
  const buttonClasses = Common.buttonStyles();
  return (
    <Form
      idPrefix="applicationDataSearchForm"
      schema={templateSchema}
      uiSchema={templateUiSchmea}
      formData={formData}
      onSubmit={onSubmit}
      onChange={onChange}
    >
      <Box display="flex" justifyContent="flex-end">
        <Box marginTop="15px">
          <Button type="submit" className={buttonClasses.SecondarySmall}>
            检索
          </Button>
        </Box>
      </Box>
    </Form>
  );
};

const SampleList: React.FC<{
  sampleList: DevelopmentData[];
  setCurrentSample: React.Dispatch<
    React.SetStateAction<DevelopmentData | undefined>
  >;
  haveSearchedFlag: boolean;
}> = ({ sampleList, setCurrentSample, haveSearchedFlag }) => {
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();
  if (haveSearchedFlag && sampleList.length === 0) {
    return (
      <Box marginTop="18px">
        <Typography className={fontClasses.unboldFont}>
          未搜索到相关样品...
        </Typography>
      </Box>
    );
  }
  return (
    <Box marginTop="18px">
      {sampleList &&
        sampleList.map((sample: DevelopmentData, index: number) => (
          <div key={index}>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box>
                <DataCard item={sample} query="" loggedIn={true} />
              </Box>
              <Box>
                <Button
                  className={buttonClasses.NoHoverBorderButton}
                  disableRipple
                  onClick={() => {
                    setCurrentSample(sample);
                  }}
                >
                  <Typography className={fontClasses.DeleteFont}>
                    选择
                  </Typography>
                </Button>
              </Box>
            </Box>
          </div>
        ))}
    </Box>
  );
};

const RelatedDataList: React.FC<{
  currentRelatedData: RelatedDataMap;
  dataSelected: dataSelectObject;
  setDataSelected: React.Dispatch<React.SetStateAction<dataSelectObject>>;
}> = ({ currentRelatedData, dataSelected, setDataSelected }) => {
  const radioClasses = Common.radioStyles();
  const fontClasses = Common.fontStyles();
  if (Object.keys(currentRelatedData).length === 0) {
    return (
      <Box marginTop="44px">
        <Typography className={fontClasses.unboldFont}>
          未搜索到关联数据...
        </Typography>{" "}
      </Box>
    );
  }
  return (
    <div>
      {currentRelatedData &&
        Object.keys(currentRelatedData).map(
          (thisTemplateName: string, index: number) => (
            <Box key={index} marginTop="44px">
              <Box>
                <Typography className={fontClasses.TemplateNameFont}>
                  {thisTemplateName}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="row" marginTop="10px">
                <RadioGroup
                  value={
                    dataSelected[thisTemplateName] !== undefined
                      ? dataSelected[thisTemplateName]
                      : ""
                  }
                  onChange={(event) => {
                    setDataSelected((preDataSelected) => {
                      preDataSelected[thisTemplateName] = (
                        event.target as HTMLInputElement
                      ).value;
                      return { ...preDataSelected };
                    });
                  }}
                >
                  {currentRelatedData[thisTemplateName] &&
                    currentRelatedData[thisTemplateName].map(
                      (thisRelatedData: DevelopmentData, index: number) => (
                        <FormControlLabel
                          key={index}
                          value={String(index)}
                          control={
                            <Radio
                              color="default"
                              className={radioClasses.Primary}
                            />
                          }
                          label={
                            <DataCard
                              item={thisRelatedData}
                              query=""
                              loggedIn={true}
                            />
                          }
                        />
                      )
                    )}
                </RadioGroup>
              </Box>
            </Box>
          )
        )}
    </div>
  );
};

const ShowApplicationData: React.FC<{
  currentRelatedData: RelatedDataMap;
  currentSample: DevelopmentData;
  dataSelected: dataSelectObject;
  templateWordOrder: LayeredWordOrder[];
  citationContent: string;
}> = ({
  currentRelatedData,
  currentSample,
  dataSelected,
  templateWordOrder,
  citationContent,
}) => {
  const buttonClasses = Common.buttonStyles();
  let dataMerged: { [key: string]: DataContent } = {};

  currentSample.json_data.data_content.map(
    (content) => (dataMerged[content.title] = content)
  );
  Object.keys(currentRelatedData).forEach((thisTemplateName: string) => {
    if (dataSelected[thisTemplateName] !== "") {
      const dataIndex = Number(dataSelected[thisTemplateName]);
      const thisRelatedData = currentRelatedData[thisTemplateName][dataIndex];
      if (thisRelatedData !== undefined)
        thisRelatedData.json_data.data_content.map(
          (content) => (dataMerged[content.title] = content)
        );
    }
  });

  let applicationDataContent: DataContent[] = [];
  templateWordOrder.map((obj: LayeredWordOrder) =>
    applicationDataContent.push(
      dataMerged[obj.title] !== undefined
        ? dataMerged[obj.title]
        : { type: "string", title: obj.title, content: "" }
    )
  );

  let applicationDataContentDownload =
    ApplicationDataUtils.getApplicationDataDownload(applicationDataContent);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" m={2} maxWidth="700px" width="700px">
        <ContentObject content={applicationDataContent} />
      </Box>
      <Box display="flex" m={2} maxWidth="700px" width="700px">
        <CitationCard citationString={citationContent} />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        marginTop="53px"
        marginBottom="53px"
      >
        <Button
          className={buttonClasses.Primary}
          disableRipple
          disableElevation
          disableFocusRipple
          onClick={() => {
            tsXLXS()
              .exportAsExcelFile([applicationDataContentDownload])
              .saveAsExcelFile("应用数据");
          }}
        >
          下载数据
        </Button>
      </Box>
    </Box>
  );
};

const ApplicationtDataCreateComponent: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();
  const [beginWord, setBeginWord] = useState("");
  const [candidateTemplate, setCandidateTemplate] = useState<{
    [key: string]: string;
  }>({});
  const [currentTemplate, setCurrentTemplate] = useState<{
    [key: string]: string;
  }>({});
  const [templateNameList, setTemplateNameList] = useState<string[]>([]);
  const [templateNameDict, setTemplateNameDict] = useState<{
    [key: string]: string;
  }>({});
  const [templateSchema, setTemplateSchema] = useState<JSONSchema7>(
    JSON.parse("{}")
  );
  const [templateWordOrder, setTemplateWordOrder] = useState<
    LayeredWordOrder[]
  >([]);
  const [applicationDataSearchFormFlag, setApplicationDataSearchFormFlag] =
    useState(false);
  const [haveSearchedFlag, setHaveSearchedFlag] = useState(false);
  const [currentSampleList, setCurrentSampleList] = useState<DevelopmentData[]>(
    []
  );
  const [searchFormData, setSearchFormData] = useState<any>();
  const [currentSample, setCurrentSample] = useState<DevelopmentData>();
  const [currentRelatedData, setCurrentRelatedData] =
    useState<RelatedDataMap>();
  const [dataSelected, setDataSelected] = useState<dataSelectObject>({});
  const [generateDataFlag, setGenerateDataFlag] = useState(false);
  const [citationContent, setCitationContent] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        if (
          beginWord !== undefined &&
          beginWord !== "" &&
          beginWord.indexOf("'") === -1
        ) {
          const templateList: TemplateNameData =
            await TemplateService.getApplicationTemplateListWithBegin(
              beginWord
            );
          setTemplateNameList(templateList.name_list);
          setTemplateNameDict(templateList.name_dict);
        }
      } catch (e) {
        setTemplateNameList([]);
        setTemplateNameDict({});
        console.error(e);
      }
    })();
  }, [beginWord]);

  useEffect(() => {
    void (async () => {
      try {
        if (
          currentTemplate["id"] !== undefined &&
          currentTemplate["id"] !== ""
        ) {
          let templateSchemaGet: JSONSchema7 =
            await TemplateService.getTemplateSchemaWithId(
              currentTemplate["id"]
            );
          templateSchemaGet["required"] = [];
          for (var obj in templateSchemaGet["properties"]) {
            if (
              (templateSchemaGet["properties"][obj] as JSONSchema7)["type"] ===
              "object"
            )
              (templateSchemaGet["properties"][obj] as JSONSchema7)[
                "required"
              ] = [];
          }
          const templateWordOrderGetget: LayeredWordOrder[] =
            await TemplateService.getTemplateWordOrderWithId(
              currentTemplate["id"]
            );
          setTemplateSchema(templateSchemaGet);
          setTemplateWordOrder(templateWordOrderGetget);
        }
      } catch (e) {
        setTemplateSchema(JSON.parse("{}"));
        setTemplateWordOrder([]);
        console.error(e);
      }
    })();
  }, [currentTemplate]);

  useEffect(() => {
    void (async () => {
      if (currentSample !== undefined) {
        const relatedDataGet: RelatedDataMap =
          await DevelopmentDataService.relatedDataSearch(
            currentTemplate["id"],
            currentSample.json_data.MGID,
            0,
            20
          );
        setCurrentRelatedData(relatedDataGet);
      }
    })();
  }, [currentSample, currentTemplate]);

  const onApplicationDataSearchFormSubmit = async (form: FormProps<any>) => {
    const sampleSearchResult: SampleSearchResult =
      await DevelopmentDataService.sampleSearch(
        currentTemplate["id"],
        currentTemplate["name"],
        JSON.stringify(form.formData),
        0,
        20
      );
    setCurrentSampleList(sampleSearchResult.sample_list);
    setCitationContent(sampleSearchResult.citation_content);
    setCurrentSample(undefined);
    setHaveSearchedFlag(true);
    setCurrentRelatedData(undefined);
    setGenerateDataFlag(false);
  };
  const templateUiSchmea =
    ApplicationDataUtils.uiSchemaObject(templateWordOrder);

  return (
    <Box className={classes.mainBox} width="850px">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" marginTop="94px">
          <Typography
            component="h1"
            variant="h6"
            className={fontClasses.WordCreatetitle}
          >
            创建应用数据
          </Typography>
        </Box>
        <Box className={classes.searchBox}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <Box display="flex" alignItems="center">
              <Box className={classes.templateBox}>
                <Typography align="right" className={fontClasses.boldFont}>
                  <span style={{ color: aColor.requiredRed }}>*</span>
                  选择模板：
                </Typography>
              </Box>
              <Box>
                <Autocomplete
                  size="small"
                  freeSolo
                  disableClearable
                  options={templateNameList.map((option) => option)}
                  onChange={(event: any, newValue: string) => {
                    newValue in templateNameDict
                      ? setCandidateTemplate({
                          name: newValue,
                          id: templateNameDict[newValue],
                        })
                      : setCandidateTemplate({ name: "", id: "" });
                  }}
                  renderInput={(params: any) => (
                    <TextField
                      className={classes.styledTextFieldAutoComplete}
                      {...params}
                      type="string"
                      variant="outlined"
                      label="输入模板名称"
                      InputProps={{ ...params.InputProps, type: "search" }}
                      onChange={(event) => {
                        setBeginWord(event.target.value);
                        setApplicationDataSearchFormFlag(false);
                        setTemplateSchema(JSON.parse("{}"));
                        setTemplateWordOrder([]);
                        setCandidateTemplate({ name: "", id: "" });
                        setCurrentSampleList([]);
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
            <Box marginLeft="15px">
              <Button
                variant="contained"
                disableElevation
                disableFocusRipple
                onClick={() => {
                  if (candidateTemplate["id"] !== "") {
                    setApplicationDataSearchFormFlag(true);
                    setCurrentTemplate({
                      name: candidateTemplate["name"],
                      id: candidateTemplate["id"],
                    });
                  }
                }}
              >
                <Typography>
                  <span>确定模板</span>
                </Typography>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      {applicationDataSearchFormFlag ? (
        <div>
          <Box marginTop="46px">
            <AdminDivider value="样品数据检索" />
          </Box>
          <Box display="flex" justifyContent="center">
            <ApplicationDataSearchForm
              templateSchema={templateSchema}
              templateUiSchmea={templateUiSchmea}
              formData={searchFormData}
              onSubmit={onApplicationDataSearchFormSubmit}
              onChange={(form) => {
                setSearchFormData(form.formData);
              }}
            />
          </Box>
        </div>
      ) : null}

      {/* filter sample information and filter related data only appear after clicking search button */}
      {haveSearchedFlag ? (
        <Box marginTop="48px">
          <Box display="flex" flexDirection="row">
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              flexGrow={1}
            >
              <Box display="flex" flexDirection="row" alignItems="center">
                <Box>
                  <Typography className={fontClasses.unboldFont}>
                    筛选样品信息：
                  </Typography>
                </Box>
                {currentSample !== undefined ? (
                  <Box className={classes.filterBox}>
                    <Box marginLeft="7px">
                      <Typography className={fontClasses.unboldFont}>
                        {currentSample.json_data.title}
                      </Typography>
                    </Box>
                    <Box marginLeft="21px" marginRight="11px">
                      <Button
                        className={buttonClasses.NoHoverBorderButtonSmall}
                        disableRipple
                        onClick={() => {
                          setCurrentSample(undefined);
                          setCurrentRelatedData(undefined);
                          setDataSelected({});
                          setGenerateDataFlag(false);
                        }}
                      >
                        {Icon.closeSmall}
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Box>
              {/* filter related data will show the names of selected related data */}
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                marginTop="18px"
              >
                <Box>
                  <Typography className={fontClasses.unboldFont}>
                    筛选关联数据：
                  </Typography>
                </Box>
                {currentRelatedData &&
                  Object.keys(currentRelatedData).map(
                    (thisTemplateName: string, index: number) => (
                      <div key={index}>
                        {dataSelected[thisTemplateName] !== "" &&
                        currentRelatedData[thisTemplateName][
                          Number(dataSelected[thisTemplateName])
                        ] !== undefined ? (
                          <Box className={classes.filterBox}>
                            <Box marginLeft="7px">
                              <Typography className={fontClasses.unboldFont}>
                                {
                                  currentRelatedData[thisTemplateName][
                                    Number(dataSelected[thisTemplateName])
                                  ].json_data.title
                                }
                              </Typography>
                            </Box>
                            <Box marginLeft="21px" marginRight="11px">
                              <Button
                                className={
                                  buttonClasses.NoHoverBorderButtonSmall
                                }
                                disableRipple
                                onClick={() => {
                                  setDataSelected((preDataSelected) => {
                                    preDataSelected[thisTemplateName] = "";
                                    return { ...preDataSelected };
                                  });
                                  setGenerateDataFlag(false);
                                }}
                              >
                                {Icon.closeSmall}
                              </Button>
                            </Box>
                          </Box>
                        ) : null}
                      </div>
                    )
                  )}
              </Box>
            </Box>
            {/* generate application data button only appear after selecting one sample */}
            {currentSample !== undefined ? (
              <Box display="flex">
                <Button
                  className={buttonClasses.Primary}
                  disableRipple
                  disableElevation
                  disableFocusRipple
                  onClick={() => setGenerateDataFlag(true)}
                >
                  生成
                </Button>
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {/* SampleList component only appears if no sample is selected */}
      {/* RelatedDataList component only appears if one sample is selected */}
      {/* Above two components disappear after clicking generate application data button */}

      {!generateDataFlag ? (
        <Box display="flex" justifyContent="center">
          {currentSample === undefined ? (
            <SampleList
              sampleList={currentSampleList}
              setCurrentSample={setCurrentSample}
              haveSearchedFlag={haveSearchedFlag}
            />
          ) : currentRelatedData !== undefined ? (
            <RelatedDataList
              currentRelatedData={currentRelatedData}
              dataSelected={dataSelected}
              setDataSelected={setDataSelected}
            />
          ) : null}
        </Box>
      ) : currentSample !== undefined && currentRelatedData !== undefined ? (
        <Box
          display="flex"
          justifyContent="center"
          flexDirection="column"
          marginTop="50px"
        >
          <AdminDivider value="应用数据生成" />
          <Box display="flex" justifyContent="center">
            <ShowApplicationData
              currentRelatedData={currentRelatedData}
              currentSample={currentSample}
              dataSelected={dataSelected}
              templateWordOrder={templateWordOrder}
              citationContent={citationContent}
            />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default ApplicationtDataCreateComponent;
