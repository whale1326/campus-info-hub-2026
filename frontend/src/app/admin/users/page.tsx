"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card, Table, Button, Input, Tag, Popconfirm, message, Space, Typography,
} from "antd";
import { DeleteOutlined, SearchOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { adminApi, isAdmin, type AdminUser } from "@/lib/api";

const { Title } = Typography;

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const fetchData = useCallback(
    (p = page, kw = keyword) => {
      if (!isAdmin()) {
        router.push("/login");
        return;
      }
      setLoading(true);
      adminApi
        .listUsers({ page: p, keyword: kw })
        .then((data) => {
          setUsers(data.users);
          setTotal(data.total);
        })
        .catch(() => message.error("加载用户列表失败"))
        .finally(() => setLoading(false));
    },
    [page, keyword, router]
  );

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleDelete = (id: number, username: string) => {
    adminApi
      .deleteUser(id)
      .then(() => {
        message.success(`已删除用户: ${username}`);
        fetchData(page, keyword);
      })
      .catch((e) => message.error(e.message || "删除失败"));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: AdminUser) => (
        <Space>
          <span>{text}</span>
          {record.is_admin && <Tag color="red">管理员</Tag>}
        </Space>
      ),
    },
    {
      title: "联系方式",
      dataIndex: "contact",
      key: "contact",
      render: (text: string) => text || <span style={{ color: "#ccc" }}>-</span>,
    },
    {
      title: "注册时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => text?.slice(0, 19),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: AdminUser) =>
        record.is_admin ? (
          <span style={{ color: "#ccc" }}>系统管理员</span>
        ) : (
          <Popconfirm
            title="确认删除该用户？"
            description="将同时删除该用户的所有帖子，不可恢复。"
            onConfirm={() => handleDelete(record.id, record.username)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin")}>
          返回后台
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          用户管理
        </Title>
      </Space>

      <Card style={{ borderRadius: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索用户名"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchData(1, keyword);
            }}
            style={{ width: 240 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              fetchData(1, keyword);
            }}
          >
            搜索
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: (p) => {
              setPage(p);
              fetchData(p, keyword);
            },
          }}
        />
      </Card>
    </div>
  );
}
