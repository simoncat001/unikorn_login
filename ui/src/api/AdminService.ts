import ApiProvider from "./ApiProvider";
import { WordResponse } from "./WordService";
import { TemplateResponse } from "./TemplateService";
import { DevelopmentDataResponse } from "./DevelopmentDataService";
import { MGIDResponse } from "./MGIDApplyService";

const getWordList: (
  review_state: string,
  start: number,
  size: number
) => Promise<WordResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/admin/words_list", {
      start: start,
      size: size,
      status_filter: review_state,
    });
    const wordList: WordResponse = (await response.json()) as WordResponse;
    return wordList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getWordsCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/admin/words_count", {
      status_filter: review_state,
    });
    const responseData = await response.json();
    const wordsCount: number = await responseData["count"];
    return wordsCount;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplateList: (
  review_state: string,
  start: number,
  size: number
) => Promise<TemplateResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/templates_list",
      {
        start: start,
        size: size,
        status_filter: review_state,
      }
    );
    const templateList: TemplateResponse =
      (await response.json()) as TemplateResponse;
    return templateList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getTemplatesCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/admin/templates_count",
      {
        status_filter: review_state,
      }
    );
    const responseData = await response.json();
    const templatesCount: number = responseData["count"] as number;
    return templatesCount;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getDataList: (
  review_state: string,
  start: number,
  size: number
) => Promise<DevelopmentDataResponse> = async (review_state, start, size) => {
  try {
    console.log('发送数据列表请求:', {review_state, start, size});
    let response = await ApiProvider.apiProviderPost("/api/admin/data_list", {
      start: start,
      size: size,
      status_filter: review_state,
    });
    const responseData = await response.json();
    console.log('收到数据列表响应:', responseData);
    
    // 正确处理响应格式: {status, data}
    if (responseData.status === 0) {
      return { status: 0, data: responseData.data } as DevelopmentDataResponse;
    } else {
      console.error('API返回错误状态:', responseData.status);
      return { status: 1, data: [] } as DevelopmentDataResponse;
    }
  } catch (e) {
    console.error('获取数据列表失败:', e);
    throw e;
  }
};

const getDataCount: (review_state: string) => Promise<number> = async (
  review_state
) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/admin/data_count", {
      status_filter: review_state,
    });
    const responseData = await response.json();
    // 正确处理响应格式: {status, data}
    if (responseData.status === 0) {
      return responseData.data || 0;
    } else {
      console.error('API返回错误状态:', responseData.status);
      return 0;
    }
  } catch (e) {
    console.error('获取数据计数失败:', e);
    throw e;
  }
};

const updateReview: (
  id: string,
  type: string,
  reviewer: string,
  review_status: string,
  rejected_reason: string
) => Promise<number> = async (
  id,
  type,
  reviewer,
  review_status,
  rejected_reason
) => {
  try {
    const getURL = (key: string) => {
      switch (key) {
        case "word":
          return "/api/admin/word_review/";
        case "template":
          return "/api/admin/template_review/";
        case "data":
          return "/api/admin/data_review/";
        default:
          return "/api/admin/word_review/";
      }
    };
    const url = getURL(type);
    let response = await ApiProvider.apiProviderPost(url.concat(id), {
      id: id,
      reviewer: reviewer,
      review_status: review_status,
      rejected_reason: rejected_reason,
    });
    const responseData = await response.json();
    const updateStatus: number = responseData["status"];
    return updateStatus;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getMGIDList: (start: number, size: number) => Promise<MGIDResponse> =
  async (start, size) => {
    try {
      const response = await ApiProvider.apiProviderPost(
        "/api/admin/MGID_list",
        {
          start: start,
          size: size,
          status_filter: "",
        }
      );
      const responseData = await response.json();
      return responseData as MGIDResponse;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

const getMGIDCount: () => Promise<number> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/admin/MGID_count");
    const responseData = await response.json();
    return responseData["count"] as number;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const checkAdmin: () => Promise<boolean> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/admin/check_admin");
    const responseData = await response.json();
    return responseData as boolean;
  } catch (e) {
    // 处理请求被中止的情况
    if (e instanceof Error && e.name === 'AbortError') {
      console.warn('管理员权限检查请求被中止');
      return false; // 请求被中止时默认返回非管理员权限
    }
    console.error('检查管理员权限失败:', e);
    // 失败时默认返回非管理员权限，避免影响用户体验
    return false;
  }
};

const checkSuperAdmin: () => Promise<boolean> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/admin/check_superadmin"
    );
    const responseData = await response.json();
    return responseData as boolean;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const exportObjects = {
  getWordList,
  getWordsCount,
  getTemplateList,
  getTemplatesCount,
  getDataList,
  getDataCount,
  updateReview,
  getMGIDList,
  getMGIDCount,
  checkAdmin,
  checkSuperAdmin,
};

export default exportObjects;
