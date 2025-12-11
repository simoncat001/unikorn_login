<template><template><template>

  <div class="template-create-page">

    <MainAppBar />  <div class="template-create-page">  <section class="stack">

    

    <div class="content-wrapper">    <MainAppBar />    <header class="section-header">

      <div class="main-content">

        <div v-if="activeStep === 1" class="tree-view-sidebar">          <div>

          <div class="tree-view-content">

            <h3 class="tree-title">模板结构预览</h3>    <div class="content-wrapper">        <p class="eyebrow">模板中心</p>

            <div class="tree-info">

              <p><strong>模板名称:</strong> {{ basicInfo.title || '未命名' }}</p>      <div class="main-content">        <h2>创建模板</h2>

              <p><strong>模板类型:</strong> {{ getTemplateTypeLabel(basicInfo.template_type) }}</p>

            </div>        <!-- 左侧树形视图 (仅在第二步显示) -->        <p class="muted">上传模型模板及元数据，方便他人发现与复用。</p>

            <div class="preset-words">

              <h4>预定义字段</h4>        <div v-if="activeStep === 1" class="tree-view-sidebar">      </div>

              <div v-if="presetWordList && Object.keys(presetWordList).length > 0" class="preset-list">

                <div v-for="(words, category) in presetWordList" :key="category" class="preset-category">          <div class="tree-view-content">      <button class="primary" type="button" @click="submitTemplate">提交模板</button>

                  <strong>{{ category }}:</strong>

                  <span class="preset-items">{{ words.join(', ') }}</span>            <h3 class="tree-title">模板结构预览</h3>    </header>

                </div>

              </div>            <div class="tree-info">

              <p v-else class="no-preset">暂无预定义字段</p>

            </div>              <p><strong>模板名称:</strong> {{ basicInfo.title || '未命名' }}</p>    <div class="grid two-cols">

          </div>

        </div>              <p><strong>模板类型:</strong> {{ getTemplateTypeLabel(basicInfo.template_type) }}</p>      <article class="section-card">



        <div class="form-container">            </div>        <h3>基础信息</h3>

          <div class="stepper-wrapper">

            <div class="stepper">            <div class="preset-words">        <div class="form-grid">

              <div 

                v-for="(step, index) in steps"               <h4>预定义字段</h4>          <label>

                :key="index"

                class="step"              <div v-if="presetWordList && Object.keys(presetWordList).length > 0" class="preset-list">            模板名称

                :class="{ active: index === activeStep, completed: index < activeStep }"

              >                <div v-for="(words, category) in presetWordList" :key="category" class="preset-category">            <input v-model="form.name" type="text" placeholder="如：LLM 微调模板" />

                <div class="step-number">{{ index + 1 }}</div>

                <div class="step-label">{{ step }}</div>                  <strong>{{ category }}:</strong>          </label>

                <div v-if="index < steps.length - 1" class="step-connector"></div>

              </div>                  <span class="preset-items">{{ words.join(', ') }}</span>          <label>

            </div>

          </div>                </div>            版本



          <div v-if="errorMessage" class="error-banner">              </div>            <input v-model="form.version" type="text" placeholder="v1.0.0" />

            {{ errorMessage }}

          </div>              <p v-else class="no-preset">暂无预定义字段</p>          </label>



          <div v-if="activeStep === 0" class="step-content">            </div>          <label class="full">

            <h2 class="form-title">模板基本信息</h2>

                      </div>            模板简介

            <div class="form-section">

              <div class="form-row">        </div>            <textarea v-model="form.description" rows="3" placeholder="说明模板适用场景、输入输出格式等" />

                <label class="form-label required">

                  模板名称          </label>

                  <input 

                    v-model="basicInfo.title"         <!-- 主要表单区域 -->          <label>

                    type="text" 

                    class="form-input"        <div class="form-container">            分类

                    placeholder="请输入模板名称"

                    required          <!-- 步骤器 -->            <select v-model="form.category">

                  />

                </label>          <div class="stepper-wrapper">              <option disabled value="">请选择</option>

              </div>

            <div class="stepper">              <option>文本生成</option>

              <div class="form-row">

                <label class="form-label required">              <div               <option>多模态</option>

                  模板类型

                  <select v-model="basicInfo.template_type" class="form-select" required>                v-for="(step, index) in steps"               <option>语音</option>

                    <option value="">请选择模板类型</option>

                    <option value="basic">基础模板</option>                :key="index"              <option>视觉</option>

                    <option value="application">应用模板</option>

                  </select>                class="step"            </select>

                </label>

              </div>                :class="{ active: index === activeStep, completed: index < activeStep }"          </label>



              <div class="form-row">              >          <label>

                <label class="form-label required">

                  模板来源                <div class="step-number">{{ index + 1 }}</div>            任务类型

                  <select v-model="basicInfo.template_source" class="form-select" required>

                    <option value="">请选择模板来源</option>                <div class="step-label">{{ step }}</div>            <input v-model="form.taskType" type="text" placeholder="微调 / 推理 / 评测" />

                    <option value="standard">标准模板</option>

                    <option value="unstandard">非标准模板</option>                <div v-if="index < steps.length - 1" class="step-connector"></div>          </label>

                  </select>

                </label>              </div>          <label>

              </div>

            </div>            适配语言

              <div v-if="basicInfo.template_source === 'standard'" class="form-row">

                <label class="form-label required">          </div>            <input v-model="form.languages" type="text" placeholder="zh, en, ja" />

                  来源标准号

                  <input           </label>

                    v-model="basicInfo.source_standard_number" 

                    type="text"           <!-- 错误提示 -->          <label class="full">

                    class="form-input"

                    placeholder="请输入来源标准号"          <div v-if="errorMessage" class="error-banner">            标签（逗号分隔）

                  />

                </label>            {{ errorMessage }}            <input v-model="tagsInput" type="text" placeholder="nlp, 微调, pytorch" />

              </div>

          </div>          </label>

              <div v-if="basicInfo.template_source === 'unstandard'" class="form-row">

                <label class="form-label required">        </div>

                  自定义来源标准号

                  <input           <!-- 步骤1: 模板基本信息 -->      </article>

                    v-model="basicInfo.source_standard_number_custom_field" 

                    type="text"           <div v-if="activeStep === 0" class="step-content">

                    class="form-input"

                    placeholder="请输入自定义来源标准号"            <h2 class="form-title">模板基本信息</h2>      <article class="section-card">

                  />

                </label>                    <h3>框架与资源</h3>

              </div>

            <div class="form-section">        <div class="form-grid">

              <div class="form-row">

                <label class="form-label">              <div class="form-row">          <label>

                  模板描述

                  <textarea                 <label class="form-label required">            训练框架

                    v-model="basicInfo.description" 

                    class="form-textarea"                  模板名称            <select v-model="form.framework">

                    rows="4"

                    placeholder="请输入模板描述"                  <input               <option disabled value="">请选择</option>

                  />

                </label>                    v-model="basicInfo.title"               <option>PyTorch</option>

              </div>

                    type="text"               <option>TensorFlow</option>

              <div class="form-actions">

                <button type="button" class="btn btn-primary" @click="goToStep2">                    class="form-input"              <option>ONNX</option>

                  下一步

                </button>                    placeholder="请输入模板名称"              <option>其他</option>

              </div>

            </div>                    required            </select>

          </div>

                  />          </label>

          <div v-if="activeStep === 1" class="step-content">

            <h2 class="form-title">模板创建</h2>                </label>          <label>



            <div v-if="presetWordList && Object.keys(presetWordList).length > 0" class="preset-section">              </div>            许可证

              <h3>预定义字段</h3>

              <div class="preset-chips">            <select v-model="form.license">

                <span 

                  v-for="(words, category) in presetWordList"               <div class="form-row">              <option disabled value="">选择许可证</option>

                  :key="category"

                  class="preset-chip"                <label class="form-label required">              <option>Apache-2.0</option>

                >

                  {{ category }}                  模板类型              <option>MIT</option>

                </span>

              </div>                  <select v-model="basicInfo.template_type" class="form-select" required>              <option>GPL-3.0</option>

            </div>

                    <option value="">请选择模板类型</option>              <option>专有</option>

            <div class="form-section">

              <div class="form-row">                    <option value="basic">基础模板</option>            </select>

                <label class="form-label">

                  模板字段名称                    <option value="application">应用模板</option>          </label>

                  <input 

                    v-model="templateData.field_name"                   </select>          <label>

                    type="text" 

                    class="form-input"                </label>            模型大小

                    placeholder="请输入字段名称"

                  />              </div>            <input v-model="form.size" type="text" placeholder="例如：1.2GB" />

                </label>

              </div>          </label>



              <div class="form-row">              <div class="form-row">          <label>

                <label class="form-label">

                  字段类型                <label class="form-label required">            运行依赖

                  <select v-model="templateData.field_type" class="form-select">

                    <option value="">请选择字段类型</option>                  模板来源            <input v-model="form.dependencies" type="text" placeholder="torch>=2.0, transformers" />

                    <option value="string">文本</option>

                    <option value="number">数字</option>                  <select v-model="basicInfo.template_source" class="form-select" required>          </label>

                    <option value="boolean">布尔值</option>

                    <option value="array">数组</option>                    <option value="">请选择模板来源</option>          <label>

                    <option value="object">对象</option>

                  </select>                    <option value="standard">标准模板</option>            需要显存

                </label>

              </div>                    <option value="unstandard">非标准模板</option>            <input v-model="form.minGpu" type="text" placeholder="例如：16GB" />



              <div class="form-row">                  </select>          </label>

                <label class="form-label">

                  字段说明                </label>          <label>

                  <textarea 

                    v-model="templateData.field_description"               </div>            兼容数据集

                    class="form-textarea"

                    rows="3"            <input v-model="form.datasets" type="text" placeholder="如：c4, wudao" />

                    placeholder="请输入字段说明"

                  />              <div v-if="basicInfo.template_source === 'standard'" class="form-row">          </label>

                </label>

              </div>                <label class="form-label required">          <label class="full">



              <div class="form-actions">                  来源标准号            上传文件

                <button type="button" class="btn btn-secondary" @click="goToStep1">

                  上一步                  <input             <input type="file" multiple />

                </button>

                <button                     v-model="basicInfo.source_standard_number"             <p class="muted">支持模型文件、配置与示例脚本。</p>

                  type="button" 

                  class="btn btn-outline"                    type="text"           </label>

                  :disabled="isSubmitting"

                  @click="saveDraft"                    class="form-input"          <label class="full">

                >

                  保存草稿                    placeholder="请输入来源标准号"            预览地址

                </button>

                <button                   />            <input v-model="form.previewUrl" type="url" placeholder="https://example.com/demo" />

                  type="button" 

                  class="btn btn-primary"                </label>          </label>

                  :disabled="isSubmitting"

                  @click="submitForReview"              </div>        </div>

                >

                  {{ isSubmitting ? '提交中...' : '提交审核' }}      </article>

                </button>

              </div>              <div v-if="basicInfo.template_source === 'unstandard'" class="form-row">    </div>

            </div>

          </div>                <label class="form-label required">

        </div>

      </div>                  自定义来源标准号    <article class="section-card">

    </div>

                  <input       <h3>使用说明</h3>

    <div v-if="showSuccess" class="success-modal">

      <div class="success-content">                    v-model="basicInfo.source_standard_number_custom_field"       <div class="form-grid">

        <div class="success-icon">✓</div>

        <h2>提交成功!</h2>                    type="text"         <label class="full">

        <p>模板ID: {{ createdTemplateId }}</p>

        <div class="success-actions">                    class="form-input"          输入格式

          <button class="btn btn-primary" @click="goToTemplateDetail">

            查看模板                    placeholder="请输入自定义来源标准号"          <textarea v-model="form.inputFormat" rows="3" placeholder="描述必需的字段、数据结构或文件夹组织方式" />

          </button>

          <button class="btn btn-secondary" @click="createAnother">                  />        </label>

            继续创建

          </button>                </label>        <label class="full">

        </div>

      </div>              </div>          输出格式

    </div>

  </div>          <textarea v-model="form.outputFormat" rows="3" placeholder="给出推理或训练的输出示例" />

