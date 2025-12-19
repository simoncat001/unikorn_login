<template>
  <div class="user-center-layout">
    <MainAppBar />
    <div class="main-content">
      <SideBar />
      <div class="content-area">
        <div class="list-container">
          <div class="list-header">
            <h2>{{ pageTitle }}</h2>
            <button class="btn-create" @click="handleCreate">新建</button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">加载中...</div>

          <!-- Data Table -->
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
                    {{ col.label }}
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
                  <td v-for="col in columns" :key="col.key">
                    <span v-if="col.key === 'review_status'" :class="getStatusClass(row[col.key])">
                      {{ getStatusText(row[col.key]) }}
                    </span>
                    <span v-else>{{ row[col.key] }}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-text" @click="handleDetail(row)">查看</button>
                      <button class="btn-text" @click="handleEdit(row)">编辑</button>
                      <button class="btn-text delete" @click="handleDelete(row)">删除</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="tableData.length === 0">
                  <td :colspan="columns.length + 1" class="empty-state">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
             <button :disabled="page === 1" @click="page--">上一页</button>
             <span>第 {{ page }} / {{ totalPages }} 页</span>
             <button :disabled="page === totalPages" @click="page++">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainAppBar from '../components/MainAppBar.vue';
import SideBar from '../components/SideBar.vue';
import * as paths from '../router/paths';
import WordService from '../api/WordService';
import TemplateService from '../api/TemplateService';
import DevelopmentDataService from '../api/DevelopmentDataService';
import MGIDApplyService from '../api/MGIDApplyService';
import StandardService from '../api/StandardService';

const route = useRoute();
const router = useRouter();

const itemType = computed(() => route.params.itemType as string);
const page = ref(1);
const loading = ref(false);
const tableData = ref<any[]>([]);
const totalCount = ref(0);
const pageSize = 10;

const pageTitle = computed(() => {
  switch (itemType.value) {
    case 'words': return '词汇列表';
    case 'templates': return '模板列表';
    case 'development_data': return '研发数据列表';
    case 'MGID_apply': return 'MGID申请记录';
    case 'standards': return '标准列表';
    default: return '列表';
  }
});

