import ApiProvider from "./ApiProvider";

export interface WordJSON {
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
}

export interface Word {
    id: string;
    template_id: string;
    json_data: WordJSON;
}

export interface WordResponse {
    status: number;
    data: Word[];
}

const getWordList = async (
    review_state: string,
    start: number,
    size: number
): Promise<WordResponse> => {
    try {
        const response = await ApiProvider.post("/api/my_words_list", {
            start: start,
            size: size,
            status_filter: review_state,
        });
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getWordsCount = async (review_state: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/words_count", {
            start: 0,
            size: 0,
            status_filter: review_state,
        });
        const responseData = await response.json();
        return responseData["count"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const deleteWord = async (uuid: string): Promise<number> => {
    try {
        const response = await ApiProvider.post("/api/delete_word", {
            id: uuid,
        });
        const responseData = await response.json();
        return responseData["status"];
    } catch (e) {
        console.error(e);
        throw e;
    }
};

const getWord = async (id: string): Promise<Word> => {
    try {
        const response = await ApiProvider.get(`/api/words/${id}`);
        const responseData = await response.json();
        if (responseData && responseData.data) {
            const rawWordData = responseData.data;
            return {
                id: rawWordData.id,
                template_id: "",
                json_data: {
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
        } else {
            throw new Error('API response missing data field');
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export default {
    getWordList,
    getWordsCount,
    deleteWord,
    getWord,
};