</template>

              <div class="form-row">        </label>

<script setup lang="ts">

import { reactive, ref } from "vue";                <label class="form-label">        <label class="full">

import { useRouter } from "vue-router";

import MainAppBar from "@/components/MainAppBar.vue";                  模板描述          操作步骤



const router = useRouter();                  <textarea           <textarea



const steps = ["模板基本信息", "模板创建"];                    v-model="basicInfo.description"             v-model="form.steps"

const activeStep = ref(0);

const errorMessage = ref("");                    class="form-textarea"            rows="4"

const isSubmitting = ref(false);

const showSuccess = ref(false);                    rows="4"            placeholder="分步说明如何准备数据、安装依赖、启动训练/推理与评估。"

const createdTemplateId = ref("");

                    placeholder="请输入模板描述"          />

const basicInfo = reactive({

  title: "",                  />        </label>

  template_type: "",

  template_source: "",                </label>        <label class="full">

  source_standard_number: "",

  source_standard_number_custom_field: "",              </div>          最佳实践

  description: "",

  review_status: ""          <textarea v-model="form.bestPractice" rows="3" placeholder="提供超参建议、硬件配置与常见问题排查" />

});

              <div class="form-actions">        </label>

const templateData = reactive({

  field_name: "",                <button type="button" class="btn btn-primary" @click="goToStep2">      </div>

  field_type: "",

  field_description: ""                  下一步    </article>

});

                </button>

