import { createApp, ref } from 'vue'
import App from './App.vue'
import {isReady, setupRouter} from './router'
import 'virtual:svg-icons-register'
import 'element-plus/dist/index.css';
import { ElLoading, ElMessage } from 'element-plus';
import {setupAxios} from "./config/axios.http"
import * as UserApi from "@/api/sys/user"
import {remove} from "./utils/storage"
import {menuOptionsKey, userInfoKey, userMapKey} from "./config/app.keys"
import {permission} from "@/directives/permission"
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import {toTree} from "@/utils/common";
import { varOptions } from '@/components/permission/components/condition'
import './styles/index.css'


async function startup() {
  try {
    const app = createApp(App)

    setupAxios()
    app.use(ElLoading)
    app.use(VXETable)

    const map = new Map<string, UserView>()
    varOptions.forEach(it => map.set(it.id, it))
    app.provide(userMapKey, map)

    const menuOptions = ref<MenuView[]>([])
    const userInfo = ref<UserInfo>()

    try {
      const data = await UserApi.menu()
      data.menus = toTree(data.menus, 'id', 'pid', 'order_no')
      menuOptions.value = data.menus
      userInfo.value = data.user_info
      console.log("menu list", data);
    } catch (e) {
      remove("isLogin")
      remove("tags")
      e instanceof Error && console.error(e.message)
    } finally {
      app.provide(menuOptionsKey, menuOptions)
      app.provide(userInfoKey, userInfo)
    }

    console.log("startup setup router before");
    // @ts-ignore
    setupRouter(app, menuOptions.value);
    console.log("startup setup router after");

    await isReady();
    console.log("router is ready now");

    app.directive("permission", permission)

    app.mount('#app')
  } catch (e) {
    console.log(e);
  }

}

startup()

