
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Groups = lazy(() => import('../../pages/Groups').then(m => ({ default: m.Groups })));
const GroupChat = lazy(() => import('../../pages/GroupChat').then(m => ({ default: m.GroupChat })));
const GroupLanding = lazy(() => import('../../pages/GroupLanding').then(m => ({ default: m.GroupLanding })));
const CreateGroup = lazy(() => import('../../pages/CreateGroup').then(m => ({ default: m.CreateGroup })));
const CreateVipGroup = lazy(() => import('../../pages/CreateVipGroup').then(m => ({ default: m.CreateVipGroup })));
const CreatePublicGroup = lazy(() => import('../../pages/CreatePublicGroup').then(m => ({ default: m.CreatePublicGroup })));
const CreatePrivateGroup = lazy(() => import('../../pages/CreatePrivateGroup').then(m => ({ default: m.CreatePrivateGroup })));
const EditGroup = lazy(() => import('../../pages/EditGroup').then(m => ({ default: m.EditGroup })));
const VipGroupSales = lazy(() => import('../../pages/VipGroupSales').then(m => ({ default: m.VipGroupSales })));
const GroupSettings = lazy(() => import('../../pages/GroupSettings').then(m => ({ default: m.GroupSettings })));
const SuccessBridge = lazy(() => import('../../pages/SuccessBridge').then(m => ({ default: m.SuccessBridge })));
const GroupInfoPage = lazy(() => import('../../pages/groups/settings/GroupInfoPage').then(m => ({ default: m.GroupInfoPage })));
const GroupAccessPage = lazy(() => import('../../pages/groups/settings/GroupAccessPage').then(m => ({ default: m.GroupAccessPage })));
const GroupModerationPage = lazy(() => import('../../pages/groups/settings/GroupModerationPage').then(m => ({ default: m.GroupModerationPage })));
const GroupMembersPage = lazy(() => import('../../pages/groups/settings/GroupMembersPage').then(m => ({ default: m.GroupMembersPage })));
const GroupVipPage = lazy(() => import('../../pages/groups/settings/GroupVipPage').then(m => ({ default: m.GroupVipPage })));
const GroupStatisticsPage = lazy(() => import('../../pages/groups/settings/GroupStatisticsPage').then(m => ({ default: m.GroupStatisticsPage })));
const GroupAuditLogs = lazy(() => import('../../pages/groups/settings/GroupAuditLogs').then(m => ({ default: m.GroupAuditLogs })));
const GroupChannelsPage = lazy(() => import('../../pages/groups/settings/GroupChannelsPage').then(m => ({ default: m.GroupChannelsPage })));
const GroupSchedule = lazy(() => import('../../pages/groups/settings/GroupSchedule').then(m => ({ default: m.GroupSchedule })));
const GroupSalesPlatformPage = lazy(() => import('../../pages/groups/settings/GroupSalesPlatformPage').then(m => ({ default: m.GroupSalesPlatformPage })));
const GroupSalesPlatformView = lazy(() => import('../../pages/groups/GroupSalesPlatformView').then(m => ({ default: m.GroupSalesPlatformView })));
const SalesFolderContentPage = lazy(() => import('../../pages/groups/SalesFolderContentPage').then(m => ({ default: m.SalesFolderContentPage })));
const GroupRolesPage = lazy(() => import('../../pages/groups/settings/GroupRolesPage').then(m => ({ default: m.GroupRolesPage })));
const GroupChannelsList = lazy(() => import('../../pages/groups/GroupChannelsList').then(m => ({ default: m.GroupChannelsList })));
const GroupCheckoutConfigPage = lazy(() => import('../../pages/groups/settings/GroupCheckoutConfigPage').then(m => ({ default: m.GroupCheckoutConfigPage })));
const GroupLimits = lazy(() => import('../../pages/LimitAndControl').then(m => ({ default: m.LimitAndControl })));
const ManageGroupLinks = lazy(() => import('../../pages/ManageGroupLinks').then(m => ({ default: m.ManageGroupLinks })));
const GroupRevenue = lazy(() => import('../../pages/GroupRevenue').then(m => ({ default: m.GroupRevenue })));
const VipSalesHistory = lazy(() => import('../../pages/VipSalesHistory').then(m => ({ default: m.VipSalesHistory })));

