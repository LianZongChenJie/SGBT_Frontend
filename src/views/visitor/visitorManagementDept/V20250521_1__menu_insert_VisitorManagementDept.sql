-- 注意：该页面对应的前台目录为views/visitor/visitorManagementDept文件夹下
-- 如果你想更改到其他目录，请修改sql中component字段对应的值

-- 访客管理（组织架构版）菜单
INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external)
VALUES ('2025052100010000001', NULL, '访客管理（组织架构）', '/visitor/visitorManagementDept', 'visitor/visitorManagementDept/index', NULL, NULL, 0, NULL, '1', 1.00, 0, NULL, 1, 0, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2025-05-21 10:00:00', NULL, NULL, 0);

-- 权限控制sql
-- 新增
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2025052100010000002', '2025052100010000001', '添加访客（组织架构）', NULL, NULL, 0, NULL, NULL, 2, 'bems:visitor:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-05-21 10:00:00', NULL, NULL, 0, 0, '1', 0);
