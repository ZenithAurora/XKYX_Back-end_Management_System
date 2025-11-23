import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { login } from '../../store/modules/user';
import { loginAPI } from '../../apis/LoginApi';
import { setToken, removeToken } from '../../utils';
import store from '../../store';
import styles from './Login.module.scss';
import { logout } from '../../store/modules/user';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 处理URL参数（登录过期/冲突登录）
  useEffect(() => {
    const reason = searchParams.get('reason');
    const redirect = searchParams.get('redirect');

    const errorMessages = {
      expired: {
        type: 'warning',
        content: '登录已过期，请重新登录',
      },
      conflict: {
        type: 'error',
        content: '您的账号已在其他设备登录，如非本人操作请及时修改密码！',
      }
    };

    if (reason && errorMessages[reason]) {
      messageApi[errorMessages[reason].type]({
        content: errorMessages[reason].content,
        duration: reason === 'conflict' ? 4 : 2
      });

      if (reason === 'conflict') {
        removeToken();
        store.dispatch(logout());
      }
    }

    if (!reason && redirect) {
      messageApi.info('请登录后继续操作');
    }

    // 检查本地存储中是否有记住的账号
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, [messageApi, searchParams]);

  // 处理登录提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginAPI({ username, password });

      if (response.code === 1) {
        const { token, adminId, username, wechatId, phoneNumber, qrCodeUrl } = response.data;

        // 设置Token和Redux状态
        setToken(token);
        dispatch(login({
          token,
          adminId,
          username,
          wechatId,
          phoneNumber,
          qrCodeUrl,
        }));

        // 处理"记住我"功能
        if (rememberMe) {
          localStorage.setItem('remembered_username', username);
        } else {
          localStorage.removeItem('remembered_username');
        }

        // 显示成功消息
        messageApi.success({
          content: '登录成功！欢迎回来',
          duration: 1.5,
        });

        // 跳转到首页
        setTimeout(() => {
          navigate('/home');
        }, 1200);
      } else {
        messageApi.error({
          content: response.msg || '登录失败，请检查账号密码',
        });
      }
    } catch (error) {
      messageApi.error({
        content: error.message || '网络连接异常，请稍后重试',
        duration: 2.5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {contextHolder}

      <div className={styles.loginCard}>
        {/* 左侧品牌展示区 */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.logo}>
              <div className={styles.logoCircle}>
                <div className={styles.logoInnerCircle}>
                  <span className={styles.xike}>西科</span>
                  <span className={styles.yanxuan}>严选</span>
                </div>
              </div>
            </div>
            <div className={styles.brandText}>
              <h1>西科严选管理平台</h1>
              <p>企业级商品供应链管理系统</p>
            </div>

            <div className={styles.brandFooter}>
              <p>© 2023 西科严选 | 企业供应链管理系统 V2.0</p>
            </div>
          </div>
        </div>

        {/* 右侧登录表单区 */}
        <div className={styles.loginSection}>
          <div className={styles.loginContent}>
            <h2>欢迎回来</h2>
            <p>请使用您的账号登录系统</p>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">管理员账号</label>
                <div className={styles.inputWithIcon}>
                  <i className={`${styles.icon} ${styles.userIcon}`}></i>
                  <input
                    type="text"
                    id="username"
                    placeholder="请输入管理员账号"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">登录密码</label>
                <div className={styles.inputWithIcon}>
                  <i className={`${styles.icon} ${styles.lockIcon}`}></i>
                  <input
                    type="password"
                    id="password"
                    placeholder="请输入登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.options}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span>记住账号</span>
                </label>
                <a href="#" className={styles.forgotPassword}>忘记密码?</a>
              </div>

              <button
                type="submit"
                className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  '登录系统'
                )}
              </button>

              <div className={styles.divider}>
                <span>或使用其他方式登录</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>西科严选® - 打造企业级供应链解决方案</p>
      </div>
    </div>
  );
};

export default Login;