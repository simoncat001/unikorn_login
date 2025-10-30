import { Word, WordJSON } from "../api/WordService";
import { Template, templateJSON } from "../api/TemplateService";
import {
  DevelopmentData,
  DevelopmentDataJSON,
} from "../api/DevelopmentDataService";
import { MGIDApplyJSON, MGIDApply } from "../api/MGIDApplyService";
import { LayeredWordOrder } from "../api/TemplateService";

export type WordCardProps = {
  item: Word;
  query: string;
  loggedIn: boolean;
};

export type TemplateCardProps = {
  item: Template;
  query: string;
  loggedIn: boolean;
};

export type DataCardProps = {
  item: DevelopmentData;
  query: string;
  loggedIn: boolean;
};

export type MGIDCardProps = {
  item: MGIDApply;
  query: string;
  loggedIn: boolean;
};

export type CollapseItemProps = {
  optionTitle: string;
  optionList: string[];
};

export type WordCardItemProps = {
  itemJSON: WordJSON;
  itemValue: string;
};

export type TemplateCardItemProps = {
  itemJSON: templateJSON;
  itemValue: string;
};

export type TemplateDialogProps = {
  item: Template;
};

export type DataCardItemProps = {
  itemJSON: DevelopmentDataJSON;
  itemValue: string;
};

export type MGIDCardItemProps = {
  itemJSON: MGIDApplyJSON;
  itemValue: string;
};

export type DataDialogProps = {
  item: DevelopmentData;
};

export type CitationCardProps = {
  citationString: string;
};

export type OrderedListProps = {
  wordOrder: LayeredWordOrder[];
  layer: number;
};

export const wordItemValueList = [
  "abbr",
  "data_type",
  "definition",
  "create_timestamp",
];

export const templateItemValueList = [
  "data_generate_method",
  "institution",
  "template_publish_platform",
  "template_type",
  "source_standard_name",
  "create_timestamp",
];

export const dataItemValueList = [
  "citation_template",
  "data_generate_method",
  "institution",
  "template_type",
  "create_timestamp",
  "MGID",
];

export const DiaglogItemValueList = [
  "title",
  "data_generate_method",
  "institution",
  "template_publish_platform",
  "source_standard_number",
  "source_standard_name",
  "template_type",
  "create_timestamp",
];

export const MGIDItemValueList = [
  "author_name",
  "author_organization",
  "source_type",
  "create_timestamp",
  "abstract",
  "MGID",
];
