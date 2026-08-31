import { Menu } from "@logicflow/extension";
import LogicFlow from '@logicflow/core';
import "@logicflow/extension/lib/style/index.css";

LogicFlow.use(Menu)

export default function (lf: LogicFlow) {
  const menuConfig = {
    nodeMenu: [],
    edgeMenu: [],
    graphMenu: [],
  };

  lf.extension.menu.addMenuConfig(menuConfig);
}