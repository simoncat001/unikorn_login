<template>
  <div class="admin-layout">
    <MainAppBar />
    <div class="main-content">
      <div class="sidebar">
        <div class="sidebar-menu">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            class="menu-item"
            :class="{ active: currentItemType === item.key }"
            @click="handleMenuClick(item.key)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      
      <div class="content-area">
        <div class="page-header">
          <h2>{{ pageTitle }}</h2>
        </div>
        
        <div class="filter-tabs">
          <button 
            v-for="filter in filters" 
            :key="filter.value"
            class="tab-btn"
            :class="{ active: currentFilter === filter.value }"
            @click="currentFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="table-container">
          <div v-if="loading" class="loading">加载中...</div>
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
                    <a v-else-if="col.key === 'data_url'" :href="getClickableLink(row[col.key])" target="_blank" class="link-text">
                      链接地址
                    </a>
                    <router-link 
                      v-else-if="col.key === 'template_name'" 
                      :to="`${paths.ADMIN_TEMPLATES_DETAIL_PATH}/${row.template_id}`"
                      class="link-text"
                    >
                      {{ row[col.key] }}
                    </router-link>
                    <span v-else>{{ row[col.key] }}</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-text" @click="handleDetail(row)">
                        {{ currentItemType === 'standards' ? '详情' : '审核' }}
                      </button>
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
import MainAppBar from '../../components/MainAppBar.vue';
import * as paths from '../../router/paths';
import AdminService from '../../api/AdminService';
import WordService from '../../api/WordService';
import TemplateService from '../../api/TemplateService';
import DevelopmentDataService from '../../api/DevelopmentDataService';
import MGIDApplyService from '../../api/MGIDApplyService';
import StandardService from '../../api/StandardService';

import { resolveApiUrl } from '../../api/config';

const route = useRoute();
const router = useRouter();

const menuItems = [
  { key: 'words', label: '词条管理' },
  { key: 'templates', label: '模板管理' },
  { key: 'data', label: '研发数据管理' },
  { key: 'standards', label: '数据标准' },
  { key: 'MGID', label: 'MGID申请' },
];

const currentItemType = computed(() => route.params.itemType as string || 'words');

const pageTitle = computed(() => {
  const item = menuItems.find(i => i.key === currentItemType.value);
  return item ? item.label : '管理中心';
});

const filters = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'submitted' },
  { label: '已通过', value: 'passed' },
  { label: '已拒绝', value: 'rejected' },
];

const currentFilter = ref('all');
const page = ref(1);
const pageSize = 10;
const totalCount = ref(0);
const loading = ref(false);
const tableData = ref<any[]>([]);

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));

