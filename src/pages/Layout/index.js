import React, { useMemo, useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LogoutOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  SettingOutlined,
  UserOutlined,
  MessageOutlined,
  ShopOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/modules/user';
import { removeToken } from '../../utils';
import styles from './Layout.module.scss'; // 修改为模块化导入
import logo from '../../assets/62BE5D7EF552E8ABFD297C8D41A7EACA.png';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/home', label: '数据概览', icon: <HomeOutlined className={styles.menuIcon} /> },
  { key: '/order', label: '订单管理', icon: <ShoppingCartOutlined className={styles.menuIcon} /> },
  { key: '/activitymanager', label: '活动创建', icon: <GiftOutlined className={styles.menuIcon} /> },
  { key: '/activitycontroller', label: '活动管理', icon: <SettingOutlined className={styles.menuIcon} /> },
  { key: '/usermanager', label: '用户反馈', icon: <MessageOutlined className={styles.menuIcon} /> },
  { key: '/merchant1', label: '商家管理', icon: <ShopOutlined className={styles.menuIcon} /> },
  { key: '/userOrder', label: '用户订单', icon: <UserOutlined className={styles.menuIcon} /> }
];

const LayoutComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const userInfo = useSelector(state => state.user.userInfo) || { username: '管理员' };

  const {
    token: { colorBgContainer, colorBorderSecondary, colorPrimary },
  } = theme.useToken();

  const selectedKeys = useMemo(() => {
    const path = location.pathname;
    return menuItems.filter(item => path.startsWith(item.key)).map(item => item.key);
  }, [location.pathname]);

  const handleLogout = () => {
    removeToken();
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userDropdown = (
    <Menu>
      <Menu.Item key="profile">个人设置</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className={styles.enterpriseLayout}>
      <Sider
        theme="light"
        width={240}
        className={styles.sider}
        breakpoint="lg"
        collapsedWidth={100}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div className={styles.logoContainer}>
          <img src={logo} alt="企业管理系统" className={styles.logoImg} />
          {!collapsed && <span className={styles.logoText}>西科严选</span>}
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={menuItems}
          className={styles.navMenu}
        />

        <div className={styles.collapseButton} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>

      <Layout className={styles.contentLayout}>
        <Header
          className={styles.header}
          style={{
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorderSecondary}`,
            padding: '0 24px'
          }}
        >
          <div className={styles.headerContent}>
            <div className={styles.breadcrumb}>
              <span className={styles.currentPage}>
                {menuItems.find(item => item.key === selectedKeys[0])?.label || '控制台'}
              </span>
            </div>

            <Space size="middle" className={styles.userActions}>
              <Dropdown overlay={userDropdown} trigger={['click']}>
                <div className={styles.userInfo}>
                  <Avatar
                    size="default"
                    style={{ backgroundColor: colorPrimary }}
                    icon={<UserOutlined />}
                    className={styles.userAvatar}
                  />
                  <span className={styles.username}>{userInfo.username}</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <Outlet key={location.pathname} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;