export const groupRoutes = [
    { path: '/groups', element: <ProtectedRoute><Groups /></ProtectedRoute> },
    { path: '/group-chat/:id', element: <ProtectedRoute><GroupChat /></ProtectedRoute> },
    { path: '/group-chat/:id/:channelId', element: <ProtectedRoute><GroupChat /></ProtectedRoute> },
    { path: '/group/:id/channels', element: <ProtectedRoute><GroupChannelsList /></ProtectedRoute> },
    { path: '/group-landing/:id', element: <GroupLanding /> },
    { path: '/vip-group-sales/:id', element: <VipGroupSales /> },
    { path: '/create-group', element: <ProtectedRoute><CreateGroup /></ProtectedRoute> },
    { path: '/create-group/vip', element: <ProtectedRoute><CreateVipGroup /></ProtectedRoute> },
    { path: '/create-group/public', element: <ProtectedRoute><CreatePublicGroup /></ProtectedRoute> },
    { path: '/create-group/private', element: <ProtectedRoute><CreatePrivateGroup /></ProtectedRoute> },
    { path: '/edit-group/:id', element: <ProtectedRoute><EditGroup /></ProtectedRoute> },
    { path: '/payment-success-bridge/:id', element: <ProtectedRoute><SuccessBridge /></ProtectedRoute> },
    { path: '/group-settings/:id', element: <ProtectedRoute><GroupSettings /></ProtectedRoute> },
    { path: '/group-settings/:id/info', element: <ProtectedRoute><GroupInfoPage /></ProtectedRoute> },
    { path: '/group-settings/:id/access', element: <ProtectedRoute><GroupAccessPage /></ProtectedRoute> },
    { path: '/group-settings/:id/moderation', element: <ProtectedRoute><GroupModerationPage /></ProtectedRoute> },
    { path: '/group-settings/:id/members', element: <ProtectedRoute><GroupMembersPage /></ProtectedRoute> },
    { path: '/group-settings/:id/roles', element: <ProtectedRoute><GroupRolesPage /></ProtectedRoute> },
    { path: '/group-settings/:id/vip', element: <ProtectedRoute><GroupVipPage /></ProtectedRoute> },
    { path: '/group-settings/:id/stats', element: <ProtectedRoute><GroupStatisticsPage /></ProtectedRoute> },
    { path: '/group-settings/:id/audit', element: <ProtectedRoute><GroupAuditLogs /></ProtectedRoute> },
    { path: '/group-settings/:id/channels', element: <ProtectedRoute><GroupChannelsPage /></ProtectedRoute> },
    { path: '/group-settings/:id/schedule', element: <ProtectedRoute><GroupSchedule /></ProtectedRoute> },
    { path: '/group-settings/:id/sales-platform', element: <ProtectedRoute><GroupSalesPlatformPage /></ProtectedRoute> },
    { path: '/group-settings/:id/checkout-config', element: <ProtectedRoute><GroupCheckoutConfigPage /></ProtectedRoute> },
    { path: '/group-platform/:id', element: <ProtectedRoute><GroupSalesPlatformView /></ProtectedRoute> },
    { path: '/group-folder/:groupId/:folderId', element: <ProtectedRoute><SalesFolderContentPage /></ProtectedRoute> },
    { path: '/group-limits/:id', element: <ProtectedRoute><GroupLimits /></ProtectedRoute> },
    { path: '/group-links/:id', element: <ProtectedRoute><ManageGroupLinks /></ProtectedRoute> },
    { path: '/group-revenue/:id', element: <ProtectedRoute><GroupRevenue /></ProtectedRoute> },
    { path: '/vip-sales-history/:id', element: <ProtectedRoute><VipSalesHistory /></ProtectedRoute> }
  ];
  