export const getKeys = (level: number) => {
    const suffix = `_level${level}`;
    return {
        type: `type${suffix}`,
        single: `single${suffix}`,
        singleType: `single${suffix}_type`,
        singleMin: `single${suffix}_min`,
        singleMax: `single${suffix}_max`,
        singleVocabularyId: `single${suffix}_vocabulary_id`,
        singleVocabularyName: `single${suffix}_vocabulary_name`,
        singleRequired: `single${suffix}_required`,
        object: `object${suffix}`,
        objectItems: `object_items${suffix}`,
        array: `array${suffix}`,
        arrayItems: `array_items${suffix}`,
        arrayRequired: `array${suffix}_required`,
        vocabulary: `vocabulary${suffix}`,
        vocabularyId: `vocabulary${suffix}_id`,
        vocabularyName: `vocabulary${suffix}_name`,
        vocabularyDetails: `vocabulary${suffix}_details`,
        vocabularyRequired: `vocabulary${suffix}_required`,
        levelArray: `level${level}`
    };
};

export const createEmptyItem = (level: number, type: 'single' | 'array' | 'object' | 'vocabulary' = 'single') => {
    const keys = getKeys(level);
    const item: any = {
        [keys.type]: type
    };

    if (type === 'single') {
        item[keys.single] = '';
        item[keys.singleType] = 'string';
        item[keys.singleMin] = '';
        item[keys.singleMax] = '';
        item[keys.singleVocabularyId] = '';
        item[keys.singleVocabularyName] = '';
        item[keys.singleRequired] = true;
    } else if (type === 'vocabulary') {
        item[keys.vocabulary] = '';
        item[keys.vocabularyId] = '';
        item[keys.vocabularyName] = '';
        item[keys.vocabularyDetails] = null;
        item[keys.vocabularyRequired] = true;
    } else if (type === 'object') {
        item[keys.object] = '';
        // Initialize children container
        const nextLevelKeys = getKeys(level + 1);
        item[keys.objectItems] = {
            [nextLevelKeys.levelArray]: []
        };
    } else if (type === 'array') {
        item[keys.array] = '';
        item[keys.arrayRequired] = true;
        // Initialize children container
        const nextLevelKeys = getKeys(level + 1);
        item[keys.arrayItems] = {
            [nextLevelKeys.levelArray]: []
        };
    }

    return item;
};