const presetWordList = ref<{ [key: string]: string[] }>({

  "基本信息": ["名称", "版本", "作者"],              </div>    <article class="section-card">

  "技术参数": ["算法", "框架", "依赖"]

});            </div>      <h3>质量校验</h3>



const getTemplateTypeLabel = (type: string) => {          </div>      <div class="checklist">

  const labels: { [key: string]: string } = {

    basic: "基础模板",        <label v-for="item in checklist" :key="item.key" class="check-item">

    application: "应用模板"

  };          <!-- 步骤2: 模板创建 -->          <input v-model="form.quality[item.key]" type="checkbox" />

  return labels[type] || type;

};          <div v-if="activeStep === 1" class="step-content">          <div>



const goToStep1 = () => {            <h2 class="form-title">模板创建</h2>            <p>{{ item.label }}</p>

  activeStep.value = 0;

  errorMessage.value = "";            <p class="muted">{{ item.desc }}</p>

};

            <!-- 预定义字段展示 -->          </div>

const goToStep2 = () => {

  if (!basicInfo.title) {            <div v-if="presetWordList && Object.keys(presetWordList).length > 0" class="preset-section">        </label>

    errorMessage.value = "请输入模板名称";

    return;              <h3>预定义字段</h3>      </div>

  }

  if (!basicInfo.template_type) {              <div class="preset-chips">    </article>

    errorMessage.value = "请选择模板类型";

    return;                <span 

  }

  if (!basicInfo.template_source) {                  v-for="(words, category) in presetWordList"     <article class="section-card">

    errorMessage.value = "请选择模板来源";

    return;                  :key="category"      <h3>发布选项</h3>

  }

                    class="preset-chip"      <div class="form-grid">

  errorMessage.value = "";

  activeStep.value = 1;                >        <label>

};

                  {{ category }}          可见性

