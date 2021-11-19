<template>
  <!-- 适配所有级别菜单 || 一级二级三级等等... -->
  <nav>
    <el-menu
      :default-active="$route.path"
      class="sidebar-el-menu"
      @select="handleSelect"
      :collapse="isCollapse"
      :background-color="bgColor"
      :text-color="textColor"
      :active-text-color="activeTextColor"
      unique-opened
      router
    >
      <menus-item :list="menus"></menus-item>
    </el-menu>
  </nav>
</template>

<script>
import menusItem from "./menusItem";
export default {
  name: "wjMenu",
  components: {
    menusItem,
  },
  props: {
    menus: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      defaultActive: "/firstItem",
      isCollapse: false,
      bgColor: "#545c64",
      textColor: "#fff",
      activeTextColor: "#ffd04b",
    };
  },
  methods: {
    handleSelect(index) {
      this.defaultActive = index;
    },
  },
};
</script>

<style scoped>
nav {
  height: inherit;
  overflow-y: auto;
  overflow-x: hidden;
}
nav::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}
.el-menu {
  text-align: left;
}
</style>