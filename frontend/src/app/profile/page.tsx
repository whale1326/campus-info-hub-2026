"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Tabs,
  Table,
  Tag,
  Popconfirm,
  Space,
  Avatar,
  Typography,
  Divider,
  Empty,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, postsApi, type User, type Post } from "@/lib/api";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  // Profile form
  const [profileForm] = Form.useForm();
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [passwordForm] = Form.useForm();
  const [passwordSaving, setPasswordSaving] = useState(false);

  // My posts
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsPage, setPostsPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const profileRes = await authApi.getProfile();
      setUser(profileRes.user);
      profileForm.setFieldsValue({ contact: profileRes.user.contact });
      await loadMyPosts(1);
    } catch (err: any) {
      messageApi.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadMyPosts = async (page: number) => {
    setPostsLoading(true);
    try {
      const res = await postsApi.getMyPosts({ page, page_size: 10 });
      setMyPosts(res.posts);
      setPostsTotal(res.total);
      setPostsPage(page);
    } catch (err: any) {
      messageApi.error(err.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleUpdateProfile = async (values: { contact: string }) => {
    setProfileSaving(true);
    try {
      const res = await authApi.updateProfile(values.contact);
      setUser(res.user);
      messageApi.success("联系方式更新成功");
    } catch (err: any) {
      messageApi.error(err.message || "更新失败");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (values: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    if (values.new_password !== values.confirm_password) {
      messageApi.error("两次输入的密码不一致");
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword(values.old_password, values.new_password);
      messageApi.success("密码修改成功");
      passwordForm.resetFields();
    } catch (err: any) {
      messageApi.error(err.message || "密码修改失败");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await postsApi.delete(id);
      messageApi.success("删除成功");
      loadMyPosts(postsPage);
    } catch (err: any) {
      messageApi.error(err.message || "删除失败");
    }
  };

  const categoryLabels: Record<string, string> = {
    lost_found: "失物招领",
    market: "二手交易",
    info: "信息发布",
  };

  const categoryColors: Record<string, string> = {
    lost_found: "orange",
    market: "green",
    info: "blue",
  };

  const statusLabels: Record<string, string> = {
    active: "活跃",
    resolved: "已解决",
    closed: "已关闭",
  };

  const statusColors: Record<string, string> = {
    active: "green",
    resolved: "blue",
    closed: "default",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Text type="secondary">加载中...</Text>
      </div>
    );
  }

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Post) => {
        const href =
          record.category === "market"
            ? `/market/${record.id}`
            : record.category === "lost_found"
            ? `/lost-found/${record.id}`
            : `/lost-found/${record.id}`;
        return (
          <Link href={href} style={{ color: "#4f46e5", fontWeight: 500 }}>
            {text}
          </Link>
        );
      },
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color={categoryColors[cat]}>{categoryLabels[cat]}</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "价格",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price > 0 ? <Text type="danger">¥{price}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "发布时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (t: string) => <Text type="secondary">{t}</Text>,
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Post) => (
        <Popconfirm
          title="确定要删除这条信息吗？"
          onConfirm={() => handleDeletePost(record.id)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      {contextHolder}

      {/* User Info Header */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          border: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Avatar
            size={72}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(10px)",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || <UserOutlined />}
          </Avatar>
          <div style={{ color: "#fff" }}>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              {user?.username}
            </Title>
            <div style={{ marginTop: 6, display: "flex", gap: 12, alignItems: "center" }}>
              {user?.is_admin && (
                <Tag color="gold" style={{ border: "none" }}>
                  管理员
                </Tag>
              )}
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                注册时间：{user?.created_at}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: (
              <span>
                <UserOutlined /> 个人信息
              </span>
            ),
            children: (
              <Card
                style={{ borderRadius: 16, border: "1px solid #f0f0f0" }}
                title={
                  <span style={{ fontWeight: 600 }}>
                    <EditOutlined style={{ marginRight: 8, color: "#4f46e5" }} />
                    编辑联系方式
                  </span>
                }
              >
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  style={{ maxWidth: 500 }}
                >
                  <Form.Item label="用户名">
                    <Input value={user?.username} disabled prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item
                    name="contact"
                    label="联系方式"
                    rules={[{ max: 100, message: "最多100个字符" }]}
                  >
                    <Input
                      placeholder="微信号 / QQ / 手机号"
                      prefix={<ProfileOutlined />}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={profileSaving}
                      style={{
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        border: "none",
                        fontWeight: 500,
                      }}
                    >
                      保存
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: "password",
            label: (
              <span>
                <LockOutlined /> 修改密码
              </span>
            ),
            children: (
              <Card
                style={{ borderRadius: 16, border: "1px solid #f0f0f0" }}
                title={
                  <span style={{ fontWeight: 600 }}>
                    <LockOutlined style={{ marginRight: 8, color: "#4f46e5" }} />
                    设置新密码
                  </span>
                }
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  style={{ maxWidth: 500 }}
                >
                  <Form.Item
                    name="old_password"
                    label="当前密码"
                    rules={[{ required: true, message: "请输入当前密码" }]}
                  >
                    <Input.Password
                      placeholder="请输入当前密码"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="new_password"
                    label="新密码"
                    rules={[
                      { required: true, message: "请输入新密码" },
                      { min: 6, message: "密码至少6个字符" },
                    ]}
                  >
                    <Input.Password
                      placeholder="至少6个字符"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirm_password"
                    label="确认新密码"
                    rules={[{ required: true, message: "请确认新密码" }]}
                  >
                    <Input.Password
                      placeholder="再次输入新密码"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={passwordSaving}
                      style={{
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        border: "none",
                        fontWeight: 500,
                      }}
                    >
                      修改密码
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: "posts",
            label: (
              <span>
                <ProfileOutlined /> 我的发布
              </span>
            ),
            children: (
              <Card
                style={{ borderRadius: 16, border: "1px solid #f0f0f0" }}
                title={
                  <span style={{ fontWeight: 600 }}>
                    <ProfileOutlined style={{ marginRight: 8, color: "#4f46e5" }} />
                    我发布的信息（共 {postsTotal} 条）
                  </span>
                }
              >
                {myPosts.length === 0 && !postsLoading ? (
                  <Empty
                    description="还没有发布过信息"
                    style={{ padding: "40px 0" }}
                  >
                    <Link href="/post/create">
                      <Button
                        type="primary"
                        style={{
                          borderRadius: 8,
                          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                          border: "none",
                        }}
                      >
                        去发布
                      </Button>
                    </Link>
                  </Empty>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={myPosts}
                    rowKey="id"
                    loading={postsLoading}
                    pagination={{
                      current: postsPage,
                      total: postsTotal,
                      pageSize: 10,
                      onChange: (page) => loadMyPosts(page),
                      showSizeChanger: false,
                    }}
                    scroll={{ x: 600 }}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