const columns = computed(() => {
  switch (currentItemType.value) {
    case 'words':
      return [
        { key: 'serial_number', label: '编号', width: '100px' },
        { key: 'chinese_name', label: '中文名称', width: '200px' },
        { key: 'reviewer', label: '审核人', width: '100px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'templates':
      return [
        { key: 'title', label: '模板名称', width: '200px' },
        { key: 'version', label: '版本', width: '80px' },
        { key: 'publisher', label: '发布机构', width: '150px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'data':
      return [
        { key: 'title', label: '标题', width: '200px' },
        { key: 'template_name', label: '模板名称', width: '150px' },
        { key: 'create_timestamp', label: '创建时间', width: '150px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'standards':
      return [
        { key: 'name_zh', label: '中文名称', width: '200px' },
        { key: 'name_en', label: '英文名称', width: '200px' },
        { key: 'owner', label: '提交人', width: '100px' },
        { key: 'review_status', label: '状态', width: '100px' },
      ];
    case 'MGID':
      return [
        { key: 'data_title', label: '数据标题', width: '200px' },
        { key: 'author_name', label: '申请人', width: '100px' },
        { key: 'MGID', label: 'MGID', width: '150px' },
        { key: 'data_url', label: '链接地址', width: '150px' },
        { key: 'create_timestamp', label: '申请时间', width: '150px' },
      ];
    default:
      return [];
  }
});

const getClickableLink = (link: string) => {
  if (!link) return '';
  return link.startsWith("http://") || link.startsWith("https://")
    ? link
    : `//${link}`;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const start = (page.value - 1) * pageSize;
    const filter = currentFilter.value;
    
    let response: any;
    let count = 0;

    switch (currentItemType.value) {
      case 'words':
        response = await AdminService.getWordList(filter, start, pageSize);
        count = await AdminService.getWordsCount(filter);
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            serial_number: item.json_data.serial_number,
            chinese_name: item.json_data.chinese_name,
            create_timestamp: item.json_data.create_timestamp,
            reviewer: item.json_data.reviewer,
            review_status: item.json_data.review_status
        }));
        break;
      case 'templates':
        response = await AdminService.getTemplateList(filter, start, pageSize);
        count = await AdminService.getTemplatesCount(filter);
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            title: item.json_schema.title,
            version: item.json_schema.version || '-',
            publisher: item.json_schema.institution,
            create_timestamp: item.json_schema.create_timestamp,
            review_status: item.json_schema.review_status
        }));
        break;
      case 'data':
        response = await AdminService.getDataList(filter, start, pageSize);
        count = await AdminService.getDataCount(filter);
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            title: item.json_data.title,
            template_id: item.template_id,
            template_name: item.json_data.template_name,
            create_timestamp: item.json_data.create_timestamp,
            review_status: item.json_data.review_status
        }));
        break;
      case 'standards':
        response = await StandardService.getStandards(start, pageSize);
        // Backend currently returns list directly, but service wraps it in { data: ... }
        // If backend returns list, response.data is the list.
        // My service mock returned { data: data, total: 100 }
        count = 100; // Mock count for now
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            name_zh: item.name_zh,
            name_en: item.name_en,
            file_url: item.file_url,
            owner: item.owner,
            review_status: item.review_status || 'pending'
        }));
        break;
      case 'MGID':
        response = await AdminService.getMGIDList(start, pageSize);
        count = await AdminService.getMGIDCount();
        tableData.value = response.data.map((item: any) => ({
            id: item.id,
            data_title: item.json_data.data_title,
            author_name: item.json_data.author_name,
            create_timestamp: item.json_data.create_timestamp,
            MGID: item.json_data.MGID,
            data_url: item.json_data.data_url
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

watch([() => currentItemType.value, currentFilter], () => {
  page.value = 1;
  fetchData();
}, { immediate: true });

watch(page, () => {
    fetchData();
});

const handleMenuClick = (key: string) => {
    router.push(`${paths.ADMIN_PATH}/${key}`);
};

const handleDetail = (row: any) => {
  switch (currentItemType.value) {
    case 'words':
      router.push(`${paths.ADMIN_WORDS_DETAIL_PATH}/${row.id}`);
      break;
    case 'templates':
      router.push(`${paths.ADMIN_TEMPLATES_DETAIL_PATH}/${row.id}`);
      break;
    case 'data':
      router.push(`${paths.ADMIN_DATA_DETAIL_PATH}/${row.id}`);
      break;
    case 'standards':
      router.push(`${paths.STANDARD_DETAIL_PATH}/${row.id}`);
      break;
    case 'MGID':
      router.push(`${paths.ADMIN_MGID_DETAIL_PATH}/${row.MGID}/default`);
      break;
  }
};

const handleDelete = async (row: any) => {
  if(!confirm('确认删除?')) return;
  
  try {
      let status = 0;
      switch (currentItemType.value) {
        case 'words':
            status = (await WordService.deleteWord(row.id)).status;
            break;
        case 'templates':
            status = (await TemplateService.deleteTemplate(row.id)).status;
            break;
        case 'data':
            status = (await DevelopmentDataService.deleteData(row.id)).status;
            break;
        case 'standards':
            const res = await StandardService.deleteStandard(row.id);
            status = res.status;
            break;
        case 'MGID':
            alert('MGID暂不支持删除');
            return;
      }
      
      if (status === 0) {
          alert('删除成功');
          fetchData();
      } else {
          alert('删除失败');
      }
  } catch (e) {
      console.error(e);
      alert('删除出错');
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'passed': return 'status-passed';
    case 'rejected': return 'status-rejected';
    case 'submitted': return 'status-submitted';
    default: return '';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'passed': return '已通过';
    case 'rejected': return '已拒绝';
    case 'submitted': return '待审核';
    default: return status || '-';
  }
};
</script>

<style scoped>
.admin-layout {
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

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  padding: 20px 0;
}

.menu-item {
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f0f7ff;
  color: #1976d2;
}

.menu-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-right: 3px solid #1976d2;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.filter-tabs {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}

.tab-btn.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #666;
}

.status-passed { color: #4caf50; }
.status-rejected { color: #f44336; }
.status-submitted { color: #ff9800; }

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-text {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-text.delete {
  color: #f44336;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}
.link-text {
  color: #0056b3;
  text-decoration: underline;
}

.link-text:hover {
  text-decoration: none;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