const saveDraft = async () => {

  isSubmitting.value = true;                </span>          <select v-model="form.visibility">

  errorMessage.value = "";

                </div>            <option value="public">公开</option>

  try {

    basicInfo.review_status = "draft";            </div>            <option value="private">私有</option>

    await new Promise(resolve => setTimeout(resolve, 500));

    alert("草稿保存成功!");          </select>

  } catch (error: any) {

    errorMessage.value = error.message || "保存失败";            <div class="form-section">        </label>

  } finally {

    isSubmitting.value = false;              <div class="form-row">        <label>

  }

};                <label class="form-label">          维护者



const submitForReview = async () => {                  模板字段名称          <input v-model="form.maintainer" type="text" placeholder="如：data-team" />

  isSubmitting.value = true;

  errorMessage.value = "";                  <input         </label>

  

  try {                    v-model="templateData.field_name"         <label>

    basicInfo.review_status = "waiting_review";

    await new Promise(resolve => setTimeout(resolve, 500));                    type="text"           支持渠道

    createdTemplateId.value = "TMPL_" + Date.now();

    showSuccess.value = true;                    class="form-input"          <input v-model="form.support" type="text" placeholder="Issue、钉钉群或邮箱" />

  } catch (error: any) {

    errorMessage.value = error.message || "提交失败";                    placeholder="请输入字段名称"        </label>

  } finally {

    isSubmitting.value = false;                  />        <label>

  }

};                </label>          审核人



