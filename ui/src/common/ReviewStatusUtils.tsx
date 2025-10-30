const reviewStatusMap: { [key: string]: string } = {
  all: "全部",
  draft: "草稿",
  waiting_review: "等待审核",
  passed_review: "审核通过",
  passed_review_waiting_published: "审核通过（未发表）",
  passed_review_preview: "审核通过(预发表)",
  passed_review_waiting_review: "等待审核（预发表）",
  rejected: "未通过审核",
  deprecated: "废止",
};

const reviewStatusPassedPreviewMap: { [key: string]: string } = {
  passed_review: "审核通过",
  passed_review_preview: "回到预发表状态",
};

const buttonAreaMap: { [key: string]: string } = {
  country: "国家(地区)",
  organization: "单位",
};

export const REVIEW_STATUS_DRAFT: string = "draft";
export const REVIEW_STATUS_WAITING_REVIEW: string = "waiting_review";
export const REVIEW_STATUS_PASSED_REVIEW_PREVIEW: string =
  "passed_review_preview";
export const REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED: string =
  "passed_review_waiting_published";
export const REVIEW_STATUS_PASSED_REVIEW: string = "passed_review";
export const REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW: string =
  "passed_review_waiting_review";
export const REVIEW_STATUS_REJECTED: string = "rejected";
export const REVIEW_STATUS_DEPRECATED: string = "deprecated";

function isDraft(review_status: string): boolean {
  return review_status === REVIEW_STATUS_DRAFT;
}

function isWaiting(review_status: string): boolean {
  return review_status === REVIEW_STATUS_WAITING_REVIEW;
}

function isPassedPreview(review_status: string): boolean {
  return review_status === REVIEW_STATUS_PASSED_REVIEW_PREVIEW;
}

function isPassed(review_status: string): boolean {
  return review_status === REVIEW_STATUS_PASSED_REVIEW;
}

function isRejected(review_status: string): boolean {
  return review_status === REVIEW_STATUS_REJECTED;
}

const exportReviewStatusUtils = {
  reviewStatusMap,
  reviewStatusPassedPreviewMap,
  buttonAreaMap,
  isDraft,
  isWaiting,
  isPassed,
  isRejected,
  isPassedPreview,
};
export default exportReviewStatusUtils;
