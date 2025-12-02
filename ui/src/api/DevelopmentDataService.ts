import ApiProvider from "./ApiProvider";
import { JSONSchema7 } from "json-schema";

export type ElementType = {
  title: string;
  type: string;
  unit: string;
  order: ElementType[];
};

export type NumberRange = {
  start: string;
  end: string;
};

export type UserFile = {
  name: string;
  sha256: string;
};

export type DataContent = {
  type: string;
  title: string;
  content:
    | string
    | number
    | DataContent[]
    | (string | number)[]
    | NumberRange
    | UserFile
    | null;
  element_type?: ElementType;
  unit?: string;
};

export type DevelopmentDataJSON = {
  template_name: string;
  data_generate_method: string;
  institution: string;
  template_type: string;
  data_content: DataContent[];
  origin_post_data: JSONSchema7;
  author: string;
  create_timestamp: string;
  reviewer: string;
  review_status: string;
  rejected_reason: string;
  MGID: string;
  title: string;
  citation_template: string;
};

export type SampleSearchResult = {
  sample_list: DevelopmentData[];
  citation_content: string;
};

export type DevelopmentData = {
  id: string;
  template_id: string;
  json_data: DevelopmentDataJSON;
};

export type DevelopmentDataResponse = {
  status: number;
  data: DevelopmentData[];
};

export interface DevelopmentListData {
  uuid: string;
  itemName: string;
  templateType: string;
  pubTime: string;
  author?: string;
  reviewer: string;
  state: string;
}

export type RelatedDataMap = {
  [templateName: string]: DevelopmentData[];
};

export type DevelopmentDataCreateInfo = {
  status: number;
  data?: DevelopmentData;
};

const createDevelopmentData = async (
  templateId: string,
  jsonData: string,
  reviewStatus: string
): Promise<DevelopmentDataCreateInfo> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/development_data/web_submit",
      {
        template_id: templateId,
        json_data: jsonData,
        review_status: reviewStatus,
      }
    );
    const responseData = await response.json();
    return responseData as DevelopmentDataCreateInfo;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const sampleSearch = async (
  templateId: string,
  templateName: string,
  jsonData: string,
  start: number,
  size: number
): Promise<SampleSearchResult> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/development_data/sample_search",
      {
        template_id: templateId,
        template_name: templateName,
        json_data: jsonData,
        start: start,
        size: size,
      }
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const relatedDataSearch = async (
  templateId: string,
  sampleMGID: string,
  start: number,
  size: number
): Promise<RelatedDataMap> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/development_data/related_data_search",
      {
        template_id: templateId,
        sample_MGID: sampleMGID,
        start: start,
        size: size,
      }
    );
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getDataList = async (
  review_state: string,
  start: number,
  size: number
): Promise<DevelopmentDataResponse> => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/dev_data_list", {
      start: start,
      size: size,
      status_filter: review_state,
    });
    const dataList: DevelopmentDataResponse =
      (await response.json()) as DevelopmentDataResponse;
    return dataList;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getDataCount = async (
  review_state: string
): Promise<number> => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/dev_data_count", {
      start: 0,
      size: 0,
      status_filter: review_state,
    });
    const responseData = await response.json();
    const data_count: number = responseData["count"];
    return data_count;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteData = async (uuid: string): Promise<number> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/delete_dev_data/".concat(uuid)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const deleteFile = async (filename: string): Promise<number> => {
  try {
    let response = await ApiProvider.apiProviderDelete(
      "/api/delete_file/".concat(filename)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getDevData = async (id: string): Promise<DevelopmentData> => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/dev_data/".concat(id)
    );
    const responseData = await response.json();
    // 正确处理API响应格式，提取data字段
    if (responseData && responseData.data) {
      console.log('API响应data字段:', responseData.data);
      return responseData.data as DevelopmentData;
    } else {
      console.error('API响应格式不正确，缺少data字段:', responseData);
      throw new Error('API响应格式不正确，缺少data字段');
    }
  } catch (e) {
    console.error('获取数据详情失败:', e);
    throw e;
  }
};