const goToTemplateDetail = () => {              </div>          <input v-model="form.reviewer" type="text" placeholder="如：审核员 A" />

  router.push(`/templates/detail/${createdTemplateId.value}`);

};        </label>



const createAnother = () => {              <div class="form-row">      </div>

  showSuccess.value = false;

  activeStep.value = 0;                <label class="form-label">      <p class="muted">提交后将创建一条新的模板记录并进入审核流程。</p>

  basicInfo.title = "";

  basicInfo.template_type = "";                  字段类型    </article>

  basicInfo.template_source = "";

  basicInfo.source_standard_number = "";                  <select v-model="templateData.field_type" class="form-select">

  basicInfo.source_standard_number_custom_field = "";

  basicInfo.description = "";                    <option value="">请选择字段类型</option>    <article class="section-card">

  templateData.field_name = "";

  templateData.field_type = "";                    <option value="string">文本</option>      <h3>预览</h3>

  templateData.field_description = "";

};                    <option value="number">数字</option>      <div class="preview">

</script>

                    <option value="boolean">布尔值</option>        <div>

<style scoped>

.template-create-page {                    <option value="array">数组</option>          <p class="eyebrow">提交载荷</p>

  min-height: 100vh;

  background-color: #f5f5f5;                    <option value="object">对象</option>          <pre class="code-block">{{ formattedPayload }}</pre>

  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

}                  </select>        </div>



.content-wrapper {                </label>        <div>

  padding-top: 64px;

}              </div>          <p class="eyebrow">校验结果</p>



.main-content {          <ul class="muted">

  display: flex;

  min-height: calc(100vh - 64px);              <div class="form-row">            <li v-for="error in validationErrors" :key="error">{{ error }}</li>

  max-width: 1400px;

  margin: 0 auto;                <label class="form-label">            <li v-if="!validationErrors.length">所有必填项已完成，可提交。</li>

  padding: 62px 20px 40px;

}                  字段说明          </ul>



.tree-view-sidebar {                  <textarea         </div>

  width: 300px;

  margin-right: 40px;                    v-model="templateData.field_description"       </div>

  flex-shrink: 0;

}                    class="form-textarea"    </article>



.tree-view-content {                    rows="3"  </section>

  background: white;

  border-radius: 8px;                    placeholder="请输入字段说明"</template>

  padding: 20px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);                  />

  position: sticky;

  top: 84px;                </label><script setup lang="ts">

}

              </div>import { computed, reactive, ref, watch } from "vue";

.tree-title {

  font-size: 18px;

  font-weight: 600;

  color: #333;              <div class="form-actions">const form = reactive({

  margin-bottom: 16px;

}                <button type="button" class="btn btn-secondary" @click="goToStep1">  name: "",



.tree-info {                  上一步  version: "",

  margin-bottom: 20px;

  padding-bottom: 20px;                </button>  description: "",

  border-bottom: 1px solid #eee;

}                <button   category: "",



.tree-info p {                  type="button"   taskType: "",

  font-size: 14px;

  color: #666;                  class="btn btn-outline"  languages: "",

  margin-bottom: 8px;

}                  :disabled="isSubmitting"  framework: "",



.preset-words h4 {                  @click="saveDraft"  license: "",

  font-size: 16px;

  font-weight: 600;                >  size: "",

  color: #333;

  margin-bottom: 12px;                  保存草稿  dependencies: "",

}

                </button>  minGpu: "",

.preset-list {

  display: flex;                <button   datasets: "",

  flex-direction: column;

  gap: 12px;                  type="button"   previewUrl: "",

}

                  class="btn btn-primary"  inputFormat: "",

.preset-category {

  font-size: 14px;                  :disabled="isSubmitting"  outputFormat: "",

  line-height: 1.6;

}                  @click="submitForReview"  steps: "",



.preset-category strong {                >  bestPractice: "",

  color: #333;

  display: block;                  {{ isSubmitting ? '提交中...' : '提交审核' }}  visibility: "public",

  margin-bottom: 4px;

}                </button>  reviewer: "",



