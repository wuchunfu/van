<template>
  <VDialog
    v-model="visible"
    title="绑定菜单及权限"
    @opened="handleOpened"
    @cancel="visible = false"
    @confirm="emits('confirm', tableRef.getSelectionRows())"
  >
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="props.menuOptions"
      :tree-props="{ children: 'children' }"
      row-key="id"
      max-height="calc(100vh - 15vh - 50px - 44px - 54px - 32px)"
      border stripe default-expand-all
      :row-style="{ cursor: 'pointer' }"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" :selectable="row => ['TAB', 'PAGE', 'BUTTON', 'PROCESS', 'ENTITY'].includes(row.type)" />
      <el-table-column prop="name" label="名称" width="300"  />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="component" label="组件" />
    </el-table>
  </VDialog>

</template>

<script lang="ts" setup>
import { ElTable, ElTableColumn } from 'element-plus'
import VDialog from "@/components/dialog/VDialog.vue";
import {computed, ref} from "vue";
import {findTreeItemById, getTreeItemPath} from "@/utils/common";

interface Props {
  modelValue: boolean
  menuOptions: MenuView[]
  selectIds: string[]
}

interface Emits {
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', rows: MenuView[]): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const visible = computed<boolean>({
  get: () => props.modelValue,
  set: v => emits('update:modelValue', v)
})

const tableRef = ref<InstanceType<typeof ElTable>>()

const loading = ref<boolean>(false)

function handleOpened() {
  tableRef.value.clearSelection()
  if (props.selectIds?.length) {
    loading.value = true

    for (let selectId of props.selectIds) {
      const row = findTreeItemById(props.menuOptions, 'id', selectId)
      row && tableRef.value.toggleRowSelection(row, true)
    }

    loading.value = false
  }
}

function handleRowClick(row: MenuView) {
  console.log(666)
  if(!['TAB', 'PAGE', 'BUTTON', 'PROCESS', 'ENTITY'].includes(row.type)) {
    return
  }
  const rows: MenuView[] = tableRef.value.getSelectionRows()
  if (!rows.includes(row)) {
    const result = getTreeItemPath(props.menuOptions, 'id', row.id)
    result.forEach(it => tableRef.value.toggleRowSelection(it, true))
  } else {
    tableRef.value.toggleRowSelection(row, undefined)
  }

}

</script>

<style scoped>
:deep(.el-table__header .el-table-column--selection label) {
  display: none;
}
</style>