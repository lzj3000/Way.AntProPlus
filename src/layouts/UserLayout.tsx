import { DefaultFooter, MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link, SelectLang, useIntl, ConnectProps, connect, FormattedMessage } from 'umi';
import React from 'react';
import { ConnectState } from '@/models/connect';
import logo from '../assets/catimages/10.jpg';
import styles from './UserLayout.less';
import { Avatar } from 'antd';

export interface UserLayoutProps extends Partial<ConnectProps> {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
}

const UserLayout: React.FC<UserLayoutProps> = (props) => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage,
    breadcrumb,
    ...props,
  });
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
              <Avatar size="large" src={logo}></Avatar>
                <span className={styles.title}>运输管理系统</span>
              </Link>
            </div>
            <div className={styles.desc}>
              为改善效率运行
            </div>
          </div>
          {children}
        </div>
        <DefaultFooter links={[]} copyright={`${new Date().getFullYear()} 深圳其佑科技`} />
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }: ConnectState) => ({ ...settings }))(UserLayout);