.preset-items {              </div>  maintainer: "",

  color: #666;

  font-size: 13px;            </div>  support: "",

}

          </div>  tags: [] as string[],

.no-preset {

  font-size: 14px;        </div>  quality: {

  color: #999;

}      </div>    runnable: false,



.form-container {    </div>    docsComplete: false,

  flex: 1;

  max-width: 800px;    versioned: false,

}

    <!-- 成功提示 -->    security: false

.stepper-wrapper {

  margin-bottom: 40px;    <div v-if="showSuccess" class="success-modal">  }

  display: flex;

  justify-content: center;      <div class="success-content">});

}

        <div class="success-icon">✓</div>

.stepper {

  display: flex;        <h2>提交成功!</h2>const tagsInput = ref("");

  align-items: center;

  gap: 40px;        <p>模板ID: {{ createdTemplateId }}</p>

  position: relative;

}        <div class="success-actions">watch(



.step {          <button class="btn btn-primary" @click="goToTemplateDetail">  () => tagsInput.value,

  display: flex;

  flex-direction: column;            查看模板  (val) => {

  align-items: center;

  position: relative;          </button>    form.tags = val

  flex: 1;

  max-width: 150px;          <button class="btn btn-secondary" @click="createAnother">      .split(",")

}

            继续创建      .map((item) => item.trim())

.step-number {

  width: 40px;          </button>      .filter(Boolean);

  height: 40px;

  border-radius: 50%;        </div>  }

  background-color: #e0e0e0;

  color: #999;      </div>);

  display: flex;

  align-items: center;    </div>

  justify-content: center;

  font-weight: 600;  </div>const submitTemplate = () => {

  font-size: 16px;

  margin-bottom: 8px;</template>  if (validationErrors.value.length) {

  transition: all 0.3s;

}    alert(`请先完善必填项：\n${validationErrors.value.join("\n")}`);



.step.active .step-number {<script setup lang="ts">    return;

  background-color: #3f51b5;

  color: white;import { reactive, ref } from "vue";  }

}

import { useRouter } from "vue-router";

.step.completed .step-number {

  background-color: #4caf50;import MainAppBar from "@/components/MainAppBar.vue";  const payload = { ...form, tags: form.tags };

  color: white;

}  alert(`将提交模板：${JSON.stringify(payload, null, 2)}`);



.step-label {const router = useRouter();};

  font-size: 14px;

  color: #666;

  text-align: center;

}const steps = ["模板基本信息", "模板创建"];const requiredFields: Record<string, string> = {



.step.active .step-label {const activeStep = ref(0);  name: "模板名称",

  color: #3f51b5;

  font-weight: 600;const errorMessage = ref("");  version: "版本",

}

const isSubmitting = ref(false);  description: "模板简介",

.step-connector {

  position: absolute;const showSuccess = ref(false);  category: "分类",

  top: 20px;

  left: calc(100% + 20px);const createdTemplateId = ref("");  taskType: "任务类型",

  width: 40px;

  height: 2px;  framework: "训练框架",

  background-color: #e0e0e0;

}const basicInfo = reactive({  license: "许可证",



.step.completed .step-connector {  title: "",  inputFormat: "输入格式",

  background-color: #4caf50;

}  template_type: "",  outputFormat: "输出格式"



.error-banner {  template_source: "",};

  background-color: #f8d7da;

  border: 1px solid #f5c6cb;  source_standard_number: "",

  color: #721c24;

  padding: 12px 16px;  source_standard_number_custom_field: "",const validationErrors = computed(() => {

  border-radius: 4px;

  margin-bottom: 20px;  description: "",  return Object.entries(requiredFields)

  font-size: 14px;

}  review_status: ""    .filter(([key]) => !(form as Record<string, string>)[key])



.step-content {});    .map(([, label]) => `${label} 不能为空`);

  background: white;

  border-radius: 8px;});

  padding: 40px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);const templateData = reactive({

}

  field_name: "",const formattedPayload = computed(() =>

.form-title {

  font-size: 24px;  field_type: "",  JSON.stringify({ ...form, tags: form.tags }, null, 2)

  font-weight: 600;

  color: #333;  field_description: "");

  margin-bottom: 30px;

  text-align: center;});

}

const checklist = [

.form-section {

  max-width: 600px;const presetWordList = ref<{ [key: string]: string[] }>({  { key: "runnable", label: "可运行验证", desc: "上传的脚本可直接复现 README 的运行指令" },

  margin: 0 auto;

}  "基本信息": ["名称", "版本", "作者"],  { key: "docsComplete", label: "文档完善", desc: "包含输入输出示例、依赖与硬件说明" },



.form-row {  "技术参数": ["算法", "框架", "依赖"]  { key: "versioned", label: "版本管理", desc: "明确版本号并在变更时更新说明" },

  margin-bottom: 24px;

}});  { key: "security", label: "安全检查", desc: "已完成病毒扫描和敏感信息排查" }



.form-label {];

  display: block;

  font-size: 14px;const getTemplateTypeLabel = (type: string) => {</script>

  font-weight: 500;

  color: #333;  const labels: { [key: string]: string } = {

  margin-bottom: 8px;

}    basic: "基础模板",<style scoped>



.form-label.required::after {    application: "应用模板".checklist {

  content: " *";

  color: #f44336;  };  display: grid;

}

  return labels[type] || type;  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

.form-input,

.form-select,};  gap: 12px;

.form-textarea {

  width: 100%;}

  padding: 10px 14px;

  border: 1px solid #ddd;const goToStep1 = () => {

  border-radius: 4px;

  font-size: 14px;  activeStep.value = 0;.check-item {

  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

  transition: border-color 0.3s;  errorMessage.value = "";  display: flex;

  box-sizing: border-box;

}};  align-items: flex-start;



.form-input:focus,  gap: 12px;

.form-select:focus,

.form-textarea:focus {const goToStep2 = () => {  padding: 12px;

  outline: none;

  border-color: #3f51b5;  if (!basicInfo.title) {  border: 1px solid var(--gray-200);

}

    errorMessage.value = "请输入模板名称";  border-radius: 12px;

.form-textarea {

  resize: vertical;    return;  background: #fff;

  min-height: 80px;

}  }}



