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
  Card,
  Pagination,
  Skeleton,
  Empty,
  Typography,
  theme,
  Button,
  Space,
} from "antd";
import darkTheme from "../theme";
import {
  ApiOutlined,
  DashboardOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";

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

  const { token } = theme.useToken();
  const API_BASE = (
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    ""
  ).replace(/\/$/, "");

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async (
      pageNumber: number,
      pageSizeVal: number,
      sort: string | null,
      search: string
    ) => {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await axios.get(
          `https://osu.dixxew.ru/api/Users/GetUsers`,
          {
            params: {
              pageNumber,
              pageSize: pageSizeVal,
              sortField: sort,
              search: search || undefined, 
            },
            signal: controller.signal,
          }
        );

        setUsers(response.data.data);
        setTotalRecords(response.data.totalRecords);
      } catch (error: any) {
        if (axios.isCancel(error)) return;
        console.error("Ошибка при загрузке пользователей:", error);
        setUsers([]);
        setLoadError(error?.message ?? "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(currentPage, pageSize, sortField, searchNickname);

    return () => controller.abort();
  }, [currentPage, pageSize, sortField, searchNickname]);

  const handlePageChange = (page: number, pageSizeParam?: number) => {
    setCurrentPage(page);
    if (pageSizeParam && pageSizeParam !== pageSize) {
      setPageSize(pageSizeParam);
    }
  };

  const handleSortChange = (field: string) => setSortField(field);
  const handleRowClick = (record: ChatUser) => setSelectedUser(record);
  const handleModalClose = () => setSelectedUser(null);

  // Подпись под пагинацией: «X–Y из Z»
  const paginationShowTotal = useMemo(
    () => (total: number, range: [number, number]) =>
      `${range[0]}–${range[1]} из ${total}`,
    []
  );

  return (
    <div className="App">
      <ConfigProvider theme={darkTheme}>
        <Layout style={{ minHeight: "100vh" }}>
          <header>
            <Header />
          </header>

          {/* оставляем нижний паддинг под футер */}
          <Content style={{ padding: "16px 16px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16} xl={18}>
                <Card
                  bordered
                  bodyStyle={{ padding: 0 }}
                  style={{
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  }}
                >
                  {loading ? (
                    <div style={{ padding: 16 }}>
                      <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                  ) : loadError ? (
                    <div style={{ padding: 24 }}>
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
                      onSortChange={handleSortChange}
                      onRowClick={handleRowClick}
                      onSearchNickname={(term) => {
                        setSearchNickname(term);
                        setCurrentPage(1); // сбрасываем пагинацию, чтобы с первого запроса
                      }}
                    />
                  ) : (
                    <div style={{ padding: 24 }}>
                      <Empty description="Нет данных" />
                    </div>
                  )}
                </Card>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={totalRecords}
                    showSizeChanger
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                    showTotal={paginationShowTotal}
                  />
                </div>
              </Col>

              <Col xs={24} lg={8} xl={6}>
                <ChannelDailyHistogramm />
              </Col>

              {/* чуть воздуха перед футером, если хочется */}
              <Col span={24} style={{ marginBottom: 8 }}>
                <ChannelMonthlyHistogramm />
              </Col>
            </Row>
          </Content>

          {/* ВОТ ТУТ должен быть футер — ВНУТРИ Layout */}
          <Footer
            className="app-footer"
            style={{
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Space
              align="center"
              size={[8, 12]}
              wrap
              className="app-header-right"
            >
              <Button
                type="text"
                style={{ backgroundColor: "#ff66aa" }}
                href="https://osu.ppy.sh/users/13928601"
                target="_blank"
                rel="noreferrer"
              >
                by Dixxew
              </Button>
              <Button
                type="text"
                icon={<UserOutlined />}
                href="https://dixxew.ru"
                target="_blank"
                rel="noreferrer"
              >
                About me
              </Button>
              <Button
                type="text"
                icon={<DashboardOutlined />}
                href="https://dashboard.dixxew.ru"
                target="_blank"
                rel="noreferrer"
              >
                Dashy
              </Button>
              <Button
                type="text"
                style={{ backgroundColor: "#1890ff" }}
                icon={<SendOutlined />}
                href="https://t.me/Dixxew"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </Button>
              <Button
                type="text"
                icon={<ApiOutlined />}
                href="https://osu.dixxew.ru/api/scalar"
                target="_blank"
                rel="noopener noreferrer"
              >
                Scalar
              </Button>
            </Space>
          </Footer>
        </Layout>

        <UserModal
          visible={!!selectedUser}
          user={selectedUser}
          onClose={handleModalClose}
        />
      </ConfigProvider>
    </div>
  );
};

export default Main;
