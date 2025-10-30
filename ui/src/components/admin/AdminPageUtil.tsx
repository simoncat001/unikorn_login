import { templateJSON, TemplateListData } from "../../api/TemplateService";
import { WordJSON, WordListData } from "../../api/WordService";
import {
  DevelopmentDataJSON,
  DevelopmentListData,
} from "../../api/DevelopmentDataService";
import AdminService from "../../api/AdminService";
import { rowsPerPage } from "../ListResultUtils";
import {
  REVIEW_STATUS_WAITING_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_REJECTED,
} from "../../common/ReviewStatusUtils";
import { TableHeadData } from "../ListComponent/TableComponent";
import { MGIDListData } from "../../api/MGIDApplyService";
import CountryService, { Country } from "../../api/CountryService";
import OrganizationService, {
  Organization,
} from "../../api/OrganizationService";
import UserService, { UserListData } from "../../api/UserService";

export const wordItemValueList = [
  "author",
  "create_timestamp",
  "chinese_name",
  "english_name",
  "abbr",
  "definition",
  "data_type",
  "source_standard_id",
];

export const templateItemValueList = [
  "author",
  "create_timestamp",
  "title",
  "data_generate_method",
  "institution",
  "template_publish_platform",
  "source_standard_number",
  "source_standard_name",
  "template_type",
];

export const dataItemValueList = [
  "citation_template",
  "data_generate_method",
  "institution",
  "template_type",
  "create_timestamp",
  "MGID",
];