.preset-section {  if (!basicInfo.template_type) {

  background-color: #f5f5f5;

  padding: 20px;    errorMessage.value = "请选择模板类型";.preview {

  border-radius: 4px;

  margin-bottom: 30px;    return;  display: grid;

}

  }  gap: 16px;

.preset-section h3 {

  font-size: 16px;  if (!basicInfo.template_source) {  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

  font-weight: 600;

  color: #333;    errorMessage.value = "请选择模板来源";}

  margin-bottom: 12px;

}    return;



.preset-chips {  }.code-block {

  display: flex;

  flex-wrap: wrap;    background: #0b1021;

  gap: 8px;

}  errorMessage.value = "";  color: #e6e9f4;



.preset-chip {  activeStep.value = 1;  padding: 12px;

  display: inline-block;

  padding: 6px 12px;};  border-radius: 12px;

  background-color: #e3f2fd;

  color: #1976d2;  overflow: auto;

  font-size: 13px;

  border-radius: 16px;const saveDraft = async () => {  font-size: 12px;

}

  isSubmitting.value = true;  line-height: 1.5;

.form-actions {

  display: flex;  errorMessage.value = "";}

  justify-content: flex-end;

  gap: 12px;  </style>

  margin-top: 32px;

  padding-top: 24px;  try {

  border-top: 1px solid #eee;    basicInfo.review_status = "draft";

}    // TODO: 调用 API 保存草稿

    // await TemplateService.createTemplate(basicInfo, templateData);

.btn {    

  padding: 10px 24px;    await new Promise(resolve => setTimeout(resolve, 500));

  border-radius: 4px;    alert("草稿保存成功!");

  font-size: 14px;  } catch (error: any) {

  font-weight: 500;    errorMessage.value = error.message || "保存失败";

  cursor: pointer;  } finally {

  transition: all 0.3s;    isSubmitting.value = false;

  border: none;  }

  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;};

}

