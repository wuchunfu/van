<template>
  <el-tabs type="border-card" style="height: 100%">
    <el-tab-pane label="基本信息">
      <DefUpdatePanel/>
    </el-tab-pane>
    <el-tab-pane label="字段">
      <FieldPanel scope="WORKFLOW_PRIVATE" module="WORKFLOW" :mkey="workflowDef.key" />
      <div id="field-container"></div>
    </el-tab-pane>
    <el-tab-pane label="视图配置">
      <div>视图配置</div>
    </el-tab-pane>
    <el-tab-pane label="数据源">
      <OptionPanel :mkey="workflowDef.key" scope="WORKFLOW_PRIVATE" />
    </el-tab-pane>
  </el-tabs>

</template>

<script lang="ts" setup>
import { ElTabs, ElTabPane } from "element-plus";
import DefUpdatePanel from "@/views/workflow/model/type/DefUpdatePanel.vue";
import FieldPanel from "@/views/modeling/field/FieldPanel.vue";
import OptionPanel from "@/views/modeling/option/OptionPanel.vue";
import { inject } from "vue";
import { workflowDefKey } from "./keys";

const workflowDef = inject(workflowDefKey)

</script>

<style scoped>
:deep(.el-tabs__content) {
  /* header = 39px; padding = 15 * 2 = 30px */
  height: calc(100% - 69px);
}

:deep(.el-tab-pane) {
  height: 100%;
}

</style>