export const wordTableHeadList: TableHeadData[] = [
  { name: "serial_number", width: "86px" },
  { name: "chinese_name", width: "350px" },
  { name: "create_timestamp", width: "137px" },
  { name: "author", width: "119px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

export const templateTableHeadList: TableHeadData[] = [
  { name: "title", width: "350px" },
  { name: "create_timestamp", width: "137px" },
  { name: "author", width: "119px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

export const dataTableHeadList: TableHeadData[] = [
  { name: "title", width: "350px" },
  { name: "template_type", width: "100px" },
  { name: "create_timestamp", width: "137px" },
  { name: "author", width: "119px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

export const MGIDTableHeadList: TableHeadData[] = [
  { name: "data_title", width: "200x" },
  { name: "pubTime", width: "100px" },
  { name: "author_name", width: "180px" },
  { name: "data_url", width: "100px" },
];

export const userTableHeadList: TableHeadData[] = [
  { name: "user_number", width: "200x" },
  { name: "user_name", width: "100px" },
  { name: "display_name", width: "100px" },
  { name: "country", width: "100px" },
  { name: "organization", width: "180px" },
  { name: "user_type", width: "100px" },
  { name: "operation", width: "100px" },
];

export const buttonList = [
  "all",
  REVIEW_STATUS_WAITING_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_REJECTED,
];

export const areaButtonList = ["country", "organization"];

export const reviewList = ["review_status", "rejected_reason"];

export type AdminItemDetailProps = {
  id: string;
};

export type AdminItemDisplayProps = {
  type: string;
  value: string;
  jsonData: WordJSON | templateJSON | DevelopmentDataJSON;
};

export type AdminBreadcrumbsProps = {
  type: string;
  serial_number?: number;
  chinese_name: string;
};

export type AdminCreatorInfoProps = {
  author: string;
  create_timestamp: string;
};

export type AdminDividerProps = {
  value: string;
};

export type AdminTableHeadProps = {
  type: string;
};

export type AdminSnackbarProps = {
  status: number;
  open: boolean;
  handleClose: () => void;
};

export type AdminToggleButtonProps = {
  filterState: string;
  buttonList: string[];
  handleFilter: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    state: string
  ) => Promise<void>;
};

export type AdminReviewRadioProps = {
  selectedValue: string;
  stateList: string[];
  ifApplyPreviewPassed?: boolean;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export type AdminReviewInputProps = {
  reviewComment: string;
  handleInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const updateWordList = async (
  state: string,
  curPage: number,
  setRows: (value: React.SetStateAction<WordListData[]>) => void,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  const wordListResponse = await AdminService.getWordList(
    state,
    (curPage - 1) * rowsPerPage,
    rowsPerPage
  );
  const wordList = wordListResponse["data"];
  setRows(
    wordList.map((element) => {
      return {
        uuid: element.id,
        id: element.json_data.serial_number,
        itemName: element.json_data.chinese_name,
        pubTime: element.json_data.create_timestamp,
        reviewer: element.json_data.reviewer,
        author: element.json_data.author,
        state: element.json_data.review_status,
      };
    })
  );
  setBackendNotLoaded(wordListResponse["status"]);
};

export const updateTemplateList = async (
  state: string,
  curPage: number,
  setRows: (value: React.SetStateAction<TemplateListData[]>) => void,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  const templateListResponse = await AdminService.getTemplateList(
    state,
    (curPage - 1) * rowsPerPage,
    rowsPerPage
  );
  const templateList = templateListResponse["data"];
  setRows(
    templateList.map((element) => {
      return {
        uuid: element.id,
        itemName: element.json_schema.title,
        pubTime: element.json_schema.create_timestamp,
        reviewer: element.json_schema.reviewer,
        author: element.json_schema.author,
        state: element.json_schema.review_status,
      };
    })
  );
  setBackendNotLoaded(templateListResponse["status"]);
};

export const updateDataList = async (
  state: string,
  curPage: number,
  setRows: (value: React.SetStateAction<DevelopmentListData[]>) => void,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  const templateListResponse = await AdminService.getDataList(
    state,
    (curPage - 1) * rowsPerPage,
    rowsPerPage
  );
  const templateList = templateListResponse["data"];
  setRows(
    templateList.map((element) => {
      return {
        uuid: element.id,
        itemName: element.json_data.title,
        templateType: element.json_data.template_type,
        pubTime: element.json_data.create_timestamp,
        reviewer: element.json_data.reviewer,
        author: element.json_data.author,
        state: element.json_data.review_status,
      };
    })
  );
  setBackendNotLoaded(templateListResponse["status"]);
};

export const updateMGIDList = async (
  curPage: number,
  setRows: (value: React.SetStateAction<MGIDListData[]>) => void,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  const MGIDListResponse = await AdminService.getMGIDList(
    (curPage - 1) * rowsPerPage,
    rowsPerPage
  );
  const MGIDList = MGIDListResponse["data"];
  setRows(
    MGIDList.map((element) => {
      return {
        uuid: element.id,
        data_title: element.json_data.data_title,
        author_name: element.json_data.author_name,
        MGID: element.json_data.MGID,
        data_url: element.json_data.data_url,
        pubTime: element.json_data.create_timestamp,
      };
    })
  );
  setBackendNotLoaded(MGIDListResponse["status"]);
};

export const updateAreaList = async (
  state: string,
  curPage: number,
  setRows: React.Dispatch<React.SetStateAction<Country[] | Organization[]>>,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  if (state === "country") {
    const countryListResponse = await CountryService.getCountryList(
      state,
      (curPage - 1) * rowsPerPage,
      rowsPerPage
    );
    const countryList = countryListResponse["data"];
    setRows(
      countryList.map((element) => {
        return {
          id: element.id,
          name: element.name,
        };
      })
    );
    setBackendNotLoaded(countryListResponse["status"]);
  }
  if (state === "organization") {
    const organizationListResponse =
      await OrganizationService.getOrganizationList(
        state,
        (curPage - 1) * rowsPerPage,
        rowsPerPage
      );
    const organizationList = organizationListResponse["data"];
    setRows(
      organizationList.map((element) => {
        return {
          id: element.id,
          name: element.name,
        };
      })
    );
    setBackendNotLoaded(organizationListResponse["status"]);
  }
};

export const updateUserList = async (
  curPage: number,
  setRows: React.Dispatch<React.SetStateAction<UserListData[]>>,
  setBackendNotLoaded: (value: React.SetStateAction<number>) => void
) => {
  const userListResponse = await UserService.getUserList(
    (curPage - 1) * rowsPerPage,
    rowsPerPage
  );
  const userList = userListResponse["data"];
  setRows(
    userList.map((element) => {
      return {
        user_name: element.user_name,
        display_name: element.display_name,
        country: element.country,
        organization: element.organization,
        user_number: element.user_number,
        user_type: element.user_type,
      };
    })
  );
  setBackendNotLoaded(userListResponse["status"]);
};

export const updateWordPageCount = async (
  state: string,
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  const wordLength: number = await AdminService.getWordsCount(state);
  var nPages = Math.ceil(wordLength / rowsPerPage);
  setPagesCount(nPages === 0 ? 1 : nPages);
};

export const updateTemplatePageCount = async (
  state: string,
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  const wordLength: number = await AdminService.getTemplatesCount(state);
  var nPages = Math.ceil(wordLength / rowsPerPage);
  setPagesCount(nPages === 0 ? 1 : nPages);
};

export const updateDataPageCount = async (
  state: string,
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  const wordLength: number = await AdminService.getDataCount(state);
  var nPages = Math.ceil(wordLength / rowsPerPage);
  setPagesCount(nPages === 0 ? 1 : nPages);
};

export const updateMGIDPageCount = async (
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  const tmpPageCount: number = await AdminService.getMGIDCount();
  const nPages = Math.ceil(tmpPageCount / rowsPerPage);
  setPagesCount(nPages === 0 ? 1 : nPages);
};

export const updateAreaPageCount = async (
  state: string,
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  if (state === "country") {
    const countryLength: number = await CountryService.getCountryCount(state);
    let nPages = Math.ceil(countryLength / rowsPerPage);
    setPagesCount(nPages === 0 ? 1 : nPages);
  }
  if (state === "organization") {
    const countryLength: number =
      await OrganizationService.getOrganizationCount(state);
    let nPages = Math.ceil(countryLength / rowsPerPage);
    setPagesCount(nPages === 0 ? 1 : nPages);
  }
};

export const updateUserPageCount = async (
  setPagesCount: (value: React.SetStateAction<number>) => void
) => {
  const Length: number = await UserService.getUserCount();
  let nPages = Math.ceil(Length / rowsPerPage);
  setPagesCount(nPages === 0 ? 1 : nPages);
};
