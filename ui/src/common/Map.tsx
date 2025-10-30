const dataTypeMap: { [key: string]: string } = {
  string: "字符串",
  number: "数值",
  image: "图片",
  file: "文件",
  date: "日期",
  number_range: "数值范围",
  enum_text: "枚举项",
  array: "数组",
  object: "对象",
  MGID: "MGID",
};

const itemTypeMap: { [key: string]: string } = {
  words: "词汇",
  templates: "模板",
  development_data: "研发数据",
  application_data: "应用数据",
  data: "数据",
};

const dataGenerateMethodMap: { [key: string]: string } = {
  experiment: "实验",
  calculation: "计算",
  production: "生产",
  other: "其它",
};

const templateTypeMap: { [key: string]: string } = {
  sample: "样品信息（Sample）",
  source: "源数据（Source）",
  derived: "衍生数据（Derived）",
  application: "应用数据（Application）",
};

const templateSourceMap: { [key: string]: string } = {
  standard: "标准",
  unstandard: "非标准",
};

const sourceTypeMap: { [key: string]: string } = {
  S: "制备",
  T: "表征",
  D: "分析",
  M: "虚拟制备",
  C: "虚拟表征",
};

const enumType: { [key: string]: any } = {
  数据类型: dataTypeMap,
  数据产生方式: dataGenerateMethodMap,
  模板类型: templateTypeMap,
  来源类别: sourceTypeMap,
  模板来源: templateSourceMap,
};

const templateDataType: { [key: string]: string } = {
  single: "单元素",
  array: "数组",
  object: "对象",
};

const errorCoderMap: { [key: number]: string } = {
  0: "成功",
  1: "非法输入",
  2: "数据库错误",
  3: "重复词汇",
  4: "重复模板",
  5: "包含非法词汇",
  6: "非法参数",
  7: "非法CSV行",
  8: "非法CSV编码",
  9: "权限不足",
  10: "自定义部分请填入四位数字",
  11: "上传文件/图片应不超过5MB",
  12: "暂不支持包含文件/图片模板的文件提交",
  13: "用户名不合法",
  14: "文件服务暂不可用",
  15: "文件上传失败",
  16: "用户单位不存在",
  17: "用户国家/地区不存在",
};

const wordItemMap: { [key: string]: string } = {
  serial_number: "编号",
  chinese_name: "中文名称",
  english_name: "英文名称",
  abbr: "缩写名",
  definition: "定义",
  data_type: "数据类型",
  unit: "数值单位",
  number_range: "数值范围",
  options: "可选项列表",
  source_standard_id: "来源标准号",
  author: "提交人",
  create_timestamp: "创建时间",
  reviewer: "审核人",
  review_status: "审核状态",
  rejected_reason: "审核意见",
};

const templateItemMap: { [key: string]: string } = {
  title: "模板标题",
  data_generate_method: "数据生产方式",
  institution: "单位",
  template_publish_platform: "模板发表平台",
  serial_number: "编号",
  source_standard_number: "来源标准号",
  source_standard_name: "来源标准名称",
  template_type: "模板类型",
  author: "提交人",
  create_timestamp: "创建时间",
  reviewer: "审核人",
  review_status: "审核状态",
  rejected_reason: "审核意见",
  template_MGID: "模板MGID",
  citation_count: "引用次数",
};

const developmentDataItemMap: { [key: string]: string } = {
  template_name: "引用模板",
  title: "名称",
  author: "提交人",
  create_timestamp: "创建时间",
  institution: "数据作者单位",
  reviewer: "审核人",
  review_status: "审核状态",
  rejected_reason: "审核意见",
  MGID: "数据MGID",
  data_generate_method: "数据产生方式",
  template_type: "数据类型",
  citation_template: "引用模板",
};

const MGIDItemMap: { [key: string]: string } = {
  data_title: "数据标题",
  author_name: "作者姓名",
  author_organization: "作者单位",
  abstract: "摘要",
  source_type: "来源类别",
  data_url: "数据URL",
  create_timestamp: "创建时间",
  MGID: "MGID",
  pubTime: "提交时间",
};

const UserItemMap: { [key: string]: string } = {
  user_number: "个人编号",
  user_name: "用户名",
  display_name: "用户昵称",
  country: "国家/地区",
  organization: "单位",
  user_type: "管理员",
  operation: "操作",
};

const buttonTypeMap: { [key: string]: string } = {
  words: "创建词汇",
  templates: "创建模板",
  development_data: "上传研发数据",
  MGID_apply: "添加申请",
};

const templateRecursiveLayer: number = 2;

const MGIDCustomFieldTitle = "MGID自定义部分";

const UserAdminOption: { [key: string]: string } = {
  admin: "管理员",
  normal: "普通用户",
};

const exportMap = {
  dataTypeMap,
  errorCoderMap,
  enumType,
  templateDataType,
  dataGenerateMethodMap,
  templateTypeMap,
  templateSourceMap,
  wordItemMap,
  templateItemMap,
  templateRecursiveLayer,
  itemTypeMap,
  developmentDataItemMap,
  sourceTypeMap,
  MGIDItemMap,
  UserItemMap,
  buttonTypeMap,
  MGIDCustomFieldTitle,
  UserAdminOption,
};

export default exportMap;