const columns = computed(() => {
  switch (itemType.value) {
    case 'words':
      return [
        { key: 'serial_number', label: '编号', width: '100px' },
        { key: 'chinese_name', label: '中文名称', width: '200px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'reviewer', label: '审核人', width: '100px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'templates':
      return [
        { key: 'title', label: '标题', width: '200px' },
        { key: 'version', label: '版本', width: '80px' },
        { key: 'publisher', label: '发布者', width: '100px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
     case 'development_data':
      return [
        { key: 'title', label: '标题', width: '200px' },
        { key: 'template_id', label: '模板ID', width: '150px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'MGID_apply':
      return [
        { key: 'data_title', label: '数据标题', width: '200px' },
        { key: 'author_name', label: '申请人', width: '100px' },
        { key: 'create_timestamp', label: '申请时间', width: '150px' },
        { key: 'MGID', label: 'MGID', width: '150px' },
      ];
    case 'standards':
      return [
        { key: 'name_zh', label: '中文名称', width: '200px' },
        { key: 'name_en', label: '英文名称', width: '200px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    default:
      return [];
  }
});

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));

const fetchData = async () => {
  loading.value = true;
  try {
    const start = (page.value - 1) * pageSize;
    let response: any;
    let count = 0;

    switch (itemType.value) {
      case 'words':
        response = await WordService.getWordList("", start, pageSize);
        count = await WordService.getWordsCount("");
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            serial_number: item.json_schema.serial_number,
            chinese_name: item.json_schema.chinese_name,
            create_timestamp: item.json_schema.create_timestamp,
            reviewer: item.json_schema.reviewer,
            review_status: item.json_schema.review_status
        }));
        break;
      case 'templates':
        response = await TemplateService.getTemplateList("", start, pageSize);
        count = await TemplateService.getTemplatesCount("");
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            title: item.json_schema.title,
            version: item.json_schema.version || '-',
            publisher: item.json_schema.institution,
            create_timestamp: item.json_schema.create_timestamp,
            review_status: item.json_schema.review_status
        }));
        break;
      case 'development_data':
        response = await DevelopmentDataService.getDataList("", start, pageSize);
        count = await DevelopmentDataService.getDataCount("");
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            title: item.json_schema.title,
            template_id: item.template_id,
            create_timestamp: item.json_schema.create_timestamp,
            review_status: item.json_schema.review_status
        }));
        break;
      case 'MGID_apply':
        response = await MGIDApplyService.getMGIDList(start, pageSize);
        count = await MGIDApplyService.getMGIDCount();
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            data_title: item.json_data.data_title,
            author_name: item.json_data.author_name,
            create_timestamp: item.json_data.create_timestamp,
            MGID: item.json_data.MGID
        }));
        break;
      case 'standards':
        response = await StandardService.getMyStandards(start, pageSize);
        count = await StandardService.getMyStandardsCount();
        tableData.value = response.map((item: any) => ({
            id: item.id,
            name_zh: item.name_zh,
            name_en: item.name_en,
            review_status: item.review_status
        }));
        break;
    }
    totalCount.value = count;
  } catch (error) {
    console.error("Failed to fetch data", error);
    tableData.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

watch(() => itemType.value, () => {
  page.value = 1;
  fetchData();
}, { immediate: true });

watch(page, () => {
    fetchData();
});

const handleCreate = () => {
  switch (itemType.value) {
    case 'words': router.push(paths.WORDS_CREATE_PATH); break;
    case 'templates': router.push(paths.TEMPLATES_CREATE_PATH); break;
    case 'development_data': router.push(paths.DEVELOPMENT_DATA_CREATE_PATH); break;
    case 'MGID_apply': router.push(paths.MGID_APPLY_CREATE_PATH); break;
    case 'standards': router.push(paths.STANDARD_UPLOAD_PATH); break;
  }
};

const handleDetail = (row: any) => {
  switch (itemType.value) {
    case 'words':
      router.push(`${paths.WORDS_DETAIL_PATH}/${row.id}`);
      break;
    case 'templates':
      router.push(`${paths.TEMPLATES_DETAIL_PATH}/${row.id}`);
      break;
    case 'development_data':
      router.push(`${paths.DEVELOPMENT_DATA_DETAIL_PATH}/${row.id}`);
      break;
    case 'MGID_apply':
      router.push(`${paths.MGID_DETAIL_PATH}/${row.MGID}`);
      break;
    case 'standards':
      router.push(`${paths.STANDARD_DETAIL_PATH}/${row.id}`);
      break;
  }
};

const handleEdit = (row: any) => {
  switch (itemType.value) {
    case 'words':
      router.push(`${paths.WORDS_EDIT_PATH}/${row.id}`);
      break;
    case 'templates':
      router.push(`${paths.TEMPLATES_EDIT_PATH}/${row.id}`);
      break;
    case 'development_data':
      router.push(`${paths.DEVELOPMENT_DATA_EDIT_PATH}/${row.id}`);
      break;
    case 'MGID_apply':
      // No edit for MGID apply usually
      break;
    case 'standards':
      // No edit for standards yet
      break;
  }
};

const handleDelete = async (row: any) => {
  if(!confirm('确认删除?')) return;
  
  try {
      let status = 0;
      switch (itemType.value) {
        case 'words':
            status = await WordService.deleteWord(row.id);
            break;
        case 'templates':
            status = await TemplateService.deleteTemplate(row.id);
            break;
        case 'development_data':
            status = await DevelopmentDataService.deleteData(row.id);
            break;
        case 'MGID_apply':
            alert("MGID申请记录无法删除");
            return;
        case 'standards':
            status = await StandardService.deleteStandard(row.id);
            break;
      }
      
      if (status === 0) {
          alert("删除成功");
          fetchData();
      } else {
          alert("删除失败");
      }
  } catch (e) {
      console.error(e);
      alert("删除出错");
  }
};

const getStatusText = (status: string) => {
    const map: Record<string, string> = {
        'draft': '草稿',
        'submitted': '已提交',
        'passed': '已通过',
        'rejected': '已拒绝'
    };
    return map[status] || status;
};

const getStatusClass = (status: string) => {
    return `status-${status}`;
};

</script>

<style scoped>
.user-center-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.list-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 500px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-create {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-create:hover {
  background-color: #1565c0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-text {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-text.delete {
  color: #d32f2f;
}

.status-passed { color: #2e7d32; }
.status-draft { color: #ed6c02; }
.status-rejected { color: #d32f2f; }

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}

.pagination button {
    padding: 5px 10px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.pagination button:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #999;
}
</style>