const submitForReview = async () => {

.btn-primary {  isSubmitting.value = true;

  background-color: #3f51b5;  errorMessage.value = "";

  color: white;  

}  try {

    basicInfo.review_status = "waiting_review";

.btn-primary:hover:not(:disabled) {    // TODO: 调用 API 提交审核

  background-color: #303f9f;    // const result = await TemplateService.createTemplate(basicInfo, templateData);

}    // createdTemplateId.value = result.data.id;

    

.btn-secondary {    await new Promise(resolve => setTimeout(resolve, 500));

  background-color: #757575;    createdTemplateId.value = "TMPL_" + Date.now();

  color: white;    showSuccess.value = true;

}  } catch (error: any) {

    errorMessage.value = error.message || "提交失败";

.btn-secondary:hover:not(:disabled) {  } finally {

  background-color: #616161;    isSubmitting.value = false;

}  }

};

.btn-outline {

  background-color: white;const goToTemplateDetail = () => {

  color: #3f51b5;  router.push(`/templates/detail/${createdTemplateId.value}`);

  border: 1px solid #3f51b5;};

}

const createAnother = () => {

.btn-outline:hover:not(:disabled) {  showSuccess.value = false;

  background-color: #f5f5f5;  activeStep.value = 0;

}  basicInfo.title = "";

  basicInfo.template_type = "";

.btn:disabled {  basicInfo.template_source = "";

  opacity: 0.6;  basicInfo.source_standard_number = "";

  cursor: not-allowed;  basicInfo.source_standard_number_custom_field = "";

}  basicInfo.description = "";

  templateData.field_name = "";

.success-modal {  templateData.field_type = "";

  position: fixed;  templateData.field_description = "";

  top: 0;};

  left: 0;</script>

  right: 0;

  bottom: 0;<style scoped>

  background-color: rgba(0, 0, 0, 0.5);.template-create-page {

  display: flex;  min-height: 100vh;

  align-items: center;  background-color: #f5f5f5;

  justify-content: center;  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;

  z-index: 9999;}

}

.content-wrapper {

.success-content {  padding-top: 64px;

  background: white;}

  border-radius: 8px;

  padding: 40px;.main-content {

  max-width: 400px;  display: flex;

  text-align: center;  min-height: calc(100vh - 64px);

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);  max-width: 1400px;

}  margin: 0 auto;

  padding: 62px 20px 40px;

.success-icon {}

  width: 60px;

  height: 60px;.tree-view-sidebar {

  border-radius: 50%;  width: 300px;

  background-color: #4caf50;  margin-right: 40px;

  color: white;  flex-shrink: 0;

  font-size: 36px;}

  display: flex;

  align-items: center;.tree-view-content {

  justify-content: center;  background: white;

  margin: 0 auto 20px;  border-radius: 8px;

}  padding: 20px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

.success-content h2 {  position: sticky;

  font-size: 24px;  top: 84px;

  color: #333;}

  margin-bottom: 12px;

}.tree-title {

  font-size: 18px;

.success-content p {  font-weight: 600;

  font-size: 14px;  color: #333;

  color: #666;  margin-bottom: 16px;

  margin-bottom: 24px;}

}

.tree-info {

.success-actions {  margin-bottom: 20px;

  display: flex;  padding-bottom: 20px;

  gap: 12px;  border-bottom: 1px solid #eee;

  justify-content: center;}

}

</style>.tree-info p {

  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.preset-words h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-category {
  font-size: 14px;
  line-height: 1.6;
}

.preset-category strong {
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.preset-items {
  color: #666;
  font-size: 13px;
}

.no-preset {
  font-size: 14px;
  color: #999;
}

.form-container {
  flex: 1;
  max-width: 800px;
}

.stepper-wrapper {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 150px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: #3f51b5;
  color: white;
}

.step.completed .step-number {
  background-color: #4caf50;
  color: white;
}

.step-label {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.step.active .step-label {
  color: #3f51b5;
  font-weight: 600;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: calc(100% + 20px);
  width: 40px;
  height: 2px;
  background-color: #e0e0e0;
}

.step.completed .step-connector {
  background-color: #4caf50;
}

.error-banner {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.step-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.form-section {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: " *";
  color: #f44336;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3f51b5;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.preset-section {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;
}

.preset-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  display: inline-block;
  padding: 6px 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-size: 13px;
  border-radius: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #303f9f;
}

.btn-secondary {
  background-color: #757575;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #616161;
}

.btn-outline {
  background-color: white;
  color: #3f51b5;
  border: 1px solid #3f51b5;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.success-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-content h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 12px;
}

.success-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
