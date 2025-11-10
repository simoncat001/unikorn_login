import { JSONSchema7 } from "json-schema";
import ApiProvider from "./ApiProvider";

export type WordJSON = {
  serial_number: number;
  chinese_name: string;
  english_name: string;
  abbr: string;
  definition: string;
  data_type: string;
  unit: string;
  number_range?: string;
  options?: string[];
  source_standard_id: string;
  author: string;
  create_timestamp: string;
  reviewer: string;
  review_status: string;
  rejected_reason: string;
};

export type Word = {
  id: string;
  template_id: string;
  json_data: WordJSON;
};

export type WordCreateInfo = {
  status: number;
  data?: Word;
};

export type WordResponse = {
  status: number;
  data: Word[];
};

export type WordNameData = {
  name_list: string[];
  name_dict: { [key: string]: string[] };
};

export interface WordListData {
  uuid: string;
  id: number;
  itemName: string;
  pubTime: string;
  reviewer: string;
  author?: string;
  state: string;
}

const getWordList: (
  review_state: string,
  start: number,
  size: number
) => Promise<WordResponse> = async (review_state, start, size) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/my_words_list", {
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
    let response = await ApiProvider.apiProviderPost("/api/words_count", {
      start: 0,
      size: 0,
      status_filter: review_state,
    });
    const responseData = await response.json();
    const words_count: number = responseData["count"] as number;
    return words_count;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const createWord: (data: string) => Promise<WordCreateInfo> = async (data) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/words/", {
      json_data: data,
    });
    const WordCreateInfoObject: WordCreateInfo =
      (await response.json()) as WordCreateInfo;
    return WordCreateInfoObject;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getWord: (id: string) => Promise<Word> = async (id) => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/words/".concat(id));
    const responseData = await response.json();
    // 正确处理API响应格式，确保返回的对象包含json_data字段
    console.log('单词API响应数据:', responseData);
    if (responseData && responseData.data) {
      // API返回的数据中，data字段直接包含单词属性
      // 但前端Word类型定义要求有json_data字段
      // 需要转换数据结构
      const rawWordData = responseData.data;
      console.log('data字段内容:', rawWordData);
      
      // 创建符合Word类型定义的对象，将所有属性放入json_data中
      const formattedWord: Word = {
        id: rawWordData.id,
        template_id: "", // 从API返回中可能没有这个字段，设为空
        json_data: {
          // 将rawWordData中的所有属性复制到json_data中
          serial_number: rawWordData.serial_number,
          chinese_name: rawWordData.chinese_name,
          english_name: rawWordData.english_name,
          abbr: rawWordData.abbr,
          definition: rawWordData.definition,
          data_type: rawWordData.data_type,
          unit: rawWordData.unit || "",
          number_range: rawWordData.number_range,
          options: rawWordData.options,
          source_standard_id: rawWordData.source_standard_id,
          author: rawWordData.author,
          create_timestamp: rawWordData.create_timestamp,
          reviewer: rawWordData.reviewer,
          review_status: rawWordData.review_status,
          rejected_reason: rawWordData.rejected_reason || ""
        }
      };
      
      console.log('转换后的单词数据:', formattedWord);
      return formattedWord;
    } else {
      console.error('单词API响应格式不正确，缺少data字段:', responseData);
      throw new Error('单词API响应格式不正确，缺少data字段');
    }
  } catch (e) {
    console.error('获取单词详情失败:', e);
    throw e;
  }
};

const getWordListWithBegin: (beginWord: string) => Promise<WordNameData> =
  async (beginWord) => {
    try {
      let response = await ApiProvider.apiProviderGet(
        "/api/word_list/".concat(beginWord)
      );
      const WordList: WordNameData = (await response.json()) as WordNameData;
      return WordList;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

const getWordUnit: (wordId: string) => Promise<string> = async (wordId) => {
  try {
    let response = await ApiProvider.apiProviderGet(
      "/api/words/unit/".concat(wordId)
    );
    const wordUnit: string = (await response.json()) as string;
    return wordUnit;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getWordCreateSchema: () => Promise<JSONSchema7> = async () => {
  try {
    let response = await ApiProvider.apiProviderGet("/api/getWordCreateSchema");
    const schema: JSONSchema7 = (await response.json()) as JSONSchema7;
    return schema;
  } catch (e) {
    console.error(e, "word create schema");
    throw e;
  }
};

const deleteWord: (uuid: string) => Promise<number> = async (uuid) => {
  try {
    let response = await ApiProvider.apiProviderPost("/api/delete_word", {
      id: uuid,
    });
    const responseData = await response.json();
    return responseData["status"];
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const updateWord: (id: string, data: string) => Promise<WordCreateInfo> =
  async (id, data) => {
    try {
      let response = await ApiProvider.apiProviderPost(
        "/api/update_words/".concat(id),
        {
          json_data: data,
        }
      );
      const WordCreateInfoObject: WordCreateInfo =
        (await response.json()) as WordCreateInfo;
      return WordCreateInfoObject;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

const exportWords = {
  getWordList,
  createWord,
  getWord,
  getWordCreateSchema,
  getWordListWithBegin,
  getWordsCount,
  getWordUnit,
  deleteWord,
  updateWord,
};

export default exportWords;