const updateDevelopmentData = async (
  id: string,
  templateId: string,
  jsonData: string,
  reviewStatus: string
): Promise<DevelopmentDataCreateInfo> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/update_development_data/".concat(id),
      {
        template_id: templateId,
        json_data: jsonData,
        review_status: reviewStatus,
      }
    );
    const responseData = await response.json();
    return responseData as DevelopmentDataCreateInfo;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateDataContent = async (
  id: string,
  dataContent: DataContent[],
  title?: string
): Promise<number> => {
  try {
    const response = await ApiProvider.apiProviderPost(
      "/api/dev_data_content/".concat(id),
      { data_content: dataContent, title }
    );
    const responseData = await response.json();
    return responseData["status"] ?? responseData.status;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const applyPublished = async (id: string): Promise<number> => {
  try {
    let response = await ApiProvider.apiProviderPost(
      "/api/devlopment_data_apply_published/".concat(id)
    );
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// 上传参数配置
const PART_SIZE = 5 * 1024 * 1024; // 5MB
const CONCURRENCY = 6; // 并发上传数

// 文件上传主函数 - 通过后端接口上传
const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
  objectPrefix?: string
): Promise<string> => {
  console.log('开始上传文件:', {
    name: file.name,
    size: file.size,
    type: file.type,
    objectPrefix
  });
  
  // 参数验证
  if (!file) {
    throw new Error('上传失败: 无效的文件对象');
  }
  
  // 小文件直接使用原接口上传
  if (file.size < PART_SIZE) {
    console.log('使用小文件上传方式');
    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      return await new Promise((resolve, reject) => {
        xhr.open("POST", "/api/upload", true);
        console.log('小文件上传请求已发送');

        // 可选进度回调
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded * 100) / event.total);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          console.log('小文件上传响应状态:', xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              console.log('小文件上传成功，返回URL:', res.file_url);
              resolve(res.file_url);
            } catch (err) {
              console.error('小文件响应解析失败:', err);
              reject(new Error("响应解析失败"));
            }
          } else {
            console.error('小文件上传失败:', xhr.statusText);
            reject(new Error(`上传失败: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          console.error('小文件上传网络错误');
          reject(new Error("网络错误"));
        };
        xhr.send(formData);
      });
    } catch (e) {
      console.error("小文件上传出错", e);
      throw e;
    }
  }

  // 大文件使用后端分片上传接口
  console.log('使用后端分片上传方式，文件大小超过阈值:', PART_SIZE);
  try {
    const totalParts = Math.ceil(file.size / PART_SIZE);
    let uploadedBytes = 0;
    let uploadSession: string | null = null;
    let fileUrl: string | null = null;
    
    console.log('分片上传配置:', {
      partSize: PART_SIZE,
      totalParts
    });

    // 第一步：初始化上传会话
    console.log('第一步：初始化上传会话');
    const initFormData = new FormData();
    initFormData.append('filename', file.name);
    initFormData.append('total_parts', totalParts.toString());
    
    const initResponse = await ApiProvider.apiProviderPost('/api/development_data/init_multipart', initFormData, true);
    const initResult = await initResponse.json();
    
    if (!initResult.upload_session) {
      throw new Error('未能获取上传会话');
    }
    
    uploadSession = initResult.upload_session;
    console.log('成功获取上传会话:', uploadSession);
    
    // 上传分片
    console.log('第二步：开始上传分片，共', totalParts, '个分片');
    const uploadQueue: number[] = Array.from({ length: totalParts }, (_, i) => i + 1);
    const inFlight = new Set<Promise<void>>();

    const uploadSinglePart = async (partNumber: number) => {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const part = file.slice(start, end);

      console.log(`处理分片 ${partNumber}/${totalParts}，大小: ${part.size} 字节`);

      const formData = new FormData();
      formData.append('part_number', partNumber.toString());
      formData.append('total_parts', totalParts.toString());
      formData.append('file', part, file.name);
      formData.append('upload_session', uploadSession || '');

      const response = await ApiProvider.apiProviderPost(
        '/api/development_data/upload_part_direct',
        formData,
        true
      );
      const result = await response.json();
      if (result.upload_session) {
        uploadSession = result.upload_session;
      }

      uploadedBytes += part.size;
      if (onProgress) {
        const progress = Math.round((uploadedBytes * 100) / file.size);
        onProgress(progress);
      }
    };

    const startNextUpload = () => {
      if (uploadQueue.length === 0) {
        return;
      }
      const partNumber = uploadQueue.shift()!;
      const task = uploadSinglePart(partNumber)
        .catch((error) => {
          console.error(`分片 ${partNumber} 上传失败`, error);
          uploadQueue.unshift(partNumber);
          throw error;
        })
        .finally(() => {
          inFlight.delete(task);
        });
      inFlight.add(task);
    };

    while (inFlight.size < CONCURRENCY && uploadQueue.length > 0) {
      startNextUpload();
    }

    while (inFlight.size > 0) {
      try {
        await Promise.race(inFlight);
      } catch (error) {
        if (uploadQueue.length === 0) {
          throw error;
        }
      }
      while (inFlight.size < CONCURRENCY && uploadQueue.length > 0) {
        startNextUpload();
      }
    }

    console.log('所有分片上传完成');

    // 第三步：完成上传
    console.log('第三步：完成上传，请求最终文件URL');
    const completeFormData = new FormData();
    completeFormData.append('upload_session', uploadSession || '');

    const completeResponse = await ApiProvider.apiProviderPost(
      '/api/development_data/complete_multipart',
      completeFormData,
      true
    );
    const completeResult = await completeResponse.json();

    if (completeResult.file_url) {
      console.log('获取到最终文件URL:', completeResult.file_url);
      fileUrl = completeResult.file_url;
      return fileUrl!;
    }

    console.error('未能获取最终文件URL', completeResult);
    throw new Error('分片上传完成但未能获取文件URL');
  } catch (error) {
    console.error('文件上传失败:', error);
    
    // 格式化错误信息
    const errorMessage = `文件上传失败: ${error instanceof Error ? error.message : String(error)}`;
    
    throw new Error(errorMessage);
  }
};
const developmentData = {
  createDevelopmentData,
  sampleSearch,
  relatedDataSearch,
  getDataList,
  getDataCount,
  deleteData,
  getDevData,
  updateDevelopmentData,
  updateDataContent,
  applyPublished,
  uploadFile, // 添加文件上传方法
  deleteFile,
};

export default developmentData;
export { deleteFile, updateDataContent };