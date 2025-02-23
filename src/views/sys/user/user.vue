<template>

  <div>
    <div>
      <div class="op-line" ref="formRef">
        <el-button style="vertical-align: middle; " type="primary" @click="addUser" :icon="Plus">新增</el-button>
        <el-popconfirm
          title="确定删除?"
          confirmButtonText="确定"
          cancelButtonText="取消"
          @confirm="batchDeleteUser"
        >
          <template #reference>
            <el-button plain style="vertical-align: middle" type="danger" :icon="Delete" :disabled="selectedUsers.length === 0">删除</el-button>
          </template>
        </el-popconfirm>
        <el-button plain style="vertical-align: middle" type="warning" @click="exportUser" :icon="Download">导出</el-button>
      </div>
      <el-table
        v-loading="loading"
        ref="tableRef"
        :height="dataTableHeight"
        :data="pageData.data"
        style="width: 100%; margin-top: 10px"
        row-key="id"
        stripe
        @selection-change="handleSelectionChange"
        :row-style="{cursor: 'pointer'}"
        @row-click="handleRowClick"
      >
        <el-table-column>
          <el-table-column type="selection" align="center" header-align="center"/>
        </el-table-column>
        <el-table-column>
          <el-table-column prop="id" label="#" align="center" header-align="center" width="50"/>
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-input v-model="formData.username" @change="reloadPage"></el-input>
          </template>
          <el-table-column prop="username" label="用户名(工号)" align="left" header-align="left" width="120"></el-table-column>
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-input v-model="formData.nickname" @change="reloadPage"></el-input>
          </template>
          <el-table-column prop="nickname" label="昵称" width="100"/>
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-input v-model="formData.phone" @change="reloadPage"></el-input>
          </template>
          <el-table-column prop="phone" label="手机" width="120"/>
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-input v-model="formData.email" @change="reloadPage"></el-input>
          </template>
          <el-table-column prop="email" label="邮箱" width="150"/>
        </el-table-column>
        <el-table-column>
          <template #header>
            <dept-selector-input v-model="formData.deptId" @change="reloadPage" />
          </template>
          <el-table-column prop="dept_id" label="部门" width="250" :formatter="formatDepartment" />
        </el-table-column>
        <el-table-column>
          <template #header>
            <el-select v-model="formData.status" @change="reloadPage">
              <el-option :value="0" label="正常" />
              <el-option :value="1" label="禁用" />
            </el-select>
          </template>
          <el-table-column prop="status" label="状态" align="center" header-align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? '' : 'danger'" v-text="scope.row.status === 0 ? '正常' : '禁用'"></el-tag>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作">
          <template #default="scope">
            <el-button plain style="vertical-align: middle" text @click.stop="editUser(scope.row)" :icon="Edit">编辑</el-button>
            <el-popconfirm
              title="确定删除?"
              confirmButtonText="确定"
              cancelButtonText="取消"
              @confirm.stop="delUser(scope.row)"
            >
              <template #reference>
                <el-button plain style="vertical-align: middle" text @click.stop :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>

          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        ref="pagerRef"
        :background="false"
        style="padding-left: 0"
        layout="prev, pager, next, total"
        :total="pageData.total"
        :current-page="pageData.page_idx"
        :page-size="pageData.page_size"
        @update:current-page="handleCurrentPageChange"
      />
    </div>

    <UserCreateModal v-model="createModalVisible" :mode="createModalMode" :data="editUserInfo" @confirm="submitCreateUpdateUser" />
  </div>

</template>

<script lang="ts" setup>
import {computed, ComputedRef, inject, onBeforeMount, Ref, ref, toRaw} from "vue";
import {
  ElSelect, ElOption, ElButton, ElInput, ElPopconfirm,
  ElTable, ElTableColumn, ElTag, ElPagination, ElMessage
} from "element-plus"
import {mainHeightKey, mainWidthKey, themeKey} from "@/config/app.keys";
import {useUserData} from "@/service/system/user";
import {Delete, Plus, Download, Edit, User} from "@element-plus/icons-vue";
import UserCreateModal from "@/views/sys/user/dialog/UserCreateModal.vue";
import * as UserApi from '@/api/sys/user'
import DeptSelectorInput from "@/components/common/selector/dept/DeptSelectorInput.vue";

const loading = ref<boolean>(true)

const { pageData, loadUserPageList } = useUserData(loading)
const formData = ref<UserQueryParam>({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  deptId: '',
  status: 0,
  updateBy: '',
  pageIdx: 1,
  pageSize: 50,
})

onBeforeMount(reloadPage)

function reloadPage() {
  loadUserPageList(formData.value)
}

function formatDepartment(row: UserView) {
  return pageData.value?.additional?.dept?.[row.dept_id]?.title || ''
}

function handleCurrentPageChange(v: number) {
  formData.value.pageIdx = v
  loadUserPageList(formData.value)
}

const formRef = ref<HTMLDivElement>()
const tableRef = ref<InstanceType<typeof ElTable>>(null)
const pagerRef = ref<InstanceType<typeof ElPagination>>(null)

const theme = inject<Ref<ThemeConfig>>(themeKey)
const mainWidth = inject<ComputedRef<string>>(mainWidthKey)
const mainHeight = inject<ComputedRef<string>>(mainHeightKey)

const dataTableWidth = computed<string>(() => `calc(${mainWidth.value} - ${theme.value.mainPadding * 2 + 10}px)`)
/**
 * 10: marginTop
 */
const dataTableHeight = computed<string>(() => {
  const pagerHeight = pagerRef.value?.$el?.clientHeight || 36
  const formHeight = formRef.value?.clientHeight || 32
  return `calc(${mainHeight.value} - ${theme.value.mainPadding * 2 + formHeight + 10 + pagerHeight}px)`
})

const createModalVisible = ref<boolean>(false)
const createModalMode = ref<'create' | 'update'>('create')
const editUserInfo = ref<UserView>()
function addUser(user: UserView) {
  editUserInfo.value = null
  createModalMode.value = 'create'
  createModalVisible.value = true
}

async function editUser(user: UserView) {
  try {
    loading.value = true
    const rawUser = toRaw(user)
    rawUser.pt_dept_ids = await UserApi.findPartTimeDept()
    rawUser.role_ids = await UserApi.findBoundRoles(user.id)
    editUserInfo.value = rawUser
    createModalMode.value = 'update'
    createModalVisible.value = true
  } catch (e) {
    console.error(e)
    ElMessage.error((e as Error)?.message || '查询兼职部门失败')
  } finally {
    loading.value = false
  }

}

function submitCreateUpdateUser(v: UserAddParam | UserUpdateParam) {
  let promise = null
  if (createModalMode.value === 'create') {
    const param = v as UserAddParam
    promise = UserApi.addUser(param)
  } else {
    const param = v as UserUpdateParam
    promise = UserApi.updateUser(param)
  }
  promise?.then(_ => ElMessage.success('操作成功'))
    .then(reloadPage)
    .catch(e => {
      console.error(e)
      ElMessage.error((e as Error)?.message || '操作失败')
    })
    .finally(() => createModalVisible.value = false)

}


function delUser(user: UserView) {}

function exportUser() {}

function batchDeleteUser() {}

const selectedUsers = ref<UserView[]>([])

function handleSelectionChange(users: UserView[]) {
  selectedUsers.value = users;
}

function handleRowClick(row, column, event) {
  tableRef.value.toggleRowSelection(row, undefined);
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
  width: v-bind(dataTableWidth)
}




</style>
