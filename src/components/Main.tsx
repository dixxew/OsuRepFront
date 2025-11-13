import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../App.css";
import { ChatUser } from "../types/ChatUser";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import ChannelMonthlyHistogramm from "./ChannelMonthlyHistogramm";
import ChannelDailyHistogramm from "./ChannelDailyHistogramm";
import Header from "./Header";

import {
  ConfigProvider,
  Layout,
  Row,
  Col,
  Pagination,
  Skeleton,
  Empty,
  Typography,
  Button,
  Space,
  theme,
  Card,
} from "antd";

import {
  ApiOutlined,
  DashboardOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

import darkTheme from "../theme";

const { Content, Footer } = Layout;
const { Text } = Typography;

const Main: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[] | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>("reputation");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchNickname, setSearchNickname] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await axios.get(
          `https://osu.dixxew.ru/api/Users/GetUsers`,
          {
            params: {
              pageNumber: currentPage,
              pageSize,
              sortField,
              search: searchNickname || undefined,
            },
            signal: controller.signal,
          }
        );

        setUsers(response.data.data);
        setTotalRecords(response.data.totalRecords);
      } catch (e: any) {
        if (!axios.isCancel(e)) {
          setUsers([]);
          setLoadError(e?.message ?? "Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [currentPage, pageSize, sortField, searchNickname]);

  const paginationShowTotal = useMemo(
    () => (total: number, range: [number, number]) =>
      `${range[0]}–${range[1]} из ${total}`,
    []
  );

  return (
    <div className="App">
      <ConfigProvider theme={darkTheme}>
        <Layout className="layout-root">
          <header>
            <Header />
          </header>

          <Content className="content-root">
            <Row gutter={[16, 16]}>
              {/* LEFT */}
              <Col xs={24} md={16} lg={17} xl={18}>
                <Card
                  bordered={false}
                  className="main-card"
                  bodyStyle={{ padding: 0 }}
                >
                  {loading ? (
                    <div className="pad16">
                      <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                  ) : loadError ? (
                    <div className="pad24">
                      <Empty
                        description={
                          <Text type="secondary">
                            Не удалось загрузить пользователей: {loadError}
                          </Text>
                        }
                      />
                    </div>
                  ) : users && users.length > 0 ? (
                    <UserTable
                      users={users}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onSortChange={(f) => setSortField(f)}
                      onRowClick={(u) => setSelectedUser(u)}
                      onSearchNickname={(term) => {
                        setSearchNickname(term);
                        setCurrentPage(1);
                      }}
                    />
                  ) : (
                    <div className="pad24">
                      <Empty description="Нет данных" />
                    </div>
                  )}
                </Card>

                <div className="pagination-wrapper">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalRecords}
                    showSizeChanger
                    onChange={(p, ps) => {
                      setCurrentPage(p);
                      setPageSize(ps);
                    }}
                    showTotal={paginationShowTotal}
                  />
                </div>
              </Col>

              {/* RIGHT */}
              <Col xs={24} md={8} lg={7} xl={6}>
                {/* Здесь НЕ Card. Компонент сам его делает */}
                <ChannelDailyHistogramm />
              </Col>

              {/* MONTHLY */}
              <Col span={24}>
                {/* И тут тоже без Card */}
                <ChannelMonthlyHistogramm />
              </Col>
            </Row>
          </Content>

          <Footer className="enhanced-footer" style={{padding: "24px 0 0 0"}}>
            <div className="footer-center">
              <Space align="center" size={[12, 16]} wrap>
                <Button
                  type="text"
                  href="https://osu.ppy.sh/users/13928601"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-btn pink"
                >
                  by Dixxew
                </Button>

                <div className="repo-group">
                  <Button
                    type="text"
                    href="https://github.com/dixxew/OsuRussianRep"
                    target="_blank"
                    rel="noreferrer"
                    className="repo-btn repo-btn-left"
                  >
                    <i className="github-icon" />
                    Backend
                  </Button>

                  <Button
                    type="text"
                    href="https://github.com/dixxew/OsuRepFront"
                    target="_blank"
                    rel="noreferrer"
                    className="repo-btn repo-btn-right"
                  >
                    <i className="github-icon" />
                    Frontend
                  </Button>
                </div>

                <Button
                  type="text"
                  icon={<UserOutlined />}
                  className="footer-txt"
                  href="https://dixxew.ru"
                  target="_blank"
                >
                  About me
                </Button>

                <Button
                  type="text"
                  icon={<DashboardOutlined />}
                  className="footer-txt"
                  href="https://dashboard.dixxew.ru"
                  target="_blank"
                >
                  Dashy
                </Button>

                <Button
                  type="text"
                  icon={<SendOutlined />}
                  href="https://t.me/Dixxew"
                  target="_blank"
                  className="footer-btn blue"
                >
                  Telegram
                </Button>

                <Button
                  type="text"
                  icon={<ApiOutlined />}
                  href="https://osu.dixxew.ru/api/scalar"
                  target="_blank"
                  className="footer-txt"
                >
                  Scalar
                </Button>
              </Space>
            </div>
            <div className="footer-line" />
          </Footer>
        </Layout>

        <UserModal
          visible={!!selectedUser}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </ConfigProvider>
    </div>
  );
};

export default Main;
