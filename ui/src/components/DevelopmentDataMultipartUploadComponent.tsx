import { makeStyles, createStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useState, useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Common from "../common/Common";
import TemplateService, { TemplateNameData } from "../api/TemplateService";
import WebSubmit from "./developmentDataCreate/DevelopmentWebSubmit";
import FileSubmit from "./developmentDataCreate/DevelopmentFileSubmit";
import { JSONSchema7 } from "json-schema";
import CreateStatusComponent from "./CreateStatusComponent";
import DevelopmentDataService, {
  DevelopmentData,
} from "../api/DevelopmentDataService";
import UserService from "../api/UserService";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
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
  })
);

const DevelopmentDataMultipartUploadComponent: React.FC<{
  id?: string;
  isEdit: boolean;
}> = ({ id = "", isEdit }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const radioClasses = Common.radioStyles();
  const [beginWord, setBeginWord] = useState("");
  const [radioValue, setRadioValue] = useState("");
  const [candidateTemplate, setCandidateTemplate] = useState<{
    [key: string]: string;
  }>({ name: "", id: "" });
  const [currentTemplate, setCurrentTemplate] = useState<{
    [key: string]: string;
  }>({ name: "", id: "" });
  const [templateNameList, setTemplateNameList] = useState<string[]>([]);
  const [templateNameDict, setTemplateNameDict] = useState<{
    [key: string]: string;
  }>({});
  const [templateSchema, setTemplateSchema] = useState<JSONSchema7>(
    JSON.parse("{}")
  );
  const [autoCompleteInputValue, setAutoCompleteInputValue] = useState("");
  const [pageStatus, setPageStatus] = useState("create");
  const [devDataId, setDevDataId] = useState("");
  const [radioClickFlag, setRadioClickFlag] = useState(false);
  const [fileToWebFlag, setFileToWebFlag] = useState(false);
  const [devCreateDataFromFile, setDevCreateDataFromFile] = useState<JSON>(
    JSON.parse("{}")
  );
  const enumList = ["webSubmit", "fileSubmit"];
  const enumListLabel = ["网页提交", "文件提交"];
  const [fileUploadStatus, setFileUploadStatus] = useState<{
  [key: string]: { progress: number; status: 'idle' | 'uploading' | 'completed' | 'error' }
}>({});

// 处理文件上传状态更新
const handleFileUploadProgress = (
  fieldPath: string,
  progress: number,
  status: 'idle' | 'uploading' | 'completed' | 'error'
) => {
  setFileUploadStatus(prev => ({
    ...prev,
    [fieldPath]: { progress, status }
  }));
};

  useEffect(() => {
    void (async () => {
      try {
        if (
          beginWord !== undefined &&
          beginWord !== "" &&
          beginWord.indexOf("'") === -1
        ) {
          const templateList: TemplateNameData =
            await TemplateService.getTemplateListWithBegin(beginWord);
          setTemplateNameList(templateList.name_list);
          setTemplateNameDict(templateList.name_dict);
        } else if (beginWord === "") {
          setTemplateNameList([]);
          setTemplateNameDict({});
        }
      } catch (e) {
        UserService.navigateToErrorPage();
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
          const templateSchema: JSONSchema7 =
            await TemplateService.getTemplateSchemaWithId(
              currentTemplate["id"]
            );
          setTemplateSchema(templateSchema);
        } else if (currentTemplate["id"] === "") {
          setTemplateSchema(JSON.parse("{}"));
        }
      } catch (e) {
        UserService.navigateToErrorPage();
      }
    })();
  }, [currentTemplate]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTemplate({
      name: candidateTemplate["name"],
      id: candidateTemplate["id"],
    });
    if (candidateTemplate["id"] !== "") {
      setRadioValue((event.target as HTMLInputElement).value);
      setRadioClickFlag(false);
    } else {
      setRadioClickFlag(true);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        if (isEdit) {
          const devDataObject: DevelopmentData =
            await DevelopmentDataService.getDevData(id);
          const template_name = devDataObject.json_data.template_name;
          setCurrentTemplate({
            name: template_name,
            id: devDataObject.template_id,
          });
          setDevDataId(id);
          setAutoCompleteInputValue(template_name);
          setRadioValue("webSubmit");
        }
      } catch (e) {
        console.log(e);
        UserService.navigateToErrorPage();
      }
    })();
  }, [id, isEdit]);

  return pageStatus === "create" ? (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">
      
      <Box display="flex" marginTop="94px">
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
        >
          数据分片上传测试使用
        </Typography>
      </Box>
      
      <Box display="flex" marginTop="94px">
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
        >
          {isEdit ? "研发数据编辑" : "上传研发数据"}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" marginTop="44px" width="550px">
        <Box display="flex" flexDirection="row" alignItems="center">
          <Typography className={fontClasses.boldFont}>
            <span style={{ color: aColor.requiredRed }}>*</span>
            选择模板：
          </Typography>
          <Box display="flex" marginLeft={3}>
            <Autocomplete
              size="small"
              freeSolo
              disableClearable
              inputValue={autoCompleteInputValue}
              options={templateNameList.map((option) => option)}
              onInputChange={(event: any, newValue: string) => {
                setAutoCompleteInputValue(newValue);
              }}
              onChange={(event: any, newValue: string) => {
                newValue in templateNameDict
                  ? setCandidateTemplate({
                      name: newValue,
                      id: templateNameDict[newValue],
                    })
                  : setCandidateTemplate({ name: "", id: "" });
                setRadioValue("");
              }}
              renderInput={(params: any) => (
                <TextField
                  className={classes.styledTextFieldAutoComplete}
                  {...params}
                  type="string"
                  variant="outlined"
                  InputProps={{ ...params.InputProps, type: "search" }}
                  value={beginWord}
                  onBlur={(event) => {
                    event.target.value in templateNameDict
                      ? setCandidateTemplate({
                          name: event.target.value,
                          id: templateNameDict[event.target.value],
                        })
                      : setCandidateTemplate({ name: "", id: "" });
                  }}
                  onChange={(event) => {
                    setBeginWord(event.target.value);
                    setRadioValue("");
                    setTemplateSchema(JSON.parse("{}"));
                    setCandidateTemplate({ name: "", id: "" });
                    setRadioClickFlag(false);
                    setFileToWebFlag(false);
                    setDevCreateDataFromFile(JSON.parse("{}"));
                  }}
                />
              )}
            />
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          marginTop="22px"
          alignItems="center"
        >
          <Typography className={fontClasses.boldFont}>
            <span style={{ color: aColor.requiredRed }}>*</span>
            提交方式：
          </Typography>
          <Box display="flex" marginLeft={3}>
            <RadioGroup row value={radioValue} onChange={handleRadioChange}>
              {enumList.map((option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={enumList[index]}
                  control={
                    <Radio color="default" className={radioClasses.Primary} />
                  }
                  label={
                    <Typography className={fontClasses.unboldFont}>
                      {enumListLabel[index]}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </Box>
      {currentTemplate["id"] !== "" && radioValue === "webSubmit" ? (
        <WebSubmit
          templateSchema={templateSchema}
          currentTemplateId={currentTemplate["id"]}
          setPageStatus={setPageStatus}
          setDevDataId={setDevDataId}
          devDataId={devDataId}
          isEdit={isEdit}
          onFileUploadProgress={handleFileUploadProgress}
          fileUploadStatus={fileUploadStatus}
        />
      ) : currentTemplate["id"] !== "" && radioValue === "fileSubmit" ? (
        !fileToWebFlag ? (
          <FileSubmit
            currentTemplateId={currentTemplate["id"]}
            currentTemplateName={currentTemplate["name"]}
            setPageStatus={setPageStatus}
            setDevDataId={setDevDataId}
            setFileToWebFlag={setFileToWebFlag}
            setDevCreateDataFromFile={setDevCreateDataFromFile}
          />
        ) : (
          <WebSubmit
            templateSchema={templateSchema}
            currentTemplateId={currentTemplate["id"]}
            setPageStatus={setPageStatus}
            setDevDataId={setDevDataId}
            devDataId={devDataId}
            isEdit={isEdit}
            fileToWebFlag={fileToWebFlag}
            devCreateDataFromFile={devCreateDataFromFile}
            onFileUploadProgress={handleFileUploadProgress}
            fileUploadStatus={fileUploadStatus}
          />
        )
      ) : currentTemplate["id"] === "" && radioClickFlag ? (
        <Box>未找到指定模板</Box>
      ) : null}
    </Box>
  ) : (
    <CreateStatusComponent
      status={pageStatus}
      page="development_data"
      id={devDataId}
      isEdit={isEdit}
    />
  );
};

export default DevelopmentDataMultipartUploadComponent;
