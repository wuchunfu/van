<template>
  <div>
    <div class="op-line">
      <el-input style="width: 200px;" placeholder="部门名称" v-model="deptTitleKey"></el-input>
      <el-button plain style="vertical-align: middle; margin-left: 12px;" type="info" @click="expand">
        <SVGIcon style="width: 1em; height: 1em" name="Expand" /><span style="margin-left: 4px;">展开</span>
      </el-button>
      <el-button plain style="vertical-align: middle;" type="info" @click="shrink">
        <SVGIcon style="width: 1em; height: 1em" name="Shrink" /><span style="margin-left: 4px;">收缩</span>
      </el-button>
      <el-button plain type="primary" @click="addItem" :icon="Plus">新增</el-button>
      <el-popconfirm
        title="确定删除?"
        confirmButtonText="确定"
        cancelButtonText="取消"
        @confirm="batchDelete"
      >
        <template #reference>
          <el-button plain type="danger" :icon="Delete">删除</el-button>
        </template>
      </el-popconfirm>
      <el-button plain type="warning" @click="exportTable" :icon="Download">导出</el-button>
    </div>

    <div class="data-table">
      <el-table
        v-loading="loading"
        ref="tableRef"
        :height="tableHeight"
        :data="filterDataList"
        style="width: 100%"
        row-key="id"
        stripe border
        :tree-props="{ children: 'children' }"
      >
        <el-table-column type="selection" align="center" header-align="center" />
        <el-table-column prop="simple_name" align="left" header-align="left" label="简称" width="300" />
        <el-table-column type="index" align="center" header-align="center" label="#" width="60" />
        <el-table-column prop="ident" align="center" header-align="center" label="编号" width="100" />
        <el-table-column prop="order_no" align="center" header-align="center" label="排序" width="60" />
        <el-table-column prop="owner" align="center" header-align="center" label="领导" width="100">
          <template #default="scope">
            <UserViewer v-if="!!scope.row.owner_info" :data="scope.row.owner_info" />
          </template>
        </el-table-column>
        <el-table-column prop="assistant" align="center" header-align="center" label="助理" width="100">
          <template #default="scope">
            <UserViewer v-if="!!scope.row.assistant_info" :data="scope.row.assistant_info" />
          </template>
        </el-table-column>
        <el-table-column prop="status" align="center" header-align="center" label="状态" width="80">
          <template #default="scope">
            <el-tag>{{ scope.row.status === 0 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button plain text @click="editItem(scope.row)" :icon="Edit">编辑</el-button>
            <el-popconfirm
              title="确定删除?"
              confirmButtonText="确定"
              cancelButtonText="取消"
              @confirm="delItem(scope.row)"
            >
              <template #reference>
                <el-button plain style="vertical-align: middle;" text :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <DeptModal v-model="modalVisible" :mode="modalMode" :init-data="editDept" @confirm="loadDept" />

  </div>

</template>

<script lang="ts" setup>
import { ref, computed, nextTick, inject, Ref, ComputedRef, onBeforeMount, provide, toRaw } from "vue";
import SVGIcon from "@/components/common/SVGIcon.vue";
import {
  ElTable,
  ElTableColumn,
  ElInput, ElTag, 
  ElButton, 
  ElPopconfirm,
ElMessage, 
} from "element-plus";
import {filterDataWithTitle} from "@/utils/common"
import {mainHeightKey, themeKey} from "@/config/app.keys";
import { Plus, Delete, Download, Edit } from "@element-plus/icons-vue";
import DeptModal from "./modal/DeptModal.vue";
import { useDeptInfo } from "@/service/system/dept";
import UserViewer from '@/components/common/viewer/user/UserViewer.vue'
import { userMapKey } from '@/config/app.keys'

const tableRef = ref<InstanceType<typeof ElTable>>();

const theme = inject<Ref<ThemeConfig>>(themeKey)
const mainHeight = inject<ComputedRef<string>>(mainHeightKey)




const loading = ref<boolean>(false)
const tableHeight = computed<string>(() => `calc(${mainHeight.value} - ${theme.value.mainPadding + theme.value.mainPadding + 32 + 10}px)`)
const { userMap, tableData, loadDept, deleteDept } = useDeptInfo(loading)
onBeforeMount(loadDept)
provide(userMapKey, userMap)

const deptTitleKey = ref<string>("");


const filterDataList = computed<DeptView[]>(() => {
  const data = tableData.value
  if (!deptTitleKey.value) {
    return data
  }
  const result: DeptView[] = [];
  filterDataWithTitle(result, data, deptTitleKey.value, "simple_name", undefined);
  if (result.length > 0) nextTick(() => expandOrShrinkAll(result, true));
  return result;
});

const modalVisible = ref<boolean>(false)
const modalMode = ref<'create' | 'update'>('create')
const editDept = ref<DeptView | null>(null)
function addItem() {
  modalMode.value = 'create'
  modalVisible.value = true
}


function editItem(row: DeptView) {
  editDept.value = toRaw(row)
  modalMode.value = 'update'
  modalVisible.value = true
}



function delItem(row: DeptView) {
  deleteDept(row.id)
  .then(_ => ElMessage.success('删除成功'))
  .then(loadDept)
  .catch(e => (e as Error)?.message || '删除失败')
}

function exportTable() {

}

function expand() {
  expandOrShrinkAll(filterDataList.value, true);
}

function shrink() {
  expandOrShrinkAll(filterDataList.value, false);
}

function expandOrShrinkAll(list: DeptView[], expanded: boolean) {
  for (let item of list) {
    if (item.children && item.children.length > 0) {
      tableRef.value.toggleRowExpansion(item, expanded);
      if (item.children && item.children.length > 0) {
        expandOrShrinkAll(item.children, expanded);
      }
    }
  }
}

function batchDelete() {

}

</script>

<style scoped>
.op-line {
  box-sizing: border-box;
  height: 32px;
}

.data-table {
  box-sizing: border-box;
  margin-top: 10px;
}

:deep(div.el-table__header-wrapper .el-table_1_column_1 div.cell) {
  display: none;
}
</style>
